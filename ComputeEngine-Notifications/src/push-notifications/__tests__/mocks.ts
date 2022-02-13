import { PushNotification } from '../PushNotification';
import { AppleEndpointType } from '../apple';
import { DatabaseType, StoredPushNotification } from '../database';

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

class AppleEndpointSendArg {
  constructor(
    public readonly notification: PushNotification,
    public readonly deviceTokens: string[]
  ) { }
}

export class AppleEndpointMock implements AppleEndpointType {

  public sendArgs: AppleEndpointSendArg[] = [];

  async send(notification: PushNotification, deviceTokens: string[]): Promise<void> {
    const arg = new AppleEndpointSendArg(notification, deviceTokens);
    this.sendArgs.push(arg);
  }
}
