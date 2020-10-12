import { DateTime } from 'luxon';

import { MPKVehicle, Line } from '../models';

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

/* ============================ */
/* === DefaultVehicleFilter === */
/* ============================ */

export class DefaultVehicleFilter implements VehicleFilter {

  private filters: VehicleFilter[];

  constructor() {
    const scheduleFilter = new ScheduleVehicleFilter();
    this.filters = [scheduleFilter];
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

/* ============================= */
/* === ScheduleVehicleFilter === */
/* ============================= */

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
