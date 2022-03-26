import { VehicleLocationFromApi } from '../models';
import { calculateDistanceInMeters, calculateHeading, minute, second } from '../helpers';

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

export type DateProvider = () => Date;

export class LastAngleUpdateLocation {
  public constructor(
    public readonly lat: number,
    public readonly lng: number,
    public readonly angle: number,
    public readonly millisecondsSince1970: number,
  ) { }
}

export interface VehicleIdToLastAngleUpdateLocation {
  [key: string]: LastAngleUpdateLocation | undefined;
}

/* ============ */
/* === Main === */
/* ============ */

export abstract class AngleCalculatorBase {

  /** Last place at which we updated vehicle angle/heading. */
  protected vehicleIdToLastAngleUpdateLocation: VehicleIdToLastAngleUpdateLocation | undefined;
  /** We want all of the vehicles in a single batch to get the same date. */
  private nowAsMillisecondsSince1970: number = 0;
  private lastStoreAsMillisecondsSince1970 = 0;
  private readonly dateProvider: DateProvider;

  public constructor(dateProvider?: DateProvider) {
    this.dateProvider = dateProvider || (() => new Date());
  }

  /* ======================= */
  /* === Calculate angle === */
  /* ======================= */

  public prepareForAngleCalculation() {
    const now = this.dateProvider();
    this.nowAsMillisecondsSince1970 = now.getTime();
  }

  public async calculateAngle(vehicle: VehicleLocationFromApi): Promise<number> {
    const id = vehicle.id;
    const lat = vehicle.lat;
    const lng = vehicle.lng;
    const now1970 = this.nowAsMillisecondsSince1970;

    const vehicleIdToLastAngleUpdateLocation = await this.getLastAngleUpdateLocations();
    const lastUpdateLocation = vehicleIdToLastAngleUpdateLocation[id];
    if (lastUpdateLocation === undefined || this.hasExpired(lastUpdateLocation, now1970)) {
      const angle = 0.0;
      vehicleIdToLastAngleUpdateLocation[id] = new LastAngleUpdateLocation(lat, lng, angle, now1970);
      return angle;
    }

    const oldLat = lastUpdateLocation.lat;
    const oldLng = lastUpdateLocation.lng;

    const movement = calculateDistanceInMeters(oldLat, oldLng, lat, lng);
    if (movement < minMovementToUpdateHeading) {
      return lastUpdateLocation.angle;
    }

    const angle = calculateHeading(oldLat, oldLng, lat, lng);
    vehicleIdToLastAngleUpdateLocation[id] = new LastAngleUpdateLocation(lat, lng, angle, now1970);
    return angle;
  }

  private async getLastAngleUpdateLocations(): Promise<VehicleIdToLastAngleUpdateLocation> {
    if (this.vehicleIdToLastAngleUpdateLocation !== undefined) {
      return this.vehicleIdToLastAngleUpdateLocation;
    }

    const data = await this.getUpdateLocationsFromDatabase() || {};
    this.vehicleIdToLastAngleUpdateLocation = data;
    return data;
  }

  private hasExpired(location: LastAngleUpdateLocation, now: number): boolean {
    const timeSinceLastUpdateLocation = now - location.millisecondsSince1970;
    return timeSinceLastUpdateLocation > locationExpirationInMilliseconds;
  }

  protected abstract getUpdateLocationsFromDatabase(): Promise<VehicleIdToLastAngleUpdateLocation | undefined>;

  /* ============= */
  /* === Store === */
  /* ============= */

  public async storeLastVehicleAngleUpdateLocationInDatabase() {
    const locations = this.vehicleIdToLastAngleUpdateLocation;
    if (locations === undefined) {
      return;
    }

    const now = this.dateProvider();
    const nowAsMillisecondsSince1970 = now.getTime();
    const sinceLastStore = nowAsMillisecondsSince1970 - this.lastStoreAsMillisecondsSince1970;

    if (sinceLastStore <= storeInDatabaseIntervalInMilliseconds) {
      return;
    }

    // Firestore limits the number of keys in an object.
    // If we go too crazy with the past data then the save will fail.
    // (This failure is very reliable, it happens after ~1 day.)

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
    this.storeUpdateLocationsInDatabase(withoutPast);
  }

  protected abstract storeUpdateLocationsInDatabase(locations: VehicleIdToLastAngleUpdateLocation): Promise<void>;
}
