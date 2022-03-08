import { Request, send } from './express-hacks';
import { Stop, StopCollection, LoggerMock, createControllers } from './helpers';
import { createApiV1Router } from '..';

describe('/api/v1/stops', function () {
  it('GET', async function () {
    const logger = new LoggerMock();
    const controllers = createControllers();
    const router = createApiV1Router(controllers, logger);

    controllers.stops.data = new StopCollection('TIMESTAMP', [
      new Stop('code1', 'name1', 1, 2),
      new Stop('code2', 'name2', 3, 4),
      new Stop('code3', 'name3', 5, 6)
    ]);

    const request = new Request('get', '/stops');
    const response = await send(router, request);
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
});
