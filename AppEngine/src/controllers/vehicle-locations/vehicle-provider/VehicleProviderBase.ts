// This dir
import { AngleCalculatorType } from "./AngleCalculator";
import { DepotClassifierType } from "./DepotClassifier";
import { createLineFromName } from "./createLineFromName";
import { VehicleProviderDatabaseType } from "./VehicleProviderDatabase";
import { HasMovedInLastFewMinutesClassifierType } from "./HasMovedInLastFewMinutesClassifier";
import { LineScheduleClassifierType, Time, getCurrentTimeInWroclaw } from "./LineScheduleClassifier";
// Parent dir
import { subtractMilliseconds, minute } from "../helpers";
import { Line, LineLocation, LineLocationLine, VehicleLocation, VehicleLocationFromApi } from "../models";

/* ============== */
/* === Config === */
/* ============== */

/**
 * Vehicle was not updated -> how long do we show it?
 */
export const removeVehiclesWithoutUpdateAfter = 1 * minute;

/* ============== */
/* === Types === */
/* ============== */

export type VehicleLocations =
  | { kind: "Success"; lineLocations: LineLocation[] }
  | { kind: "ApiError" }
  | { kind: "ResponseContainsNoVehicles" }
  | { kind: "NoVehicleHasMovedInLastFewMinutes" };

export type UpdateResult =
  | { kind: "Success"; lineLocations: LineLocation[] }
  | { kind: "ResponseContainsNoVehicles" }
  | { kind: "NoVehicleHasMovedInLastFewMinutes" };

export interface DateProviderResult {
  readonly now: Date;
  readonly currentTimeInWroclaw: Time;
}

export type DateProvider = () => DateProviderResult;

function dateProviderDefault(): DateProviderResult {
  const now = new Date();
  const currentTimeInWroclaw = getCurrentTimeInWroclaw();
  return { now, currentTimeInWroclaw };
}

// This is an implementation detail, and it should not be exposed to the outside.
export class VehicleState {
  constructor(
    public readonly id: string,
    public readonly line: Line,
    public readonly lat: number,
    public readonly lng: number,
    public readonly angle: number,
    public readonly lastUpdateDate: Date
  ) {}
}

/* ============ */
/* === Main === */
/* ============ */

export abstract class VehicleProviderBase<Database extends VehicleProviderDatabaseType> {
  private readonly dateProvider: DateProvider;
  private readonly vehicleIdToState = new Map<string, VehicleState>();

  protected constructor(
    protected readonly database: Database,
    private readonly angleCalculator: AngleCalculatorType,
    private readonly depotClassifier?: DepotClassifierType,
    private readonly lineScheduleClassifier?: LineScheduleClassifierType,
    private readonly hasMovedInLastFewMinutesClassifier?: HasMovedInLastFewMinutesClassifierType,
    dateProvider?: DateProvider
  ) {
    this.dateProvider = dateProvider || dateProviderDefault;
  }

  public abstract getVehicleLocations(): Promise<VehicleLocations>;

  protected async updateState(vehicleLocations: VehicleLocationFromApi[]): Promise<UpdateResult> {
    if (vehicleLocations.length === 0) {
      return { kind: "ResponseContainsNoVehicles" };
    }

    const { now, currentTimeInWroclaw: timeInWroclaw } = this.dateProvider();

    const lines = await this.database.getLines();
    const lineNameLowercaseToLine = new Map<string, Line>();

    for (const line of lines) {
      const nameLowercase = line.name.toLowerCase();
      lineNameLowercaseToLine.set(nameLowercase, line);
    }

    // Check if any of the vehicles has moved the last few minutes.
    // It may be possible that api hangs (returns the same data over and over).
    let hasAnyVehicleMovedInLastFewMinutes = false;

    for (const vehicle of vehicleLocations) {
      let line: Line;
      const lineNameLowercase = vehicle.line.toLowerCase();
      const lineOrUndefined = lineNameLowercaseToLine.get(lineNameLowercase);

      if (lineOrUndefined !== undefined) {
        line = lineOrUndefined;
      } else {
        line = createLineFromName(vehicle.line);
        lineNameLowercaseToLine.set(lineNameLowercase, line);
      }

      const hasMoved = this.hasMoved(now, vehicle);
      const isInDepot = this.isInDepot(now, vehicle);
      const isWithinSchedule = this.isWithinSchedule(timeInWroclaw, line);

      // If the vehicle has not moved - we still want to show it. Maybe a tram
      // broke in the middle of Powstancow and all of the other wait int line.
      hasAnyVehicleMovedInLastFewMinutes = hasAnyVehicleMovedInLastFewMinutes || hasMoved;
      const isUpdated = !isInDepot && isWithinSchedule;

      if (isUpdated) {
        const angle = await this.angleCalculator.calculateAngle(now, vehicle);
        const state = new VehicleState(vehicle.id, line, vehicle.lat, vehicle.lng, angle, now);
        this.vehicleIdToState.set(vehicle.id, state);
      }
    }

    // VERY IMPORTANT!
    await this.angleCalculator.saveStateInDatabase(now);

    if (!hasAnyVehicleMovedInLastFewMinutes) {
      return { kind: "NoVehicleHasMovedInLastFewMinutes" };
    }

    const vehicleIdsToRemove = new Set<string>();
    const lineNameLowercaseToLineLocations = new Map<string, LineLocation>();

    for (const [id, state] of this.vehicleIdToState) {
      const timeSinceUpdate = subtractMilliseconds(now, state.lastUpdateDate);

      if (timeSinceUpdate > removeVehiclesWithoutUpdateAfter) {
        vehicleIdsToRemove.add(id);
        continue;
      }

      let lineLocations: LineLocation;
      const line = state.line;
      const lineNameLowercase = line.name.toLowerCase();
      const lineLocationOrUndefined = lineNameLowercaseToLineLocations.get(lineNameLowercase);

      if (lineLocationOrUndefined !== undefined) {
        lineLocations = lineLocationOrUndefined;
      } else {
        const lineData = new LineLocationLine(line.name, line.type, line.subtype);
        lineLocations = new LineLocation(lineData, []);
        lineNameLowercaseToLineLocations.set(lineNameLowercase, lineLocations);
      }

      const vehicleLocation = new VehicleLocation(id, state.lat, state.lng, state.angle);
      lineLocations.vehicles.push(vehicleLocation);
    }

    for (const id of vehicleIdsToRemove) {
      this.vehicleIdToState.delete(id);
    }

    const lineLocationsIterable = lineNameLowercaseToLineLocations.values();
    const lineLocations = Array.from(lineLocationsIterable);
    return { kind: "Success", lineLocations };
  }

  /** By default we are not in depot. */
  private isInDepot(now: Date, vehicle: VehicleLocationFromApi): boolean {
    if (this.depotClassifier === undefined) {
      return false;
    }

    return this.depotClassifier.isInDepot(now, vehicle);
  }

  /**By default we are within schedule.*/
  private isWithinSchedule(timeInWroclaw: Time, line: Line): boolean {
    if (this.lineScheduleClassifier === undefined) {
      return true;
    }

    return this.lineScheduleClassifier?.isWithinScheduleTimeFrame(timeInWroclaw, line);
  }

  /**By default the vehicle has moved.*/
  private hasMoved(now: Date, vehicle: VehicleLocationFromApi): boolean {
    if (this.hasMovedInLastFewMinutesClassifier === undefined) {
      return true;
    }

    return this.hasMovedInLastFewMinutesClassifier.hasMovedInLastFewMinutes(now, vehicle);
  }

  protected assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
  }
}
