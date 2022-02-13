import { Request, send } from './express-hacks';
import { LoggerMock, createControllers } from './helpers';
import { createApiV1Router } from '..';

describe('/notification-tokens', function () {

  it('POST valid body -> successful save', async function () {
    const logger = new LoggerMock();
    const controllers = createControllers();
    const router = createApiV1Router(controllers, logger);

    controllers.pushNotificationToken.saveResult = { kind: 'Success' };

    const request = new Request('post', '/notification-tokens');
    request.body = { deviceId: 'DEVICE_ID', token: 'TOKEN_VALUE', platform: 'iOS' };

    const response = await send(router, request);
    expect(response.statusCode).toEqual(200);
    expect(controllers.pushNotificationToken.saveArg).toEqual(request.body);
  });

  it('POST valid body -> failed save', async function () {
    const logger = new LoggerMock();
    const controllers = createControllers();
    const router = createApiV1Router(controllers, logger);

    controllers.pushNotificationToken.saveResult = { kind: 'Error', error: 'ERROR' };

    const request = new Request('post', '/notification-tokens');
    request.body = { deviceId: 'DEVICE_ID', token: 'TOKEN_VALUE', platform: 'iOS' };

    const response = await send(router, request);
    expect(response.statusCode).toEqual(500);
    expect(controllers.pushNotificationToken.saveArg).toEqual(request.body);
  });

  it('POST invalid body', async function () {
    const logger = new LoggerMock();
    const controllers = createControllers();
    const router = createApiV1Router(controllers, logger);

    const presets = [
      { deviceId: '', token: 'TOKEN_VALUE', platform: 'iOS' },
      { deviceId: 123, token: 'TOKEN_VALUE', platform: 'iOS' },
      { deviceId: 'DEVICE_ID', token: '', platform: 'iOS' },
      { deviceId: 'DEVICE_ID', token: 456, platform: 'iOS' },
      { deviceId: 'DEVICE_ID', token: 'TOKEN_VALUE', platform: '' },
      { deviceId: 'DEVICE_ID', token: 'TOKEN_VALUE', platform: 789 }
    ];

    for (const body of presets) {
      const request = new Request('post', '/notification-tokens');
      request.body = body;

      const response = await send(router, request);
      expect(response.statusCode).toEqual(400);
      expect(controllers.pushNotificationToken.saveArg).toBeUndefined();
    }
  });

  it('POST without body', async function () {
    const logger = new LoggerMock();
    const controllers = createControllers();
    const router = createApiV1Router(controllers, logger);

    const request = new Request('post', '/notification-tokens');
    request.body = undefined;

    const response = await send(router, request);
    expect(response.statusCode).toEqual(400);
    expect(controllers.pushNotificationToken.saveArg).toBeUndefined();
  });
});
