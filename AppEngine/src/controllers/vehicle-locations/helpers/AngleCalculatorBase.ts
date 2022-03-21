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
  protected vehicleIdToLastAngleUpdateLocation: VehicleIdToLastAngleUpdateLocation = {};
  /**
   * Sometimes Google restarts AppEngine instances.
   * We will store the last heading locations in the database.
   *
   * We want to have a separate 'vehicleIdToLastAngleUpdateLocation' and the
   * 'databaseVehicleIdToLastAngleUpdateLocation' because of the Firestore limit
   * on number of keys in an object. If we go too crazy with the past data then
   * the save will fail.
   */
  private databaseVehicleIdToLastAngleUpdateLocation: VehicleIdToLastAngleUpdateLocation | undefined;

  public async calculateAngle(vehicle: VehicleLocationFromApi): Promise<number> {
    const id = vehicle.id;
    const lat = vehicle.lat;
    const lng = vehicle.lng;

    const lastUpdateLocation = await this.getLastVehicleAngleUpdateLocation(id);
    if (lastUpdateLocation === undefined) {
      const angle = 0.0;
      this.vehicleIdToLastAngleUpdateLocation[id] = new LastAngleUpdateLocation(lat, lng, angle);
      return angle;
    }

    const oldLat = lastUpdateLocation.lat;
    const oldLng = lastUpdateLocation.lng;

    const movement = calculateDistanceInMeters(oldLat, oldLng, lat, lng);
    if (movement < minMovementToUpdateHeading) {
      return lastUpdateLocation.angle;
    }

    const angle = calculateHeading(oldLat, oldLng, lat, lng);
    this.vehicleIdToLastAngleUpdateLocation[id] = new LastAngleUpdateLocation(lat, lng, angle);
    return angle;
  }

  private async getLastVehicleAngleUpdateLocation(vehicleId: string): Promise<LastAngleUpdateLocation | undefined> {
    const location = this.vehicleIdToLastAngleUpdateLocation[vehicleId];
    if (location !== undefined) {
      return location;
    }

    let databaseData = this.databaseVehicleIdToLastAngleUpdateLocation;
    if (databaseData === undefined) {
      databaseData = await this.getLastVehicleAngleUpdateLocationsFromDatabase();
      this.databaseVehicleIdToLastAngleUpdateLocation = databaseData;
    }

    // Not really sure why this would be undefined, but TypeScript says so...
    if (databaseData !== undefined) {
      return databaseData[vehicleId];
    }

    return undefined;
  }

  protected abstract getLastVehicleAngleUpdateLocationsFromDatabase(): Promise<VehicleIdToLastAngleUpdateLocation | undefined>;
}
