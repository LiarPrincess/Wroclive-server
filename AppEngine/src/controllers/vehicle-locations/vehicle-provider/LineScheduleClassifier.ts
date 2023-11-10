import { DateTime } from "luxon";

import { Line } from "../models";

/* ============== */
/* === Config === */
/* ============== */

/**
 * We will allow line for a few additional minutes.
 */
export const gracePeriod = 15;

/* ============== */
/* === Types === */
/* ============== */

export type Time = { hour: number; minute: number };

export function getCurrentTimeInWroclaw(): Time {
  return DateTime.fromObject({ zone: "Europe/Warsaw" });
}

/* ============ */
/* === Main === */
/* ============ */

export interface LineScheduleClassifierType {
  isWithinScheduleTimeFrame(now: Time, line: Line): boolean;
}

/**
 * Check if vehicle is before min or after max time based on its line schedule.
 */
export class LineScheduleClassifier implements LineScheduleClassifierType {
  public isWithinScheduleTimeFrame(now: Time, line: Line): boolean {
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
    const minutesSinceMidnightInWroclaw = 60 * now.hour + now.minute;
    const currentTime = minutesSinceMidnightInWroclaw;
    const currentTimeNextDay = currentTime + nextDay;

    const isWithin = min <= currentTime && currentTime <= max;
    const isWithinNextDay = min <= currentTimeNextDay && currentTimeNextDay <= max;

    return isWithin || isWithinNextDay;
  }
}

/* ============ */
/* === Mock === */
/* ============ */

export class LineScheduleClassifierMock implements LineScheduleClassifierType {
  public withinScheduleLineNames = new Set<string>();
  public isWithinScheduleTimeFrameCallCount = 0;

  public isWithinScheduleTimeFrame(now: Time, line: Line): boolean {
    this.isWithinScheduleTimeFrameCallCount += 1;
    return this.withinScheduleLineNames.has(line.name);
  }
}
