import { VehicleLocationFromApi } from "../models";
import { subtractMilliseconds, calculateDistanceInMeters } from "../helpers";

const second = 1000;
const minute = 60 * second;

/* ============== */
/* === Config === */
/* ============== */

/**
 * For how long do we have to stay at the same position to be considered as 'not moving'.
 */
export const timeToConsiderAsNotMoved = 5 * minute;

/**
 * Min movement (in meters) to classify vehicle as 'moved'.
 */
export const minMovement = 15;

/* ============== */
/* === Types === */
/* ============== */

class PreviousLocation {
  constructor(public readonly date: Date, public readonly value: VehicleLocationFromApi) {}
}

/* ============ */
/* === Main === */
/* ============ */

export interface HasMovedInLastFewMinutesClassifierType {
  hasMovedInLastFewMinutes(now: Date, vehicle: VehicleLocationFromApi): boolean;
}

/**
 * Vehicle is stale if it has not moved for some time.
 * This may also mean that the data provider hangs.
 */
export class HasMovedInLastFewMinutesClassifier implements HasMovedInLastFewMinutesClassifierType {
  private readonly vehicleIdToPreviousLocation = new Map<string, PreviousLocation>();

  public hasMovedInLastFewMinutes(now: Date, vehicle: VehicleLocationFromApi): boolean {
    const id = vehicle.id;
    const previousLocation = this.vehicleIdToPreviousLocation.get(id);

    // 1st update -> remember result.
    if (!previousLocation) {
      const loc = new PreviousLocation(now, vehicle);
      this.vehicleIdToPreviousLocation.set(id, loc);
      return true;
    }

    // Different location -> not stale.
    const oldVehicle = previousLocation.value;
    const movement = calculateDistanceInMeters(oldVehicle.lat, oldVehicle.lng, vehicle.lat, vehicle.lng);

    if (movement >= minMovement) {
      const loc = new PreviousLocation(now, vehicle);
      this.vehicleIdToPreviousLocation.set(id, loc);
      return true;
    }

    // Same result -> possible not moved, but wait a bit more to clarify situation.
    const timeSincePreviousLocation = subtractMilliseconds(now, previousLocation.date);
    const isWithinGracePeriod = timeSincePreviousLocation <= timeToConsiderAsNotMoved;

    if (isWithinGracePeriod) {
      return true;
    }

    // Same result, one of:
    // - vehicle has not moved (maybe it is in depot)
    // - stale -> data source hangs with the same response
    return false;
  }
}

/* ============ */
/* === Mock === */
/* ============ */

export class HasMovedInLastFewMinutesClassifierMock implements HasMovedInLastFewMinutesClassifierType {
  public movedVehicleIds = new Set<string>();
  public hasMovedInLastFewMinutesCallCount = 0;

  public constructor(vehicles: { id: string }[] = []) {
    for (const v of vehicles) {
      this.movedVehicleIds.add(v.id);
    }
  }

  public hasMovedInLastFewMinutes(now: Date, vehicle: VehicleLocationFromApi): boolean {
    this.hasMovedInLastFewMinutesCallCount += 1;
    return this.movedVehicleIds.has(vehicle.id);
  }
}
