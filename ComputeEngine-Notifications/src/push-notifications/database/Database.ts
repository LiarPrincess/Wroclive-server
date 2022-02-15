import { DatabaseType } from './DatabaseType';
import { PushNotification } from '../PushNotification';
import { AppleSendError } from 'push-notifications/apple';
import {
  FirestorePushNotification,
  FirestorePushNotificationDatabase,
} from '../../cloud-platform';

export class Database implements DatabaseType {

  private readonly database: FirestorePushNotificationDatabase;
  private sendPushNotificationIds: Set<string> | undefined;

  public constructor(db: FirestorePushNotificationDatabase) {
    this.database = db;
  }

  /* ==================== */
  /* === Already send === */
  /* ==================== */

  public async wasAlreadySend(notification: PushNotification): Promise<boolean> {
    const sendIds = await this.getSendPushNotificationIds();
    return sendIds.has(notification.id);
  }

  private async getSendPushNotificationIds(): Promise<Set<string>> {
    if (this.sendPushNotificationIds !== undefined) {
      return this.sendPushNotificationIds;
    }

    const ids = await this.database.getPushNotificationIds();
    this.sendPushNotificationIds = new Set<string>(ids);
    return this.sendPushNotificationIds;
  }

  /* ============= */
  /* === Store === */
  /* ============= */

  public async storeNotificationTooOldToSend(notification: PushNotification) {
    const n: FirestorePushNotification = {
      status: { kind: 'Too old' },
      ...notification
    };

    await this.storePushNotificationInFirestore(n);
  }

  public async storeSendNotification(
    notification: PushNotification,
    sendAt: Date,
    appleDelivered: string[],
    appleFailed: AppleSendError[]
  ) {
    const n: FirestorePushNotification = {
      status: { kind: 'Send', sendAt, appleDelivered, appleFailed },
      ...notification
    };

    await this.storePushNotificationInFirestore(n);
  }

  public async storeSendError(notification: PushNotification, error: any) {
    const n: FirestorePushNotification = {
      status: { kind: 'Error', error },
      ...notification
    };

    await this.storePushNotificationInFirestore(n);
  }

  private async storePushNotificationInFirestore(notification: FirestorePushNotification) {
    const postedIds = await this.getSendPushNotificationIds();
    postedIds.add(notification.id);

    await this.database.addPushNotification(notification);
  }

  /* ============== */
  /* === Tokens === */
  /* ============== */

  public async getApplePushNotificationTokens(): Promise<string[]> {
    const result = await this.database.getApplePushNotificationTokens();
    return result;
  }
}
