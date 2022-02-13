import { Request, send } from './express-hacks';
import { Line, LineCollection, LoggerMock, createControllers } from './helpers';
import { createApiV1Router } from '..';

describe('/api/v1/lines', function () {
  it('GET', async function () {
    const logger = new LoggerMock();
    const controllers = createControllers();
    const router = createApiV1Router(controllers, logger);

    controllers.lines.data = new LineCollection('TIMESTAMP', [
      new Line('1', 'type1', 'subtype1'),
      new Line('2', 'type2', 'subtype2', { min: 1, max: 2 }),
      new Line('3', 'type3', 'subtype3'),
    ]);

    const request = new Request('get', '/lines');
    const response = await send(router, request);
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
});
