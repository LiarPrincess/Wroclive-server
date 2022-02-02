import {
  VehicleLocation,
  LineData,
  LineLocationsCollection,
  VehicleLocationFromApi
} from '../../models';
import { MpkVehicleProvider } from '../MpkVehicleProvider';
import { ApiType, ApiResult, ApiError } from '../interfaces';
import { LineDatabase } from '../../helpers';
import { Line, LineCollection } from '../../../lines';

/* =========== */
/* === Api === */
/* =========== */

class Api implements ApiType {

  public results: ApiResult[] = [];
  private resultIndex = 0;

  getVehicleLocations(): Promise<ApiResult> {
    if (this.resultIndex < this.results.length) {
      const result = this.results[this.resultIndex];
      this.resultIndex++;
      return Promise.resolve(result);
    }

    throw new Error('Forgot to define api result?');
  }
}

/* ============ */
/* === Date === */
/* ============ */

const currentDate = new Date(2020, 0, 1, 10, 30, 42);
const timestamp = '2020-01-01T09:30:42.000Z';

function getCurrentDate(): Date {
  return currentDate;
}

/* ============== */
/* === Logger === */
/* ============== */

class Logger {

  public readonly messages: any[] = [];

  error(message?: any, ...optionalParams: any[]) {
    this.messages.push({ message, args: optionalParams });
  }
}

/* ============ */
/* === Main === */
/* ============ */

function asData(line: Line): LineData {
  return new LineData(line.name, line.type, line.subtype);
}

const lineA = new Line('A', 'Bus', 'Express');
const line4 = new Line('4', 'Tram', 'Regular');
const line125 = new Line('125', 'Bus', 'Regular');
const allLines = new LineCollection('TIMESTAMP', [lineA, line4, line125]);

const lineAData = new LineData(lineA.name, lineA.type, lineA.subtype);
const line4Data = new LineData(line4.name, line4.type, line4.subtype);
const line125Data = new LineData(line125.name, line125.type, line125.subtype);

const vehicle_lineA_1 = new VehicleLocationFromApi('A1', 'A', 3, 5);
const vehicle_lineA_2 = new VehicleLocationFromApi('A2', 'A', 7, 11);
const vehicle_line4_1 = new VehicleLocationFromApi('41', '4', 13, 17);

const vehicle_lineA_1_with0Angle = new VehicleLocation('A1', 3, 5, 0);
const vehicle_lineA_2_with0Angle = new VehicleLocation('A2', 7, 11, 0);
const vehicle_line4_1_with0Angle = new VehicleLocation('41', 13, 17, 0);

function createProvider() {
  const lineDatabase = new LineDatabase();
  const logger = new Logger();
  const api = new Api();
  const provider = new MpkVehicleProvider(lineDatabase, logger, getCurrentDate, api);
  return { lineDatabase, logger, api, provider };
}

describe('MpkVehicleProvider', function () {

  it('returns no vehicles if api returns no vehicles', async function () {
    const { logger, api, provider } = createProvider();

    api.results = [
      { kind: 'Success', vehicles: [], invalidRecords: [] }
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toStrictEqual({
      kind: 'Success',
      lineLocations: new LineLocationsCollection(timestamp, [])
    });
    expect(logger.messages.length).toEqual(0);
  });

  it('vehicles from different lines belong to separate line locations', async function () {
    const { lineDatabase, logger, api, provider } = createProvider();

    lineDatabase.updateLineDefinitions(allLines);
    api.results = [
      {
        kind: 'Success',
        vehicles: [vehicle_lineA_1, vehicle_line4_1],
        invalidRecords: []
      }
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({
      kind: 'Success',
      lineLocations: new LineLocationsCollection(timestamp, [
        { line: lineAData, vehicles: [vehicle_lineA_1_with0Angle] },
        { line: line4Data, vehicles: [vehicle_line4_1_with0Angle] }
      ])
    });
    expect(logger.messages.length).toEqual(0);
  });

  it('vehicles with the same line belong to the same line location', async function () {
    const { lineDatabase, logger, api, provider } = createProvider();

    lineDatabase.updateLineDefinitions(allLines);
    api.results = [
      {
        kind: 'Success',
        vehicles: [vehicle_lineA_1, vehicle_lineA_2],
        invalidRecords: []
      }
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({
      kind: 'Success',
      lineLocations: new LineLocationsCollection(timestamp, [
        {
          line: lineAData,
          vehicles: [vehicle_lineA_1_with0Angle, vehicle_lineA_2_with0Angle]
        }
      ])
    });
    expect(logger.messages.length).toEqual(0);
  });

  it('should call api 2 times before returning error', async function () {
    const { lineDatabase, logger, api, provider } = createProvider();

    lineDatabase.updateLineDefinitions(allLines);
    api.results = [
      {
        kind: 'Error',
        error: new ApiError('Network error', 'MESSAGE', 'DATA')
      },
      {
        kind: 'Success',
        vehicles: [vehicle_lineA_1],
        invalidRecords: []
      }
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({
      kind: 'Success',
      lineLocations: new LineLocationsCollection(timestamp, [
        { line: lineAData, vehicles: [vehicle_lineA_1_with0Angle] }
      ])
    });
    expect(logger.messages.length).toEqual(0);
  });

  it('invalid records from api are reported', async function () {
    const { lineDatabase, logger, api, provider } = createProvider();

    lineDatabase.updateLineDefinitions(allLines);
    api.results = [
      {
        kind: 'Success',
        vehicles: [vehicle_lineA_1],
        invalidRecords: [{ invalid: 'VALUE' }]
      }
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({
      kind: 'Success',
      lineLocations: new LineLocationsCollection(timestamp, [
        { line: lineAData, vehicles: [vehicle_lineA_1_with0Angle] }
      ])
    });
    expect(logger.messages).toStrictEqual([
      {
        message: '[MpkVehicleProvider] Api response contains invalid records.',
        args: [[{ invalid: 'VALUE' }]] // Array of records inside array of args.
      }
    ]);
  });

  it('returns error on api error', async function () {
    const { logger, api, provider } = createProvider();

    const error1 = new ApiError('Network error', 'MESSAGE_1', 'DATA_1');
    const error2 = new ApiError('Invalid response', 'MESSAGE_2', 'DATA_2');
    api.results = [
      { kind: 'Error', error: error1 },
      { kind: 'Error', error: error2 }
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toStrictEqual({ kind: 'Error' });
    expect(logger.messages).toStrictEqual([
      {
        message: '[MpkVehicleProvider] Api get vehicle locations failed.',
        args: [error2]
      }
    ]);
  });
});
