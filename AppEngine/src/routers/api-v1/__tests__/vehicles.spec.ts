import { Request, send } from './express-hacks';
import {
  LineLocation,
  LineLocationLine,
  LineLocationCollection,
  VehicleLocation,
  LoggerMock,
  createControllers
} from './helpers';
import { createApiV1Router } from '..';

describe('/api/v1/vehicles', function () {

  it('GET without query', async function () {
    const logger = new LoggerMock();
    const controllers = createControllers();
    const router = createApiV1Router(controllers, logger);

    controllers.vehicleLocation.data = new LineLocationCollection('TIMESTAMP', [
      new LineLocation(
        new LineLocationLine('1', 'type1', 'subtype1'),
        [
          new VehicleLocation('id1', 1, 2, 3),
          new VehicleLocation('id2', 4, 5, 6)
        ]
      ),
      new LineLocation(
        new LineLocationLine('2', 'type2', 'subtype2'),
        [
          new VehicleLocation('id3', 7, 8, 9)
        ]
      )
    ]);

    const request = new Request('get', '/vehicles', undefined);
    const response = await send(router, request);
    expect(controllers.vehicleLocation.getVehicleLocationsCallCount).toEqual(1);
    expect(controllers.vehicleLocation.updateVehicleLocationsCallCount).toEqual(0);
    expect(controllers.vehicleLocation.lineNamesLowerCaseArg).toEqual(new Set());

    const headers = response.headers;
    expect(headers['Connection']).toEqual('Keep-Alive');
    expect(headers['Keep-Alive']).toEqual('timeout=10, max=30');
    expect(headers['Cache-Control']).toEqual('no-store');

    const body = response.body;
    const expectedBody = `{"timestamp":"TIMESTAMP","data":[{"line":{"name":"1","type":"type1","subtype":"subtype1"},"vehicles":[{"id":"id1","lat":1,"lng":2,"angle":3},{"id":"id2","lat":4,"lng":5,"angle":6}]},{"line":{"name":"2","type":"type2","subtype":"subtype2"},"vehicles":[{"id":"id3","lat":7,"lng":8,"angle":9}]}]}`;
    expect(body).toEqual(expectedBody);
  });

  it('GET with query', async function () {
    const logger = new LoggerMock();
    const controllers = createControllers();
    const router = createApiV1Router(controllers, logger);

    controllers.vehicleLocation.data = new LineLocationCollection('TIMESTAMP', [
      new LineLocation(
        new LineLocationLine('1', 'type1', 'subtype1'),
        [
          new VehicleLocation('id1', 1, 2, 3),
          new VehicleLocation('id2', 4, 5, 6)
        ]
      ),
      new LineLocation(
        new LineLocationLine('2', 'type2', 'subtype2'),
        [
          new VehicleLocation('id3', 7, 8, 9)
        ]
      )
    ]);

    const query = { lines: 'D;C;A;110;119;114;131;241;32;9;6' };
    const request = new Request('get', '/vehicles', query);
    const response = await send(router, request);
    expect(controllers.vehicleLocation.getVehicleLocationsCallCount).toEqual(1);
    expect(controllers.vehicleLocation.updateVehicleLocationsCallCount).toEqual(0);
    expect(controllers.vehicleLocation.lineNamesLowerCaseArg).toEqual(new Set(['d', 'c', 'a', '110', '119', '114', '131', '241', '32', '9', '6']));

    const headers = response.headers;
    expect(headers['Connection']).toEqual('Keep-Alive');
    expect(headers['Keep-Alive']).toEqual('timeout=10, max=30');
    expect(headers['Cache-Control']).toEqual('no-store');

    const body = response.body;
    const expectedBody = `{"timestamp":"TIMESTAMP","data":[{"line":{"name":"1","type":"type1","subtype":"subtype1"},"vehicles":[{"id":"id1","lat":1,"lng":2,"angle":3},{"id":"id2","lat":4,"lng":5,"angle":6}]},{"line":{"name":"2","type":"type2","subtype":"subtype2"},"vehicles":[{"id":"id3","lat":7,"lng":8,"angle":9}]}]}`;
    expect(body).toEqual(expectedBody);
  });
});
