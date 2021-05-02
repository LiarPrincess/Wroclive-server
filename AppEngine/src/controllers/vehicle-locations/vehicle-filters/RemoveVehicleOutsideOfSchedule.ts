import { DateTime } from 'luxon';

import { Line } from '../..';
import { Vehicle } from '../models';
import { VehicleFilter } from './VehicleFilter';

export type Time = { hour: number, minute: number };
export type TimeProvider = () => Time;

function getCurrentTimeInWroclaw(): Time {
  return DateTime.fromObject({ zone: 'Europe/Warsaw' });
}

/**
 * Vehicles outside of their line schedule will be removed.
 */
export class RemoveVehicleOutsideOfSchedule implements VehicleFilter {

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

  isAccepted(vehicle: Vehicle, line: Line): boolean {
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
