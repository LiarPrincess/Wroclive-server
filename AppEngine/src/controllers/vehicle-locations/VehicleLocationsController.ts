import { MpkVehicleProviderType } from './mpk';
import { OpenDataVehicleProviderType } from './open-data';
import { LineCollection, LineLocation, LineLocationCollection } from './models';
import { VehicleLocationsControllerType } from './VehicleLocationsControllerType';
import { subtractMilliseconds } from './math';

const second = 1000;
const minute = 60 * second;

export const timeForWhichToUsePreviousResultIfAllProvidersFailed = 2 * minute;

export interface LineProviderType {
  /**
   * Get all of the available lines.
   */
  getLines(): LineCollection;
}

export type DateProvider = () => Date;

interface LineLocationsByLineNameLowercase {
  [key: string]: LineLocation | undefined;
}

// Our state is a simple finite-state machine:
// - Initial -> SuccessfulUpdate|FailedUpdate
// - SuccessfulUpdate -> SuccessfulUpdate|FailedUpdate
// - FailedUpdate -> SuccessfulUpdate|FailedUpdate
type State =
  {
    kind: 'Initial',
    lineLocations: LineLocationCollection
  } | {
    kind: 'SuccessfulUpdate',
    date: Date,
    timestamp: string,
    lineLocationsByLineNameLowercase: LineLocationsByLineNameLowercase
  } | {
    kind: 'FailedUpdate',
    lineLocations: LineLocationCollection
  };

export class VehicleLocationsController extends VehicleLocationsControllerType {

  private readonly lineProvider: LineProviderType;
  private readonly openDataProvider: OpenDataVehicleProviderType;
  private readonly mpkProvider: MpkVehicleProviderType;
  private readonly dateProvider: DateProvider;

  private state: State;

  constructor(
    lineProvider: LineProviderType,
    openDataProvider: OpenDataVehicleProviderType,
    mpkProvider: MpkVehicleProviderType,
    dateProvider?: DateProvider
  ) {
    super();

    this.lineProvider = lineProvider;
    this.openDataProvider = openDataProvider;
    this.mpkProvider = mpkProvider;
    this.dateProvider = dateProvider || (() => new Date());

    const lineLocations = new LineLocationCollection('INITIAL_TIMESTAMP', []);
    this.state = { kind: 'Initial', lineLocations };
  }

  getVehicleLocations(lineNamesLowercase: Set<string>): LineLocationCollection {
    switch (this.state.kind) {
      case 'Initial':
        return this.state.lineLocations;

      case 'SuccessfulUpdate':
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

      case 'FailedUpdate':
        return this.state.lineLocations;
    }
  }

  async updateVehicleLocations(): Promise<void> {
    const now = this.dateProvider();
    const lines = this.lineProvider.getLines();

    this.openDataProvider.lineDatabase.updateLineDefinitions(lines);
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

    this.mpkProvider.lineDatabase.updateLineDefinitions(lines);
    const mpkResult = await this.mpkProvider.getVehicleLocations();
    let mpkError = '';

    switch (mpkResult.kind) {
      case 'Success':
        this.handleLineLocationsFromProvider(now, mpkResult.lineLocations);
        return;
      case 'ApiError':
      case 'ResponseContainsNoVehicles':
      case 'NoVehicleHasMovedInLastFewMinutes':
        mpkError = mpkResult.kind;
        break;
    }

    switch (this.state.kind) {
      case 'Initial':
        const timestamp = this.createTimestamp(now);
        const data = this.state.lineLocations.data;
        const lineLocations = new LineLocationCollection(timestamp, data);
        this.state = { kind: 'FailedUpdate', lineLocations };
        break;

      case 'SuccessfulUpdate':
        const timeSinceUpdate = subtractMilliseconds(now, this.state.date);
        if (timeSinceUpdate > timeForWhichToUsePreviousResultIfAllProvidersFailed) {
          // TODO: Report CRITICAL error!

          const timestamp = this.createTimestamp(now);
          const lineLocations = new LineLocationCollection(timestamp, []);
          this.state = { kind: 'FailedUpdate', lineLocations };
        }
        break;

      case 'FailedUpdate':
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
      kind: 'SuccessfulUpdate',
      date: now,
      timestamp,
      lineLocationsByLineNameLowercase
    };
  }

  private createTimestamp(now: Date): string {
    return now.toISOString();
  }
}
