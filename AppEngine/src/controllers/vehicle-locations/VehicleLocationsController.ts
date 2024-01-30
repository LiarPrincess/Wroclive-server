import { DatabaseType } from "./database";
import { VehicleLocations } from "./vehicle-provider";
import { VehicleLocationsControllerType } from "./VehicleLocationsControllerType";
import { IntervalErrorReporter, minute, subtractMilliseconds } from "./helpers";
import { Logger, LineLocation, LineLocationCollection } from "./models";

export const timeForWhichToUsePreviousResultIfAllProvidersFailed = 2 * minute;

export type DateProvider = () => Date;

interface LineLocationsByLineNameLowercase {
  [key: string]: LineLocation | undefined;
}

// Our state is a simple finite-state machine:
// - Initial -> SuccessfulUpdate|FailedUpdate
// - SuccessfulUpdate -> SuccessfulUpdate|FailedUpdate
// - FailedUpdate -> SuccessfulUpdate|FailedUpdate
type State =
  | {
      kind: "Initial";
      lineLocations: LineLocationCollection;
    }
  | {
      kind: "SuccessfulUpdate";
      date: Date;
      timestamp: string;
      lineLocationsByLineNameLowercase: LineLocationsByLineNameLowercase;
    }
  | {
      kind: "FailedUpdate";
      lineLocations: LineLocationCollection;
    };

export interface VehicleProviderType {
  getVehicleLocations(): Promise<VehicleLocations>;
}

export class VehicleLocationsController extends VehicleLocationsControllerType {
  private readonly openDataProvider: VehicleProviderType;
  private readonly mpkProvider: VehicleProviderType;
  private readonly logger: Logger;
  private readonly dateProvider: DateProvider;
  private readonly updateFromAllDataSourcesFailed: IntervalErrorReporter;

  private state: State;

  public constructor(
    database: DatabaseType,
    openDataProvider: VehicleProviderType,
    mpkProvider: VehicleProviderType,
    logger: Logger,
    dateProvider?: DateProvider
  ) {
    super(database);

    this.openDataProvider = openDataProvider;
    this.mpkProvider = mpkProvider;
    this.logger = logger;
    this.dateProvider = dateProvider || (() => new Date());

    this.updateFromAllDataSourcesFailed = new IntervalErrorReporter(
      5 * minute,
      "[VehicleLocationsController][CRITICAL] Update from all data sources failed!",
      logger,
      dateProvider
    );

    const lineLocations = new LineLocationCollection("INITIAL_TIMESTAMP", []);
    this.state = { kind: "Initial", lineLocations };
  }

  public getVehicleLocations(lineNamesLowercase: Set<string>): LineLocationCollection {
    switch (this.state.kind) {
      case "Initial":
        return this.state.lineLocations;

      case "SuccessfulUpdate":
        const result: LineLocation[] = [];
        const lastLineLocationsByLineName = this.state.lineLocationsByLineNameLowercase;

        for (const lineNameLowercase of lineNamesLowercase) {
          const lineLocations = lastLineLocationsByLineName[lineNameLowercase];
          if (lineLocations) {
            result.push(lineLocations);
          }
        }

        const timestamp = this.state.timestamp;
        return new LineLocationCollection(timestamp, result);

      case "FailedUpdate":
        return this.state.lineLocations;
    }
  }

  public async updateVehicleLocations(): Promise<void> {
    const now = this.dateProvider();

    const openDataResult = await this.openDataProvider.getVehicleLocations();
    let openDataError = '';

    switch (openDataResult.kind) {
      case 'Success':
        this.handleLineLocationsFromProvider(now, openDataResult.lineLocations);
        return;
      case 'ApiError':
      case 'ResponseContainsNoVehicles':
      case 'NoVehicleHasMovedInLastFewMinutes':
        openDataError = openDataResult.kind;
        break;
    }

    const mpkResult = await this.mpkProvider.getVehicleLocations();
    let mpkError = "";

    switch (mpkResult.kind) {
      case "Success":
        this.handleLineLocationsFromProvider(now, mpkResult.lineLocations);
        return;
      case "ApiError":
      case "ResponseContainsNoVehicles":
      case "NoVehicleHasMovedInLastFewMinutes":
        mpkError = mpkResult.kind;
        break;
    }

    this.updateFromAllDataSourcesFailed.report({ openDataError, mpkError });

    switch (this.state.kind) {
      case "Initial":
        const timestamp = this.createTimestamp(now);
        const data = this.state.lineLocations.data;
        const lineLocations = new LineLocationCollection(timestamp, data);
        this.state = { kind: "FailedUpdate", lineLocations };
        break;

      case "SuccessfulUpdate":
        const timeSinceUpdate = subtractMilliseconds(now, this.state.date);
        if (timeSinceUpdate > timeForWhichToUsePreviousResultIfAllProvidersFailed) {
          // The only thing we can do is to show empty map.
          const timestamp = this.createTimestamp(now);
          const lineLocations = new LineLocationCollection(timestamp, []);
          this.state = { kind: "FailedUpdate", lineLocations };
        }
        break;

      case "FailedUpdate":
        // We are already failing, nothing to do.
        break;
    }
  }

  private handleLineLocationsFromProvider(now: Date, lineLocations: LineLocation[]) {
    const lineLocationsByLineNameLowercase: LineLocationsByLineNameLowercase = {};

    for (const location of lineLocations) {
      const lineNameLowercase = location.line.name.toLowerCase();
      lineLocationsByLineNameLowercase[lineNameLowercase] = location;
    }

    const timestamp = this.createTimestamp(now);
    this.state = {
      kind: "SuccessfulUpdate",
      date: now,
      timestamp,
      lineLocationsByLineNameLowercase,
    };
  }

  private createTimestamp(now: Date): string {
    return now.toISOString();
  }
}
