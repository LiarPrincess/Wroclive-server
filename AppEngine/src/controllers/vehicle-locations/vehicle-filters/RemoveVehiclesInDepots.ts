import { Line } from '../..';
import { Vehicle } from '../vehicle-providers';
import { VehicleFilter } from './VehicleFilter';
import { isInDepot } from './isInDepot';
import { calculateDistanceInMeters, subtractMilliseconds } from '../math';

const second = 1000;
const minute = 60 * second;

interface VehicleLocation {
  readonly isAccepted: boolean;
  readonly lat: number;
  readonly lng: number;
  readonly date: Date;
}

interface PreviousVehicleLocations {
  [key: string]: VehicleLocation;
}

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
   * How often do we check if vehicle is in depot?
   */
  movementCheckInterval = 5 * minute;
  /**
   * Min movement (in meters) to classify vehicle as 'not in depot'.
   */
  minMovement = 30;
  /**
   * Vehicle location at the start of the interval.
   */
  private previousVehicleLocations: PreviousVehicleLocations = {};
  private now = new Date();

  prepareForFiltering(): void {
    this.now = new Date();
  }

  isAccepted(vehicle: Vehicle, line: Line): boolean {
    const self = this;

    function saveLocationAndReturn(isAccepted: boolean) {
      self.previousVehicleLocations[vehicle.id] = {
        isAccepted: isAccepted,
        lat: vehicle.lat,
        lng: vehicle.lng,
        date: self.now
      };

      return isAccepted;
    }

    // If this is a new vehicle then we will show it
    const previousLocation = this.previousVehicleLocations[vehicle.id];
    if (!previousLocation) {
      return saveLocationAndReturn(true);
    }

    // We can ignore time zone, because both 'now' and 'date' should be in the same time zone.
    // Note that this does not mean that it is 'Europe/Warsaw', but it should work anyway
    // (well, most of the time).
    const timeSinceSaved = subtractMilliseconds(this.now, previousLocation.date);
    if (timeSinceSaved < this.movementCheckInterval) {
      return previousLocation.isAccepted;
    }

    // If we are moving then we are not in depot.
    const distance = calculateDistanceInMeters(
      previousLocation.lat,
      previousLocation.lng,
      vehicle.lat,
      vehicle.lng
    );

    const hasMoved = distance > this.minMovement;
    if (hasMoved) {
      return saveLocationAndReturn(true);
    }

    const isDepot = isInDepot(vehicle.lat, vehicle.lng);
    const isAccepted = !isDepot;
    return saveLocationAndReturn(isAccepted);
  }
}
