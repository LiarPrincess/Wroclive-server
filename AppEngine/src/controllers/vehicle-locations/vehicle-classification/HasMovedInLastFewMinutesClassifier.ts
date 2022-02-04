import { VehicleLocationFromApi } from '../models';
import { subtractMilliseconds, calculateDistanceInMeters } from '../math';

/* ============== */
/* === Config === */
/* ============== */

const second = 1000;
const minute = 60 * second;

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
  constructor(
    public readonly date: Date,
    public readonly value: VehicleLocationFromApi
  ) { }
}

interface PreviousLocationByVehicleId {
  [key: string]: PreviousLocation | undefined;
}

type DateProvider = () => Date;

/* ============ */
/* === Main === */
/* ============ */

export interface HasMovedInLastFewMinutesClassifierType {
  prepareForClassification(): void;
  hasMovedInLastFewMinutes(vehicle: VehicleLocationFromApi): boolean;
}

/**
 * Vehicle is stale if it has not moved for some time.
 * This may also mean that the data provider hangs.
 */
export class HasMovedInLastFewMinutesClassifier implements HasMovedInLastFewMinutesClassifierType {

  private readonly previousLocationByVehicleId: PreviousLocationByVehicleId;
  private readonly dateProvider: DateProvider;
  private now: Date;

  constructor(dateProvider?: DateProvider) {
    this.previousLocationByVehicleId = {};
    this.dateProvider = dateProvider || (() => new Date());
    this.now = this.dateProvider();
  }

  prepareForClassification(): void {
    this.now = this.dateProvider();
  }

  hasMovedInLastFewMinutes(vehicle: VehicleLocationFromApi): boolean {
    const id = vehicle.id;
    const previousLocation = this.previousLocationByVehicleId[id];
    const now = this.now;

    // 1st update -> remember result.
    if (!previousLocation) {
      this.previousLocationByVehicleId[id] = new PreviousLocation(now, vehicle);
      return true;
    }

    // Different location -> not stale.
    const oldVehicle = previousLocation.value;
    const movement = calculateDistanceInMeters(oldVehicle.lat, oldVehicle.lng, vehicle.lat, vehicle.lng);
    if (movement >= minMovement) {
      this.previousLocationByVehicleId[id] = new PreviousLocation(now, vehicle);
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
