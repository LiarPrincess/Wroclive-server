import { VehicleLocationFromApi } from '../models';
import { calculateDistanceInMeters, calculateHeading } from '../helpers';

/* ============== */
/* === Config === */
/* ============== */

/** Min distance that vehicle has to move to update its heading (in meters). */
export const minMovementToUpdateHeading = 30;

/* ============== */
/* === Types === */
/* ============== */

export class LastAngleUpdateLocation {
  public constructor(
    public readonly lat: number,
    public readonly lng: number,
    public readonly angle: number
  ) { }
}

export interface VehicleIdToLastAngleUpdateLocation {
  [key: string]: LastAngleUpdateLocation | undefined;
}

/* ============ */
/* === Main === */
/* ============ */

export abstract class AngleCalculatorBase {

  /**
   * Last place at which we updated vehicle angle/heading.
   */
  protected vehicleIdToLastAngleUpdateLocation: VehicleIdToLastAngleUpdateLocation | undefined;

  public async calculateAngle(vehicle: VehicleLocationFromApi): Promise<number> {
    const id = vehicle.id;
    const lat = vehicle.lat;
    const lng = vehicle.lng;

    const vehicleIdToLastAngleUpdateLocation = await this.getLastVehicleAngleUpdateLocations();
    const lastUpdateLocation = vehicleIdToLastAngleUpdateLocation[vehicle.id];
    if (lastUpdateLocation === undefined) {
      const angle = 0.0;
      vehicleIdToLastAngleUpdateLocation[id] = new LastAngleUpdateLocation(lat, lng, angle);
      return angle;
    }

    const oldLat = lastUpdateLocation.lat;
    const oldLng = lastUpdateLocation.lng;

    const movement = calculateDistanceInMeters(oldLat, oldLng, lat, lng);
    if (movement < minMovementToUpdateHeading) {
      return lastUpdateLocation.angle;
    }

    const angle = calculateHeading(oldLat, oldLng, lat, lng);
    vehicleIdToLastAngleUpdateLocation[id] = new LastAngleUpdateLocation(lat, lng, angle);
    return angle;
  }

  private async getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLastAngleUpdateLocation> {
    const fromMemory = this.vehicleIdToLastAngleUpdateLocation;
    if (fromMemory !== undefined) {
      return fromMemory;
    }

    // Sometimes Google restarts AppEngine instances.
    // We will store the last heading locations in the database.
    const fromDatabase = await this.getLastVehicleAngleUpdateLocationsFromDatabase();
    const result = fromDatabase || {};
    this.vehicleIdToLastAngleUpdateLocation = result;
    return result;
  }

  protected abstract getLastVehicleAngleUpdateLocationsFromDatabase(): Promise<VehicleIdToLastAngleUpdateLocation | undefined>;
}
