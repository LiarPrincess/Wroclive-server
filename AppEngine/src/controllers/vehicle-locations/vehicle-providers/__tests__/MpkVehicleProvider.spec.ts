import { default as nock } from 'nock';

import { MpkVehicleProvider } from '..';

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

const lines = ['A', '4', '125'];

function intercept(): nock.Interceptor {
  const host = 'https://mpk.wroc.pl';
  const path = '/bus_position';
  const body = { 'busList[bus][]': ['a', '4', '125'] };
  return nock(host).post(path, body);
}

interface VehicleResponse {
  name: string;
  type: string;
  y: number;
  x: number;
  k: number;
}

function createResponse(vehicles: VehicleResponse[]): any {
  return vehicles;
}

/* ============= */
/* === Tests === */
/* ============= */

describe('MpkVehicleProvider', () => {

  it('should handle correct response', async () => {
    intercept()
      .reply(200, createResponse([
        {
          'name': '4',
          'type': 'tram',
          'y': 17.006762,
          'x': 51.100864,
          'k': 17659902
        },
        {
          'name': 'a',
          'type': 'bus',
          'y': 17.064621,
          'x': 51.14168,
          'k': 17668767
        },
        {
          'name': '125',
          'type': 'bus',
          'y': 16.98693,
          'x': 51.093807,
          'k': 17554153
        }
      ]));

    const provider = new MpkVehicleProvider();
    const result = await provider.getVehicles(lines);
    expect(result).toEqual([
      { id: '417659902', lat: 51.100864, line: '4', lng: 17.006762 },
      { id: 'a17668767', lat: 51.14168, line: 'a', lng: 17.064621 },
      { id: '12517554153', lat: 51.093807, line: '125', lng: 16.98693 }
    ]);
  });

  it('should handle response without records', async () => {
    intercept()
      .reply(200, '');

    expect.assertions(1);
    try {
      const provider = new MpkVehicleProvider();
      await provider.getVehicles(lines);
    } catch (e) {
      expect(e.message).toMatch('[MpkVehicleProvider] Response is empty.');
    }
  });

  it('should handle node error', async () => {
    intercept()
      .replyWithError('Some error...');

    expect.assertions(2);
    try {
      const provider = new MpkVehicleProvider();
      await provider.getVehicles(lines);
    } catch (e) {
      expect(e.message).toMatch("[MpkVehicleProvider] Unknown request error (see 'innerError' for details).");
      expect(e.innerError.message).toMatch('Some error...');
    }
  });

  it('should handle 404', async () => {
    intercept()
      .reply(404, {});

    expect.assertions(1);
    try {
      const provider = new MpkVehicleProvider();
      await provider.getVehicles(lines);
    } catch (e) {
      expect(e.message).toMatch('[MpkVehicleProvider] Response with status: 404.');
    }
  });

  it('should handle json parsing error', async () => {
    intercept()
      .reply(200, 'invalid json');

    expect.assertions(1);
    try {
      const provider = new MpkVehicleProvider();
      await provider.getVehicles(lines);
    } catch (e) {
      expect(e.message).toMatch('[MpkVehicleProvider] Response data is not an array.');
    }
  });
});
