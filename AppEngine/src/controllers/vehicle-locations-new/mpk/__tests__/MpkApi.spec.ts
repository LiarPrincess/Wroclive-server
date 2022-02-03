import { default as nock } from 'nock';

import { MpkApi } from '../MpkApi';
import { LineDatabase } from '../../helpers';
import { Line } from '../../../lines';

/* ============ */
/* === Nock === */
/* ============ */

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

const lineDatabase = new LineDatabase();
lineDatabase.updateLineDefinitions({
  timestamp: '',
  data: [
    new Line('A', 'Bus', 'Express'),
    new Line('4', 'Tram', 'Regular'),
    new Line('125', 'Bus', 'Regular'),
  ]
});

function intercept(): nock.Interceptor {
  const host = 'https://mpk.wroc.pl';
  const path = '/bus_position';
  const body = { 'busList[bus][]': ['a', '4', '125'] };
  return nock(host).post(path, body);
}

/* ============= */
/* === Tests === */
/* ============= */

describe('MpkApi', () => {

  it('returns no vehicles when response is empty array', async () => {
    intercept()
      .reply(200, []);

    const api = new MpkApi(lineDatabase);
    const result = await api.getVehicleLocations();

    expect(result).toEqual({
      kind: 'Success',
      invalidRecords: [],
      vehicles: []
    });
  });

  it('returns vehicles when response contains valid vehicles', async () => {
    intercept()
      .reply(200, [
        { name: '4', type: 'tram', y: 17.006762, x: 51.100864, k: 17659902 },
        { name: 'a', type: 'bus', y: 17.064621, x: 51.14168, k: 17668767 },
        { name: '125', type: 'bus', y: 16.98693, x: 51.093807, k: 17554153 }
      ]);

    const api = new MpkApi(lineDatabase);
    const result = await api.getVehicleLocations();

    expect(result).toEqual({
      kind: 'Success',
      invalidRecords: [],
      vehicles: [
        { id: '417659902', lat: 51.100864, line: '4', lng: 17.006762 },
        { id: 'a17668767', lat: 51.14168, line: 'a', lng: 17.064621 },
        { id: '12517554153', lat: 51.093807, line: '125', lng: 16.98693 }
      ]
    });
  });

  it('returns invalid records when response contains invalid entries', async () => {
    intercept()
      .reply(200, [
        { name: '4', type: 'tram', y: 17.006762, x: 51.100864, k: 17659902 },
        { name: 'a', type: 'bus', k: 17668767 }, // missing 'x' and 'y'
        { name: '125', type: 'bus', y: 16.98693, x: 51.093807, k: 17554153 }
      ]);

    const api = new MpkApi(lineDatabase);
    const result = await api.getVehicleLocations();

    expect(result).toEqual({
      kind: 'Success',
      invalidRecords: [
        { name: 'a', type: 'bus', k: 17668767 }
      ],
      vehicles: [
        { id: '417659902', lat: 51.100864, line: '4', lng: 17.006762 },
        { id: '12517554153', lat: 51.093807, line: '125', lng: 16.98693 }
      ]
    });
  });

  it('returns error when response is empty', async () => {
    intercept()
      .reply(200, '');

    const api = new MpkApi(lineDatabase);
    const result = await api.getVehicleLocations();

    expect(result).toEqual({
      kind: 'Error',
      error: {
        kind: 'Invalid response',
        message: 'Response data is not an array.',
        data: ''
      }
    });
  });

  it('returns error on network error', async () => {
    intercept()
      .replyWithError('Some error...');

    const api = new MpkApi(lineDatabase);
    const result = await api.getVehicleLocations();

    expect(result.kind).toEqual('Error');
    switch (result.kind) {
      case 'Success':
        expect(true).toBeFalsy();
        break;
      case 'Error':
        expect(result.error.kind).toEqual('Network error');
        expect(result.error.message).toEqual('Unknown request error.');
        expect(result.error.data.message).toEqual('Some error...');
        break;
    }
  });

  it('returns error on 404', async () => {
    intercept()
      .reply(404, {});

    const api = new MpkApi(lineDatabase);
    const result = await api.getVehicleLocations();

    expect(result.kind).toEqual('Error');
    switch (result.kind) {
      case 'Success':
        expect(true).toBeFalsy();
        break;
      case 'Error':
        expect(result.error.kind).toEqual('Network error');
        expect(result.error.message).toEqual('Response with status: 404.');
        expect(result.error.data.message).toEqual('Request failed with status code 404');
        break;
    }
  });

  it('returns error on json parsing error', async () => {
    intercept()
      .reply(200, 'invalid json');

    const api = new MpkApi(lineDatabase);
    const result = await api.getVehicleLocations();

    expect(result).toEqual({
      kind: 'Error',
      error: {
        kind: 'Invalid response',
        message: 'Response data is not an array.',
        data: 'invalid json'
      }
    });
  });
});
