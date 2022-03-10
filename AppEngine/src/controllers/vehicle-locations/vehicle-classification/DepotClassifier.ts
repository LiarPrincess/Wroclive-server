import { VehicleLocationFromApi } from '../models';
import { subtractMilliseconds, calculateDistanceInMeters } from '../helpers';
import { isInDepot as isInDepotFn } from './isInDepot';

/* ============== */
/* === Config === */
/* ============== */

const second = 1000;
const minute = 60 * second;

/**
 * How often do we check if vehicle is in depot?
 */
export const movementCheckInterval = 5 * minute;

/**
 * Min movement (in meters) to classify vehicle as 'not in depot'.
 */
export const minMovement = 30;

/* ============= */
/* === Types === */
/* ============= */

type DateProvider = () => Date;

class VehicleLocation {
  constructor(
    public readonly isInDepot: boolean,
    public readonly lat: number,
    public readonly lng: number,
    public readonly date: Date
  ) { }
}

interface PreviousVehicleLocations {
  [key: string]: VehicleLocation;
}

/* ============ */
/* === Main === */
/* ============ */

/**
 * Check if vehicle is in any of the known depots.
 *
 * Our data source updates location even when the vehicle is not in use.
 * The worst case is during the night when all of the 'daily' vehicles are still visible.
 *
 * We will remove vehicles that:
 * - have not moved in the last few minutes
 * - are close to some tram/bus depot
 *
 * We need to check depot proximity because we need to allow situation when tram broke
 * and all other trams are in 'traffic jam'.
 */
export class DepotClassifier {

  /**
   * Vehicle location at the start of the interval.
   */
  private previousVehicleLocations: PreviousVehicleLocations = {};
  private dateProvider: DateProvider;
  private now: Date;

  constructor(dateProvider?: DateProvider) {
    this.dateProvider = dateProvider || (() => new Date());
    this.now = this.dateProvider();
  }

  prepareForClassification(): void {
    this.now = this.dateProvider();
  }

  isInDepot(vehicle: VehicleLocationFromApi): boolean {
    // If this is a new vehicle then we will show it
    const previousLocation = this.previousVehicleLocations[vehicle.id];
    if (!previousLocation) {
      return this.saveLocationAndReturn(vehicle, false);
    }

    // We can ignore time zone, because both 'now' and 'date' should be in the same time zone.
    // Note that this does not mean that it is 'Europe/Warsaw', but it should work anyway.
    const timeSinceSaved = subtractMilliseconds(this.now, previousLocation.date);
    if (timeSinceSaved < movementCheckInterval) {
      return previousLocation.isInDepot;
    }

    // If we are moving then we are not stale in depot.
    const distance = calculateDistanceInMeters(
      previousLocation.lat,
      previousLocation.lng,
      vehicle.lat,
      vehicle.lng
    );

    const hasMoved = distance > minMovement;
    if (hasMoved) {
      return this.saveLocationAndReturn(vehicle, false);
    }

    const isDepot = isInDepotFn(vehicle.lat, vehicle.lng);
    return this.saveLocationAndReturn(vehicle, isDepot);
  }

  private saveLocationAndReturn(vehicle: VehicleLocationFromApi, isInDepot: boolean) {
    this.previousVehicleLocations[vehicle.id] = new VehicleLocation(
      isInDepot,
      vehicle.lat,
      vehicle.lng,
      this.now
    );

    return isInDepot;
  }
}
