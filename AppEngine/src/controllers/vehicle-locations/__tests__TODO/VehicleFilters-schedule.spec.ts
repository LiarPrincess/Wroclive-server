/*
import { MPKVehicle } from '../models';
import { Line } from '../../controllers';

import {
  Time,
  ScheduleVehicleFilter
} from '../update-vehicle-locations/VehicleFilters';

describe('ScheduleVehicleFilter', function () {

  let currentTime: Time = { hour: 0, minute: 0 };
  function getCurrentTimeMock(): Time {
    return currentTime;
  }

  type StopArrivalTimes = { min: number, max: number };

  function createLineAndVehicle(stopArrivalTimes?: StopArrivalTimes): [Line, MPKVehicle] {
    const line: Line = { name: 'A', type: 'Bus', subtype: 'Express', stopArrivalTimes };
    const vehicle: MPKVehicle = { id: '1', line: 'A', lat: 1, lng: 2 };
    return [line, vehicle];
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

  it('should allow line that has no stop arrival times', function () {
    const filter = new ScheduleVehicleFilter(getCurrentTimeMock);
    filter.prepareForFiltering();

    const [line, vehicle] = createLineAndVehicle(undefined);
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();
  });

  it('handles line that starts and finishes during the day', function () {
    const filter = new ScheduleVehicleFilter(getCurrentTimeMock);

    const lineMinTime = minutesSinceMidnight(5, 30);
    const lineMaxTime = minutesSinceMidnight(20, 48);
    const [line, vehicle] = createLineAndVehicle({ min: lineMinTime, max: lineMaxTime });

    const startShowing = lineMinTime - filter.gracePeriod;
    const stopShowing = lineMaxTime + filter.gracePeriod;

    currentTime = createTime(startShowing - 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeFalsy();

    currentTime = createTime(startShowing + 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentTime = createTime(stopShowing - 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentTime = createTime(stopShowing + 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeFalsy();
  });

  it('handles line that starts during the day and finishes after midnight', function () {
    const filter = new ScheduleVehicleFilter(getCurrentTimeMock);

    const lineMinTime = minutesSinceMidnight(5, 30);
    const lineMaxTime = minutesSinceMidnight(24 + 4, 48);
    const [line, vehicle] = createLineAndVehicle({ min: lineMinTime, max: lineMaxTime });

    const startShowing = lineMinTime - filter.gracePeriod;
    const stopShowing = lineMaxTime + filter.gracePeriod;

    currentTime = createTime(startShowing - 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeFalsy();

    currentTime = createTime(startShowing + 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentTime = createTime(stopShowing - 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentTime = createTime(stopShowing + 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeFalsy();
  });

  it('handles line that starts and finishes during the night', function () {
    const filter = new ScheduleVehicleFilter(getCurrentTimeMock);

    const lineMinTime = minutesSinceMidnight(24, 30);
    const lineMaxTime = minutesSinceMidnight(24 + 5, 48);
    const [line, vehicle] = createLineAndVehicle({ min: lineMinTime, max: lineMaxTime });

    const startShowing = lineMinTime - filter.gracePeriod;
    const stopShowing = lineMaxTime + filter.gracePeriod;

    currentTime = createTime(startShowing - 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeFalsy();

    currentTime = createTime(startShowing + 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentTime = createTime(stopShowing - 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentTime = createTime(stopShowing + 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeFalsy();
  });

  it('handles line that starts during the night and finishes during the day (degenerate case)', function () {
    const filter = new ScheduleVehicleFilter(getCurrentTimeMock);

    const lineMinTime = minutesSinceMidnight(24 + 4, 30);
    const lineMaxTime = minutesSinceMidnight(3, 48);
    const [line, vehicle] = createLineAndVehicle({ min: lineMinTime, max: lineMaxTime });

    const startShowing = lineMinTime - filter.gracePeriod;
    const stopShowing = lineMaxTime + filter.gracePeriod;

    currentTime = createTime(startShowing - 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentTime = createTime(startShowing + 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentTime = createTime(stopShowing - 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentTime = createTime(stopShowing + 5);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();
  });
});
*/
