import { DatabaseType } from '../database';
import { PushNotification } from '../PushNotification';
import { ApplePushNotificationsType, AppleDeviceToken, AppleSendResult, AppleSendError } from '../apple';
import { Logger } from '../../util';

export class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void { }
  error(message?: any, ...optionalParams: any[]): void { }
}

export class DatabaseMock implements DatabaseType {

  /* ==================== */
  /* === Already send === */
  /* ==================== */

  public alreadySendIds: string[] = [];
  public wasAlreadySendArgs: PushNotification[] = [];

  public async wasAlreadySend(notification: PushNotification): Promise<boolean> {
    this.wasAlreadySendArgs.push(notification);
    return this.alreadySendIds.includes(notification.id);
  }

  /* ============= */
  /* === Store === */
  /* ============= */

  public storedTooOld: PushNotification[] = [];
  public storedSendNotifications: any[] = [];
  public storedSendErrors: any[] = [];

  public async storeNotificationTooOldToSend(notification: PushNotification) {
    this.storedTooOld.push(notification);
  }

  public async storeSendNotification(
    notification: PushNotification,
    sendAt: Date,
    appleDelivered: string[],
    appleFailed: AppleSendError[]
  ) {
    this.storedSendNotifications.push({ notification, sendAt, appleDelivered, appleFailed });
  }

  public async storeSendError(notification: PushNotification, error: any) {
    this.storedSendErrors.push({ notification, error });
  }

  /* ============== */
  /* === Tokens === */
  /* ============== */

  public applePushNotificationTokens: string[] = [];
  public getApplePushNotificationTokensCallCount = 0;

  public async getApplePushNotificationTokens(): Promise<string[]> {
    this.getApplePushNotificationTokensCallCount++;
    return this.applePushNotificationTokens;
  }
}

export class ApplePushNotificationsMock implements ApplePushNotificationsType {

  public sendArgs: any[] = [];
  public sendResult: AppleSendResult | Error = new AppleSendResult([], []);

  async send(
    notification: PushNotification,
    deviceTokens: AppleDeviceToken[]
  ): Promise<AppleSendResult> {
    this.sendArgs.push({ notification, deviceTokens });

    if (this.sendResult instanceof AppleSendResult) {
      return this.sendResult;
    }

    throw this.sendResult;
  }
}
