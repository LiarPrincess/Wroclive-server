import { Line, LineCollection } from '../../../controllers/lines';
import { Stop, StopCollection } from '../../../controllers/stops';
import {
  VehicleLocation,
  LineLocation,
  LineLocationLine,
  LineLocationCollection
} from '../../../controllers/vehicle-locations';
import {
  FakeLinesController,
  FakeStopsController,
  FakeVehicleLocationsController,
  FakeControllers
} from '../../../controllers/fakes';
import { createApiV1Router } from '..';
import { Request, send } from './express-hacks';

function createControllers(): FakeControllers {
  return {
    lines: new FakeLinesController(),
    stops: new FakeStopsController(),
    vehicleLocation: new FakeVehicleLocationsController()
  };
}

describe('createApiV1Router', function () {

  it('/lines', function () {
    const controllers = createControllers();
    const router = createApiV1Router(controllers);

    controllers.lines.data = new LineCollection('TIMESTAMP', [
      new Line('1', 'type1', 'subtype1'),
      new Line('2', 'type2', 'subtype2', { min: 1, max: 2 }),
      new Line('3', 'type3', 'subtype3'),
    ]);

    const request = new Request('get', '/lines');
    const response = send(router, request);
    expect(controllers.lines.getLinesCallCount).toEqual(1);
    expect(controllers.lines.updateLinesCallCount).toEqual(0);

    const headers = response.headers;
    expect(headers['Connection']).toEqual('Keep-Alive');
    expect(headers['Keep-Alive']).toEqual('timeout=10, max=30');
    expect(headers['Cache-Control']).toEqual('max-age=21600'); // 6 hours

    const body = response.body;
    const expectedBody = `{"timestamp":"TIMESTAMP","data":[{"name":"1","type":"type1","subtype":"subtype1"},{"name":"2","type":"type2","subtype":"subtype2"},{"name":"3","type":"type3","subtype":"subtype3"}]}`;
    expect(body).toEqual(expectedBody);
  });

  it('/stops', function () {
    const controllers = createControllers();
    const router = createApiV1Router(controllers);

    controllers.stops.data = new StopCollection('TIMESTAMP', [
      new Stop('code1', 'name1', 1, 2),
      new Stop('code2', 'name2', 3, 4),
      new Stop('code3', 'name3', 5, 6)
    ]);

    const request = new Request('get', '/stops');
    const response = send(router, request);
    expect(controllers.stops.getStopsCallCount).toEqual(1);
    expect(controllers.stops.updateStopsCallCount).toEqual(0);

    const headers = response.headers;
    expect(headers['Connection']).toEqual('Keep-Alive');
    expect(headers['Keep-Alive']).toEqual('timeout=10, max=30');
    expect(headers['Cache-Control']).toEqual('max-age=259200'); // 3 days

    const body = response.body;
    const expectedBody = `{"timestamp":"TIMESTAMP","data":[{"code":"code1","name":"name1","lat":1,"lng":2},{"code":"code2","name":"name2","lat":3,"lng":4},{"code":"code3","name":"name3","lat":5,"lng":6}]}`;
    expect(body).toEqual(expectedBody);
  });

  it('/vehicles without query', function () {
    const controllers = createControllers();
    const router = createApiV1Router(controllers);

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

    const request = new Request('get', '/vehicles');
    const response = send(router, request);
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

  it('/vehicles with query', function () {
    const controllers = createControllers();
    const router = createApiV1Router(controllers);

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
    const response = send(router, request);
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
