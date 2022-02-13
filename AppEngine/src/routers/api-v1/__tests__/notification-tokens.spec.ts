import { Request, send } from './express-hacks';
import { createControllers } from './helpers';
import { createApiV1Router } from '..';

describe('/notification-tokens', function () {

  it('POST valid iOS', function () {
    const controllers = createControllers();
    const router = createApiV1Router(controllers);

    const request = new Request('post', '/notification-tokens');
    request.body = { deviceId: 'DEVICE_ID', token: 'TOKEN_VALUE', platform: 'iOS' };

    const response = send(router, request);
    expect(response.statusCode).toEqual(200);
  });

  it('POST invalid body', function () {
    const controllers = createControllers();
    const router = createApiV1Router(controllers);

    const presets = [
      { deviceId: 123, token: 'TOKEN_VALUE', platform: 'iOS' },
      { deviceId: 'DEVICE_ID', token: 456, platform: 'iOS' },
      { deviceId: 'DEVICE_ID', token: 'TOKEN_VALUE', platform: 789 }
    ];

    for (const body of presets) {
      const request = new Request('post', '/notification-tokens');
      request.body = body;

      const response = send(router, request);
      expect(response.statusCode).toEqual(400);
    }
  });

  it('POST without body', function () {
    const controllers = createControllers();
    const router = createApiV1Router(controllers);

    const request = new Request('post', '/notification-tokens');
    request.body = undefined;

    const response = send(router, request);
    expect(response.statusCode).toEqual(400);
  });
});
