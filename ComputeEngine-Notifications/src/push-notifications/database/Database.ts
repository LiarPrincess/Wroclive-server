import { DatabaseType, StoredPushNotification } from './DatabaseType';
import { FirestorePushNotificationDatabase } from '../../cloud-platform';

export class Database implements DatabaseType {

  private readonly database: FirestorePushNotificationDatabase;
  private postedPushNotificationIds: Set<string> | undefined;

  public constructor(db: FirestorePushNotificationDatabase) {
    this.database = db;
  }

  /* ===================== */
  /* === Notifications === */
  /* ===================== */

  public async wasAlreadySend(id: string): Promise<boolean> {
    const postedIds = await this.getPostedPushNotificationIds();
    return postedIds.has(id);
  }

  public async markAsSend(notification: StoredPushNotification): Promise<void> {
    const postedIds = await this.getPostedPushNotificationIds();
    postedIds.add(notification.id);

    await this.database.addPushNotification(notification);
  }

  private async getPostedPushNotificationIds(): Promise<Set<string>> {
    if (this.postedPushNotificationIds !== undefined) {
      return this.postedPushNotificationIds;
    }

    const ids = await this.database.getPushNotificationIds();
    this.postedPushNotificationIds = new Set<string>(ids);
    return this.postedPushNotificationIds;
  }

  /* ============== */
  /* === Tokens === */
  /* ============== */

  public async getApplePushNotificationTokens(): Promise<string[]> {
    const result = await this.database.getApplePushNotificationTokens();
    return result;
  }
}
