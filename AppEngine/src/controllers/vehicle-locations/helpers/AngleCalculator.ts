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

class VehicleLocation {
  constructor(
    public readonly lat: number,
    public readonly lng: number,
    public readonly angle: number
  ) { }
}

interface VehicleLocationByVehicleId {
  [key: string]: VehicleLocation | undefined;
}

/* ============ */
/* === Main === */
/* ============ */

export class AngleCalculator {

  /**
   * Last place at which we updated vehicle angle/heading.
   */
  private lastVehicleAngleUpdateLocationById: VehicleLocationByVehicleId = {};

  constructor() {
    this.lastVehicleAngleUpdateLocationById = {};
  }

  calculateAngle(vehicle: VehicleLocationFromApi): number {
    const id = vehicle.id;
    const lat = vehicle.lat;
    const lng = vehicle.lng;

    const lastUpdateLocation = this.lastVehicleAngleUpdateLocationById[vehicle.id];
    if (!lastUpdateLocation) {
      const angle = 0.0;
      this.lastVehicleAngleUpdateLocationById[id] = new VehicleLocation(lat, lng, angle);
      return angle;
    }

    const oldLat = lastUpdateLocation.lat;
    const oldLng = lastUpdateLocation.lng;

    const movement = calculateDistanceInMeters(oldLat, oldLng, lat, lng);
    if (movement < minMovementToUpdateHeading) {
      return lastUpdateLocation.angle;
    }

    const angle = calculateHeading(oldLat, oldLng, lat, lng);
    this.lastVehicleAngleUpdateLocationById[id] = new VehicleLocation(lat, lng, angle);
    return angle;
  }
}
