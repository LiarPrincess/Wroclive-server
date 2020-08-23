/*
import { default as nock } from 'nock';

import MpkApi from '../api';
import { ConsoleLogger } from '../../util/logger';

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

const host = 'http://pasazer.mpk.wroc.pl';
const path = '/position.php';
const logger = new ConsoleLogger();

describe('getVehicleLocations', () => {
  it('should parse example response', async () => {
    nock(host)
      .post(path)
      .reply(200, [
        { 'name': 'a', 'type': 'bus', 'y': 17.066673, 'x': 51.14111, 'k': 11827842 },
        { 'name': '4', 'type': 'tram', 'y': 16.972082, 'x': 51.08407, 'k': 11955495 },
      ]);

    const api = new MpkApi(logger);
    const result = await api.getVehicleLocations(['A', '4']);

    expect(result).toEqual([
      { id: '11827842', lat: 51.14111, line: 'a', lng: 17.066673 },
      { id: '11955495', lat: 51.08407, line: '4', lng: 16.972082 }
    ]);
  });

  it('should handle node error', async () => {
    nock(host)
      .post(path)
      .replyWithError('Some error...');

    expect.assertions(1);
    try {
      const api = new MpkApi(logger);
      await api.getVehicleLocations(['A', '4']);
    } catch (e) {
      expect(e.message).toMatch(/Some error.../);
    }
  });

  it('should handle 404', async () => {
    nock(host)
      .post(path)
      .reply(404, '<html><body>Error!</body></html>');

    expect.assertions(1);
    try {
      const api = new MpkApi(logger);
      await api.getVehicleLocations(['A', '4']);
    } catch (e) {
      expect(e.message).toMatch(/Invalid response from mpk api: 404./);
    }
  });

  it('should handle empty response', async () => {
    nock(host)
      .post(path)
      .reply(200, '');

    expect.assertions(1);
    try {
      const api = new MpkApi(logger);
      await api.getVehicleLocations(['A', '4']);
    } catch (e) {
      expect(e.message).toMatch(/Received empty response from mpk api./);
    }
  });

  it('should handle json parsing error', async () => {
    nock(host)
      .post(path)
      .reply(200, 'invalid json');

    expect.assertions(1);
    try {
      const api = new MpkApi(logger);
      await api.getVehicleLocations(['A', '4']);
    } catch (e) {
      expect(e.message).toMatch(/Error when parsing mpk response/);
    }
  });
});
*/
