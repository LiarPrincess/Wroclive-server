import { DateTime } from 'luxon';

import { isInDepot } from './depots';
import { calculateDistanceInMeters, subtractMilliseconds } from '../math';
import { MPKVehicle } from '../models';
import { Line } from '../../controllers';
import { minute } from '../../util';

export interface VehicleFilter {
  /**
   * Should be called before any filtering starts.
   * Chance to reset local state.
   */
  prepareForFiltering(): void;
  /**
   * Should the vehicle be shown on the map?
   */
  isAccepted(vehicle: MPKVehicle, line: Line): boolean;
}

export class AcceptAllVehicles implements VehicleFilter {

  prepareForFiltering(): void { }

  isAccepted(vehicle: MPKVehicle, line: Line): boolean {
    return true;
  }
}

/* ============================== */
/* === Default vehicle filter === */
/* ============================== */

export class DefaultVehicleFilter implements VehicleFilter {

  private filters: VehicleFilter[];

  constructor() {
    // We actually need both of those filters, even though they may seem redundant:
    // - scheduleFilter - will remove lines outside of the schedule, but sometimes
    //   vehicles stay in depot during the day even though the line is operating
    //   (for example during saturday/sunday).
    // - depotFilter - will remove vehicles that say in depot, but some vehicles
    //   do not stay in depot during the night (they stay in some random places
    //   like 'John Paul II Square' etc.).
    const scheduleFilter = new ScheduleVehicleFilter();
    const depotFilter = new DepotVehicleFilter();
    this.filters = [scheduleFilter, depotFilter];
  }

  prepareForFiltering(): void {
    for (const filter of this.filters) {
      filter.prepareForFiltering();
    }
  }

  isAccepted(vehicle: MPKVehicle, line: Line): boolean {
    for (const filter of this.filters) {
      const isAccepted = filter.isAccepted(vehicle, line);
      if (!isAccepted) {
        return false;
      }
    }

    return true;
  }
}

/* =============================== */
/* === Schedule vehicle filter === */
/* =============================== */

export type Time = { hour: number, minute: number };
export type TimeProvider = () => Time;

function getCurrentTimeInWroclaw(): Time {
  return DateTime.fromObject({ zone: 'Europe/Warsaw' });
}

/**
 * Vehicles outside of their line schedule will be removed.
 */
export class ScheduleVehicleFilter implements VehicleFilter {

  /**
   * We will show line for a few additional minutes.
   */
  gracePeriod = 10;
  /**
   * Current time as number of minutes since midnight (in Wroclaw).
   */
  private minutesSinceMidnightInWroclaw = 0;
  /**
   * Get current time in Wroclaw.
   */
  private getTime: TimeProvider;

  constructor(getTimeInWroclaw?: TimeProvider) {
    this.getTime = getTimeInWroclaw || getCurrentTimeInWroclaw;
  }

  prepareForFiltering(): void {
    const now = this.getTime();
    this.minutesSinceMidnightInWroclaw = 60 * now.hour + now.minute;
  }

  isAccepted(vehicle: MPKVehicle, line: Line): boolean {
    if (!line.stopArrivalTimes) {
      return true;
    }

    const min = line.stopArrivalTimes.min - this.gracePeriod;
    const max = line.stopArrivalTimes.max + this.gracePeriod;

    // Degenerate case:
    // line starts at: 5:30
    // line ends at:   29:15 -> 5:15 next day (sooo… almost 24h)
    if (max <= min) {
      return true;
    }

    // We need to check 'nextDay' because night lines usually start at '23:50'
    // and end at '29:30' (where '29:30' means '5:30' next day).
    const nextDay = 24 * 60;
    const currentTime = this.minutesSinceMidnightInWroclaw;
    const currentTimeNextDay = currentTime + nextDay;

    const isVisible = min <= currentTime && currentTime <= max;
    const isVisibleNextDay = min <= currentTimeNextDay && currentTimeNextDay <= max;

    return isVisible || isVisibleNextDay;
  }
}

/* ============================ */
/* === Depot vehicle filter === */
/* ============================ */

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
export class DepotVehicleFilter implements VehicleFilter {

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

  isAccepted(vehicle: MPKVehicle, line: Line): boolean {
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
