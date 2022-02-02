import { DateTime } from 'luxon';

import { Line } from '../../lines';

/**
 * We will allow line for a few additional minutes.
 */
export const gracePeriod = 15;

export type Time = { hour: number, minute: number };
export type TimeProvider = () => Time;

function getCurrentTimeInWroclaw(): Time {
  return DateTime.fromObject({ zone: 'Europe/Warsaw' });
}

/**
 * Check if vehicle is before min or after max time based on its line schedule.
 */
export class LineScheduleClassifier {

  /** Get current time in Wroclaw. */
  private getTime: TimeProvider;
  /** Current time as number of minutes since midnight (in Wroclaw). */
  private minutesSinceMidnightInWroclaw = 0;

  constructor(getTimeInWroclaw?: TimeProvider) {
    this.getTime = getTimeInWroclaw || getCurrentTimeInWroclaw;
  }

  prepareForClassification(): void {
    const now = this.getTime();
    this.minutesSinceMidnightInWroclaw = 60 * now.hour + now.minute;
  }

  isWithinScheduleTimeFrame(line: Line): boolean {
    if (!line.stopArrivalTimes) {
      return true;
    }

    const min = line.stopArrivalTimes.min - gracePeriod;
    const max = line.stopArrivalTimes.max + gracePeriod;

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

    const isWithin = min <= currentTime && currentTime <= max;
    const isWithinNextDay = min <= currentTimeNextDay && currentTimeNextDay <= max;

    return isWithin || isWithinNextDay;
  }
}
