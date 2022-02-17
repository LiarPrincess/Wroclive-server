import * as mocks from './Mocks';
import {
  Line,
  LineCollection,
  LineLocation,
  LineLocationLine,
  LineLocationCollection,
  VehicleLocation
} from '../models';
import {
  VehicleLocationsController,
  timeForWhichToUsePreviousResultIfAllProvidersFailed
} from '../VehicleLocationsController';
import { subtractMilliseconds } from '../math';
import { Logger } from '../../../util';

const lineA = new LineLocationLine('A', 'Bus', 'Express');
const line4 = new LineLocationLine('4', 'Tram', 'Regular');
const line125 = new LineLocationLine('125', 'Bus', 'Regular');

const vehicleA_1 = new VehicleLocation('A_1', 3.0, 5.0, 7.0);
const vehicleA_2 = new VehicleLocation('A_2', 11.0, 13.0, 17.0);
const vehicle4_1 = new VehicleLocation('4_1', 19.0, 23.0, 27.0);
const vehicle125_1 = new VehicleLocation('125_1', 29.0, 31.0, 37.0);
const vehicle125_2 = new VehicleLocation('125_2', 41.0, 43.0, 47.0);

const date = '2020-01-01 10:01:00';
const dateTimestamp = '2020-01-01T09:01:00.000Z';

const dateInPeriod = '2020-01-01 10:02:00';

const dateAfterPeriod = '2020-01-01 10:03:01';
const dateAfterPeriodTimestamp = '2020-01-01T09:03:01.000Z';

class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void { }
  error(message?: any, ...optionalParams: any[]): void { }
}

const logger = new LoggerMock();

function createController() {
  const lines = new LineCollection('TIMESTAMP', [
    new Line(lineA.name, lineA.type, lineA.subtype),
    new Line(line4.name, line4.type, line4.subtype),
    new Line(line125.name, line125.type, line125.subtype)
  ]);

  const lineProvider = new mocks.LineProvider(lines);

  const openDataProvider = new mocks.OpenDataProvider();
  const mpkProvider = new mocks.MpkProvider();
  const dateProvider = mocks.getCurrentDate;

  const controller = new VehicleLocationsController(
    lineProvider,
    openDataProvider,
    mpkProvider,
    logger,
    dateProvider
  );

  return { lineProvider, openDataProvider, mpkProvider, controller };
}

function getVehicleLocations(
  controller: VehicleLocationsController,
  lineNames: string[]
): LineLocationCollection {
  const lineNameSet = new Set<string>();

  for (const name of lineNames) {
    const lowercase = name.toLowerCase();
    lineNameSet.add(lowercase);
  }

  return controller.getVehicleLocations(lineNameSet);
}

async function updateVehicleLocations(controller: VehicleLocationsController) {
  await controller.updateVehicleLocations();
}

describe('VehicleLocationsController', () => {

  it('has correct test values', function () {
    const dateDate = new Date(date);

    const dateInPeriodDate = new Date(dateInPeriod);
    const diffInPeriod = subtractMilliseconds(dateInPeriodDate, dateDate);
    expect(diffInPeriod).toBeLessThanOrEqual(timeForWhichToUsePreviousResultIfAllProvidersFailed);

    const dateAfterPeriodDate = new Date(dateAfterPeriod);
    const diffAfterPeriod = subtractMilliseconds(dateAfterPeriodDate, dateDate);
    expect(diffAfterPeriod).toBeGreaterThan(timeForWhichToUsePreviousResultIfAllProvidersFailed);
  });

  it('responds with no locations as soon as it is created', function () {
    const { controller } = createController();

    const result1 = getVehicleLocations(controller, []);
    expect(result1).toEqual({
      'timestamp': 'INITIAL_TIMESTAMP',
      'data': []
    });

    const result2 = getVehicleLocations(controller, ['A', '4']);
    expect(result2).toEqual({
      'timestamp': 'INITIAL_TIMESTAMP',
      'data': []
    });
  });

  it('returns lines from open data when provided multiple line names', async function () {
    const { openDataProvider, controller } = createController();

    mocks.mockCurrentDate(date);
    openDataProvider.result = {
      kind: 'Success',
      lineLocations: [
        new LineLocation(lineA, [vehicleA_1, vehicleA_2]),
        new LineLocation(line4, [vehicle4_1]),
        new LineLocation(line125, [vehicle125_1, vehicle125_2]),
      ]
    };

    await updateVehicleLocations(controller);
    const result = getVehicleLocations(controller, ['a', '125']);

    expect(result).toEqual({
      timestamp: dateTimestamp,
      data: [
        new LineLocation(lineA, [vehicleA_1, vehicleA_2]),
        new LineLocation(line125, [vehicle125_1, vehicle125_2])
      ]
    });
  });

  it('returns lines from mpk when provided multiple line names', async function () {
    const { openDataProvider, mpkProvider, controller } = createController();

    mocks.mockCurrentDate(date);
    openDataProvider.result = {
      kind: 'ApiError'
    };
    mpkProvider.result = {
      kind: 'Success',
      lineLocations: [
        new LineLocation(lineA, [vehicleA_1, vehicleA_2]),
        new LineLocation(line4, [vehicle4_1]),
        new LineLocation(line125, [vehicle125_1, vehicle125_2]),
      ]
    };

    await updateVehicleLocations(controller);
    const result = getVehicleLocations(controller, ['a', '125']);

    expect(result).toEqual({
      timestamp: dateTimestamp,
      data: [
        new LineLocation(lineA, [vehicleA_1, vehicleA_2]),
        new LineLocation(line125, [vehicle125_1, vehicle125_2])
      ]
    });
  });

  it('returns no lines after: INITIAL -> all failed', async function () {
    const { openDataProvider, mpkProvider, controller } = createController();

    mocks.mockCurrentDate(date);
    openDataProvider.result = { kind: 'ApiError' };
    mpkProvider.result = { kind: 'ApiError' };

    await updateVehicleLocations(controller);
    const result = getVehicleLocations(controller, ['a', '125']);

    expect(result).toEqual({
      timestamp: dateTimestamp,
      data: []
    });
  });

  it('returns no lines after: INITIAL -> SUCCESSFUL -> all failed -> (waiting) -> all failed -> FAILED', async function () {
    const { openDataProvider, mpkProvider, controller } = createController();

    // Success
    mocks.mockCurrentDate(date);
    openDataProvider.result = {
      kind: 'Success',
      lineLocations: [new LineLocation(lineA, [vehicleA_1])]
    };

    await updateVehicleLocations(controller);
    const result1 = getVehicleLocations(controller, ['a', '125']);

    expect(result1).toEqual({
      timestamp: dateTimestamp,
      data: [new LineLocation(lineA, [vehicleA_1])]
    });

    // Waiting period -> the same result
    mocks.mockCurrentDate(dateInPeriod);
    openDataProvider.result = { kind: 'ApiError' };
    mpkProvider.result = { kind: 'ApiError' };

    await updateVehicleLocations(controller);
    const result2 = getVehicleLocations(controller, ['a', '125']);

    expect(result2).toEqual({
      timestamp: dateTimestamp,
      data: [new LineLocation(lineA, [vehicleA_1])]
    });

    // After period -> empty
    mocks.mockCurrentDate(dateAfterPeriod);
    openDataProvider.result = { kind: 'ApiError' };
    mpkProvider.result = { kind: 'ApiError' };

    await updateVehicleLocations(controller);
    const result3 = getVehicleLocations(controller, ['a', '125']);

    expect(result3).toEqual({
      timestamp: dateAfterPeriodTimestamp,
      data: [] // <-- THIS
    });
  });
});
