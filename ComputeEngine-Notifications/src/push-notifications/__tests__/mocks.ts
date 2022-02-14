import { PushNotification } from '../PushNotification';
import { DatabaseType, StoredPushNotification } from '../database';
import { ApplePushNotificationsType, AppleDeviceToken, AppleSendResult } from '../apple';
import { Logger } from '../../util';

export class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void { }
  error(message?: any, ...optionalParams: any[]): void { }
}

export class DatabaseMock implements DatabaseType {

  public alreadySendIds: string[] = [];
  public wasAlreadySendCallCount = 0;

  public async wasAlreadySend(notification: PushNotification): Promise<boolean> {
    this.wasAlreadySendCallCount++;
    return this.alreadySendIds.includes(notification.id);
  }

  public markedAsSend: StoredPushNotification[] = [];

  public async store(notification: StoredPushNotification): Promise<void> {
    this.markedAsSend.push(notification);
  }

  public applePushNotificationTokens: string[] = [];
  public getApplePushNotificationTokensCallCount = 0;

  public async getApplePushNotificationTokens(): Promise<string[]> {
    this.getApplePushNotificationTokensCallCount++;
    return this.applePushNotificationTokens;
  }
}

export class ApplePushNotificationsMock implements ApplePushNotificationsType {

  public sendArgs: any[] = [];
  public sendResult: AppleSendResult = { kind: 'Success', delivered: [], failed: [] };

  async send(
    notification: PushNotification,
    deviceTokens: AppleDeviceToken[]
  ): Promise<AppleSendResult> {
    this.sendArgs.push({ notification, deviceTokens });
    return this.sendResult;
  }
}
