import { Request, send } from './express-hacks';
import { LoggerMock, createControllers } from './helpers';
import { createApiV1Router } from '..';

describe('/api/v1/notifications', function () {
  it('GET', async function () {
    const logger = new LoggerMock();
    const controllers = createControllers();
    const router = createApiV1Router(controllers, logger);

    controllers.notifications.notifications = {
      timestamp: 'TIMESTAMP',
      data: [
        { id: 'ID1', url: 'URL1', author: { name: 'NAME1', username: 'USERNAME1' }, date: 'DATE1', body: 'BODY1' },
        { id: 'ID2', url: 'URL2', author: { name: 'NAME2', username: 'USERNAME2' }, date: 'DATE2', body: 'BODY2' },
        { id: 'ID3', url: 'URL3', author: { name: 'NAME3', username: 'USERNAME3' }, date: 'DATE3', body: 'BODY3' }
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
    const expectedBody = '{"timestamp":"TIMESTAMP","data":[\
{"id":"ID1","url":"URL1","author":{"name":"NAME1","username":"USERNAME1"},"date":"DATE1","body":"BODY1"},\
{"id":"ID2","url":"URL2","author":{"name":"NAME2","username":"USERNAME2"},"date":"DATE2","body":"BODY2"},\
{"id":"ID3","url":"URL3","author":{"name":"NAME3","username":"USERNAME3"},"date":"DATE3","body":"BODY3"}]}';

    expect(body).toEqual(expectedBody);
  });
});
