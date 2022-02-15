import {
  SendResult,
  DeviceToken,
  ApplePushNotificationsType
} from './ApplePushNotificationsType';
import { PushNotification } from '../PushNotification';
import { Logger } from '../../util';

export class LocalApplePushNotifications implements ApplePushNotificationsType {

  public constructor(
    private readonly logger: Logger
  ) { }

  public async send(notification: PushNotification, deviceTokens: DeviceToken[]): Promise<SendResult> {
    const body = notification.body.replace(/\n/g, ' ');
    const tokenCount = deviceTokens.length;
    this.logger.info(`[APN] Sending: ${body} to ${tokenCount} devices.`);
    return new SendResult(deviceTokens, []);
  }
}
