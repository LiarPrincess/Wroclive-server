import { Line } from '../..';
import { Vehicle } from '../models';
import { VehicleFilter } from './VehicleFilter';
import { isInDepot } from './isInDepot';
import { calculateDistanceInMeters, subtractMilliseconds } from '../math';

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

/* ============== */
/* === Types === */
/* ============== */

type DateProvider = () => Date;

interface VehicleLocation {
  readonly isAccepted: boolean;
  readonly lat: number;
  readonly lng: number;
  readonly date: Date;
}

interface PreviousVehicleLocations {
  [key: string]: VehicleLocation;
}

/* ============ */
/* === Main === */
/* ============ */

/**
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
export class RemoveVehiclesInDepots implements VehicleFilter {

  /**
   * Vehicle location at the start of the interval.
   */
  private previousVehicleLocations: PreviousVehicleLocations = {};
  private now: Date;
  private dateProvider: DateProvider;

  constructor(dateProvider?: DateProvider) {
    this.dateProvider = dateProvider || (() => new Date());
    this.now = this.dateProvider();
  }

  prepareForFiltering(): void {
    this.now = this.dateProvider();
  }

  isAccepted(vehicle: Vehicle, line: Line): boolean {
    // If this is a new vehicle then we will show it
    const previousLocation = this.previousVehicleLocations[vehicle.id];
    if (!previousLocation) {
      return this.saveLocationAndReturn(vehicle, true);
    }

    // We can ignore time zone, because both 'now' and 'date' should be in the same time zone.
    // Note that this does not mean that it is 'Europe/Warsaw', but it should work anyway
    // (well, most of the time).
    const timeSinceSaved = subtractMilliseconds(this.now, previousLocation.date);
    if (timeSinceSaved < movementCheckInterval) {
      return previousLocation.isAccepted;
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
      return this.saveLocationAndReturn(vehicle, true);
    }

    const isDepot = isInDepot(vehicle.lat, vehicle.lng);
    const isAccepted = !isDepot;
    return this.saveLocationAndReturn(vehicle, isAccepted);
  }

  private saveLocationAndReturn(vehicle: Vehicle, isAccepted: boolean) {
    this.previousVehicleLocations[vehicle.id] = {
      isAccepted: isAccepted,
      lat: vehicle.lat,
      lng: vehicle.lng,
      date: this.now
    };

    return isAccepted;
  }
}
