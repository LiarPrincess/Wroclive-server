import {
  gracePeriod,
  Time,
  LineScheduleClassifier
} from '../LineScheduleClassifier';
import { Line } from '../../models';

/* ============ */
/* === Time === */
/* ============ */

let currentTime: Time = { hour: 0, minute: 0 };

function getCurrentTimeMock(): Time {
  return currentTime;
}

function minutesSinceMidnight(hours: number, minutes: number): number {
  return 60 * hours + minutes;
}

function createTime(minutesSinceMidnight: number): Time {
  return {
    hour: Math.floor(minutesSinceMidnight / 60.0),
    minute: Math.floor(minutesSinceMidnight % 60.0)
  };
}

/* ======================= */
/* === Stops and lines === */
/* ======================= */

type StopArrivalTimes = { min: number, max: number };

function createLine(stopArrivalTimes?: StopArrivalTimes): Line {
  return new Line('NAME', 'TYPE', 'SUBTYPE', stopArrivalTimes);
}

/* ============ */
/* === Main === */
/* ============ */

describe('LineScheduleClassifier', function () {

  it('should allow line that has no stop arrival times', function () {
    const c = new LineScheduleClassifier(getCurrentTimeMock);
    c.prepareForClassification();

    const line = createLine(undefined);
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();
  });

  it('handles line that starts and finishes during the day', function () {
    const c = new LineScheduleClassifier(getCurrentTimeMock);

    const lineMinTime = minutesSinceMidnight(5, 30);
    const lineMaxTime = minutesSinceMidnight(20, 48);
    const line = createLine({ min: lineMinTime, max: lineMaxTime });

    const startShowing = lineMinTime - gracePeriod;
    const stopShowing = lineMaxTime + gracePeriod;

    currentTime = createTime(startShowing - 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeFalsy();

    currentTime = createTime(startShowing + 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();

    currentTime = createTime(stopShowing - 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();

    currentTime = createTime(stopShowing + 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeFalsy();
  });

  it('handles line that starts during the day and finishes after midnight', function () {
    const c = new LineScheduleClassifier(getCurrentTimeMock);

    const lineMinTime = minutesSinceMidnight(5, 30);
    const lineMaxTime = minutesSinceMidnight(24 + 4, 48);
    const line = createLine({ min: lineMinTime, max: lineMaxTime });

    const startShowing = lineMinTime - gracePeriod;
    const stopShowing = lineMaxTime + gracePeriod;

    currentTime = createTime(startShowing - 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeFalsy();

    currentTime = createTime(startShowing + 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();

    currentTime = createTime(stopShowing - 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();

    currentTime = createTime(stopShowing + 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeFalsy();
  });

  it('handles line that starts and finishes during the night', function () {
    const c = new LineScheduleClassifier(getCurrentTimeMock);

    const lineMinTime = minutesSinceMidnight(24, 30);
    const lineMaxTime = minutesSinceMidnight(24 + 5, 48);
    const line = createLine({ min: lineMinTime, max: lineMaxTime });

    const startShowing = lineMinTime - gracePeriod;
    const stopShowing = lineMaxTime + gracePeriod;

    currentTime = createTime(startShowing - 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeFalsy();

    currentTime = createTime(startShowing + 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();

    currentTime = createTime(stopShowing - 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();

    currentTime = createTime(stopShowing + 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeFalsy();
  });

  it('handles line that starts during the night and finishes during the day (degenerate case)', function () {
    const c = new LineScheduleClassifier(getCurrentTimeMock);

    const lineMinTime = minutesSinceMidnight(24 + 4, 30);
    const lineMaxTime = minutesSinceMidnight(3, 48);
    const line = createLine({ min: lineMinTime, max: lineMaxTime });

    const startShowing = lineMinTime - gracePeriod;
    const stopShowing = lineMaxTime + gracePeriod;

    currentTime = createTime(startShowing - 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();

    currentTime = createTime(startShowing + 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();

    currentTime = createTime(stopShowing - 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();

    currentTime = createTime(stopShowing + 5);
    c.prepareForClassification();
    expect(c.isWithinScheduleTimeFrame(line)).toBeTruthy();
  });
});
