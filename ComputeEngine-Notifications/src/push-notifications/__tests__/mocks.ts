import { PushNotification } from '../PushNotification';
import { AppleEndpointType } from '../apple';
import { DatabaseType, StoredPushNotification } from '../database';
import { Logger } from '../../util';

export class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void { }
  error(message?: any, ...optionalParams: any[]): void { }
}

export class DatabaseMock implements DatabaseType {

  public alreadySendIds: string[] = [];
  public wasAlreadySendCallCount = 0;

  public async wasAlreadySend(id: string): Promise<boolean> {
    this.wasAlreadySendCallCount++;
    return this.alreadySendIds.includes(id);
  }

  public sendNotifications: StoredPushNotification[] = [];

  public async markAsSend(notification: StoredPushNotification): Promise<void> {
    this.sendNotifications.push(notification);
  }

  public applePushNotificationTokens: string[] = [];
  public getApplePushNotificationTokensCallCount = 0;

  public async getApplePushNotificationTokens(): Promise<string[]> {
    this.getApplePushNotificationTokensCallCount++;
    return this.applePushNotificationTokens;
  }
}

export class AppleEndpointMock implements AppleEndpointType {

  public sendArg: any | undefined;

  async send(notifications: PushNotification[], deviceTokens: string[]): Promise<void> {
    this.sendArg = { notifications, deviceTokens };
  }
}
