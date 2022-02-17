import { Request, send } from './express-hacks';
import { Line, LineCollection, LoggerMock, createControllers } from './helpers';
import { createApiV1Router } from '..';

describe('/api/v1/notifications', function () {
  it('GET', async function () {
    const logger = new LoggerMock();
    const controllers = createControllers();
    const router = createApiV1Router(controllers, logger);

    controllers.notifications.notifications = {
      timestamp: 'TIMESTAMP',
      data: [
        { id: 'id_1', url: 'url_1', author: 'author_1', date: new Date(3), body: 'body_1' },
        { id: 'id_2', url: 'url_2', author: 'author_2', date: new Date(5), body: 'body_2' },
        { id: 'id_3', url: 'url_3', author: 'author_3', date: new Date(7), body: 'body_3' }
      ]
    };

    const request = new Request('get', '/notifications');
    const response = await send(router, request);
    expect(controllers.notifications.getNotificationsCallCount).toEqual(1);

    const headers = response.headers;
    expect(headers['Connection']).toEqual('Keep-Alive');
    expect(headers['Keep-Alive']).toEqual('timeout=10, max=30');
    expect(headers['Cache-Control']).toEqual('max-age=120'); // 2 min

    const body = response.body;
    const expectedBody = `{"timestamp":"TIMESTAMP","data":[{"id":"id_1","url":"url_1","author":"author_1","date":"1970-01-01T00:00:00.003Z","body":"body_1"},{"id":"id_2","url":"url_2","author":"author_2","date":"1970-01-01T00:00:00.005Z","body":"body_2"},{"id":"id_3","url":"url_3","author":"author_3","date":"1970-01-01T00:00:00.007Z","body":"body_3"}]}`;
    expect(body).toEqual(expectedBody);
  });
});
