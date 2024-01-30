import { VehicleLocationFromApi } from "../models";
import { subtractMilliseconds, calculateDistanceInMeters } from "../helpers";
import { isInDepot as isInDepotFn } from "./isInDepot";

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

class VehicleLocation {
  constructor(
    public readonly isInDepot: boolean,
    public readonly lat: number,
    public readonly lng: number,
    public readonly date: Date
  ) {}
}

/* ============ */
/* === Main === */
/* ============ */

export interface DepotClassifierType {
  isInDepot(now: Date, vehicle: VehicleLocationFromApi): boolean;
}

/**
 * Check if vehicle is in any of the known depots.
 *
 * Our data source updates location even when the vehicle is not in use.
 * The worst case is during the night when all of the 'daily' vehicles are still
 * visible.
 *
 * We will remove vehicles that:
 * - are close to some tram/bus depot
 * - have not moved in the last few minutes
 *
 * We need to check depot proximity because we need to allow situation when tram
 * broke and all other trams are in 'traffic jam'.
 */
export class DepotClassifier implements DepotClassifierType {
  /**
   * Vehicle location at the start of the interval.
   */
  private previousVehicleLocations = new Map<string, VehicleLocation>();

  public isInDepot(now: Date, vehicle: VehicleLocationFromApi): boolean {
    // If this is a new vehicle then we will show it
    const previousLocation = this.previousVehicleLocations.get(vehicle.id);

    if (!previousLocation) {
      return this.saveLocationAndReturn(now, vehicle, false);
    }

    // We can ignore time zone, because both 'now' and 'date' should be in the same time zone.
    // Note that this does not mean that it is 'Europe/Warsaw', but it should work anyway.
    const timeSinceSaved = subtractMilliseconds(now, previousLocation.date);

    if (timeSinceSaved < movementCheckInterval) {
      return previousLocation.isInDepot;
    }

    // If we are moving then we are not stale in depot.
    const distance = calculateDistanceInMeters(previousLocation.lat, previousLocation.lng, vehicle.lat, vehicle.lng);

    if (distance > minMovement) {
      return this.saveLocationAndReturn(now, vehicle, false);
    }

    const isDepot = isInDepotFn(vehicle.lat, vehicle.lng);
    return this.saveLocationAndReturn(now, vehicle, isDepot);
  }

  private saveLocationAndReturn(now: Date, vehicle: VehicleLocationFromApi, isInDepot: boolean) {
    const location = new VehicleLocation(isInDepot, vehicle.lat, vehicle.lng, now);
    this.previousVehicleLocations.set(vehicle.id, location);
    return isInDepot;
  }
}

/* ============ */
/* === Mock === */
/* ============ */

export class DepotClassifierMock implements DepotClassifierType {
  public inDepotVehicleIds = new Set<string>();
  public isInDepotCallCount = 0;

  public isInDepot(now: Date, vehicle: VehicleLocationFromApi): boolean {
    this.isInDepotCallCount += 1;
    return this.inDepotVehicleIds.has(vehicle.id);
  }
}
