import * as wrapper from './node-apn-wrapper';
import {
  SendResult,
  DeviceToken,
  ApplePushNotificationsType
} from './ApplePushNotificationsType';
import { PushNotification } from '../PushNotification';

export class ApplePushNotifications implements ApplePushNotificationsType {

  private readonly provider: wrapper.Provider;

  public constructor(options: wrapper.Options) {
    this.provider = new wrapper.Provider(options);
  }

  public async send(
    notification: PushNotification,
    deviceTokens: DeviceToken[]
  ): Promise<SendResult> {
    // https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification
    const wrapperNotification: wrapper.Notification = {
      aps: {
        alert: {
          title: undefined,
          subtitle: undefined,
          body: notification.body
        },
        'thread-id': notification.threadId
      },
      payload: {
        url: notification.url
      },
      pushType: 'alert'
    };

    const result = await this.provider.send(wrapperNotification, deviceTokens);
    return result;
  }
}
