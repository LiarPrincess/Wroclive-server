import { VehicleLocationFromApi } from "../models";
import { VehicleIdToDatabaseLocation } from "../database";
import { calculateDistanceInMeters, calculateHeading, minute, second } from "../helpers";

/* ============== */
/* === Config === */
/* ============== */

/** Min distance that vehicle has to move to update its heading (in meters). */
export const minMovementToUpdateHeading = 30;
/** After this time the previous location is unusable. */
export const locationExpirationInMilliseconds = 10 * minute;
/**
 * Sometimes Google restarts AppEngine instances.
 * We will store the last heading update locations in the database.
 */
export const storeInDatabaseIntervalInMilliseconds = 30 * second;

/* ============== */
/* === Types === */
/* ============== */

export class LastAngleUpdateLocation {
  public constructor(
    public readonly lat: number,
    public readonly lng: number,
    public readonly angle: number,
    public readonly millisecondsSince1970: number
  ) {}
}

export interface VehicleIdToLastAngleUpdateLocation {
  [key: string]: LastAngleUpdateLocation | undefined;
}

/* ============ */
/* === Main === */
/* ============ */

export interface AngleCalculatorType {
  calculateAngle(now: Date, vehicle: VehicleLocationFromApi): Promise<number>;
  saveStateInDatabase(now: Date): Promise<void>;
}

export interface AngleCalculatorDatabaseType {
  getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToDatabaseLocation | undefined>;
  saveLastVehicleAngleUpdateLocations(locations: VehicleIdToDatabaseLocation): Promise<void>;
}

export class AngleCalculator implements AngleCalculatorType {
  private readonly database: AngleCalculatorDatabaseType;
  /** Last place at which we updated vehicle angle/heading. */
  protected vehicleIdToLastAngleUpdateLocation: VehicleIdToLastAngleUpdateLocation = {};
  /** Date of the last database save. */
  private lastStoreAsMillisecondsSince1970 = 0;
  private hasRetrievedLastAngleUpdateLocationFromDatabase = false;

  public constructor(database: AngleCalculatorDatabaseType) {
    this.database = database;
  }

  /* ======================= */
  /* === Calculate angle === */
  /* ======================= */

  public async calculateAngle(now: Date, vehicle: VehicleLocationFromApi): Promise<number> {
    const id = vehicle.id;
    const lat = vehicle.lat;
    const lng = vehicle.lng;
    const nowAsMillisecondsSince1970 = now.getTime();

    const vehicleIdToLastAngleUpdateLocation = await this.getLastAngleUpdateLocations();
    const lastUpdateLocation = vehicleIdToLastAngleUpdateLocation[id];

    if (lastUpdateLocation === undefined || this.hasExpired(lastUpdateLocation, nowAsMillisecondsSince1970)) {
      const angle = 0.0;
      vehicleIdToLastAngleUpdateLocation[id] = new LastAngleUpdateLocation(lat, lng, angle, nowAsMillisecondsSince1970);
      return angle;
    }

    const oldLat = lastUpdateLocation.lat;
    const oldLng = lastUpdateLocation.lng;

    const movement = calculateDistanceInMeters(oldLat, oldLng, lat, lng);
    if (movement < minMovementToUpdateHeading) {
      return lastUpdateLocation.angle;
    }

    const angle = calculateHeading(oldLat, oldLng, lat, lng);
    vehicleIdToLastAngleUpdateLocation[id] = new LastAngleUpdateLocation(lat, lng, angle, nowAsMillisecondsSince1970);
    return angle;
  }

  private async getLastAngleUpdateLocations(): Promise<VehicleIdToLastAngleUpdateLocation> {
    if (this.hasRetrievedLastAngleUpdateLocationFromDatabase) {
      return this.vehicleIdToLastAngleUpdateLocation;
    }

    const db = await this.database.getLastVehicleAngleUpdateLocations();
    const data = db || {};

    this.vehicleIdToLastAngleUpdateLocation = data;
    this.hasRetrievedLastAngleUpdateLocationFromDatabase = true;

    return data;
  }

  private hasExpired(location: LastAngleUpdateLocation, now: number): boolean {
    const timeSinceLastUpdateLocation = now - location.millisecondsSince1970;
    return timeSinceLastUpdateLocation > locationExpirationInMilliseconds;
  }

  /* ============= */
  /* === Store === */
  /* ============= */

  public async saveStateInDatabase(now: Date) {
    const nowAsMillisecondsSince1970 = now.getTime();
    const sinceLastStore = nowAsMillisecondsSince1970 - this.lastStoreAsMillisecondsSince1970;

    if (sinceLastStore <= storeInDatabaseIntervalInMilliseconds) {
      return;
    }

    // Firestore limits the number of keys in an object.
    // If we go too crazy with the past data then the save will fail.
    // (This failure is very reliable, it happens after ~1 day.)
    const locations = this.vehicleIdToLastAngleUpdateLocation;
    const withoutPast: VehicleIdToLastAngleUpdateLocation = {};

    for (const vehicleId in locations) {
      if (!Object.prototype.hasOwnProperty.call(locations, vehicleId)) {
        continue;
      }

      const loc = locations[vehicleId];

      if (loc === undefined || this.hasExpired(loc, nowAsMillisecondsSince1970)) {
        continue;
      }

      withoutPast[vehicleId] = loc;
    }

    this.vehicleIdToLastAngleUpdateLocation = withoutPast;
    this.lastStoreAsMillisecondsSince1970 = nowAsMillisecondsSince1970;
    this.database.saveLastVehicleAngleUpdateLocations(withoutPast);
  }
}

/* ============ */
/* === Mock === */
/* ============ */

export class AngleCalculatorMock implements AngleCalculatorType {
  public vehicleIdToAngle = new Map<string, number>();
  public calculateAngleCallCount = 0;

  public constructor(vehicles: { id: string; angle: number }[] = []) {
    for (const v of vehicles) {
      this.vehicleIdToAngle.set(v.id, v.angle);
    }
  }

  public add(vehicle: { id: string; angle: number }) {
    this.vehicleIdToAngle.set(vehicle.id, vehicle.angle);
  }

  public async calculateAngle(now: Date, vehicle: VehicleLocationFromApi): Promise<number> {
    this.calculateAngleCallCount += 1;

    const id = vehicle.id;
    const result = this.vehicleIdToAngle.get(id);

    if (result !== undefined) {
      return result;
    }

    throw new Error(`[AngleCalculatorMock.calculateAngle] Unknown vehicle id: ${id}`);
  }

  public saveStateInDatabaseCallCount = 0;

  public async saveStateInDatabase(now: Date) {
    this.saveStateInDatabaseCallCount += 1;
  }
}

export class AngleCalculatorDatabaseMock {
  public getAngleLocationsResult: VehicleIdToDatabaseLocation = {};
  public getAngleLocationsCallCount = 0;

  public async getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToDatabaseLocation | undefined> {
    if (this.getAngleLocationsResult === undefined) {
      throw new Error("[DatabaseMock.getLastVehicleAngleUpdateLocations] was not expected to be called.");
    }

    this.getAngleLocationsCallCount += 1;
    return this.getAngleLocationsResult;
  }

  public savedAngleLocations: VehicleIdToDatabaseLocation | undefined;
  public saveAngleLocationsCallCount = 0;

  public async saveLastVehicleAngleUpdateLocations(locations: VehicleIdToDatabaseLocation) {
    this.saveAngleLocationsCallCount += 1;
    this.savedAngleLocations = locations;
  }
}
