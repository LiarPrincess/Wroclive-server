import { FirestoreDatabaseType } from "./FirestoreDatabaseType";
import { FirestorePushNotification } from "./FirestorePushNotificationDatabase";
import { FirestoreAllNotificationsDocument } from "./FirestoreNotificationDatabase";
import { Logger } from "../util";

export class LocalFirestoreDatabase implements FirestoreDatabaseType {
  private readonly pushNotificationIds: string[] = [];
  private notifications: FirestoreAllNotificationsDocument = { timestamp: "TIMESTAMP", data: [] };

  public constructor(private readonly applePushNotificationTokens: string[], private readonly logger: Logger) {}

  /* ===================== */
  /* === Notifications === */
  /* ===================== */

  public async getNotifications(): Promise<FirestoreAllNotificationsDocument | undefined> {
    return this.notifications;
  }

  public async storeNotifications(document: FirestoreAllNotificationsDocument) {
    this.logger.info(`[FirestoreDatabase] Storing notifications (timestamp: ${document.timestamp}):`);

    for (const notification of document.data) {
      const date = this.formatDate(notification.date);
      const body = this.formatBody(notification.body, 60);
      this.logger.info(`  [${date}] ${body}`);
    }

    this.notifications = document;
  }

  private formatDate(date: string): string {
    return date.substring(0, 16).replace("T", " ");
  }

  private formatBody(body: string, length: number): string {
    return body.substring(0, length).replace(/\n/g, " ") + "…";
  }

  /* ========================== */
  /* === Push notifications === */
  /* ========================== */

  public async getPushNotificationIds(): Promise<string[]> {
    return this.pushNotificationIds;
  }

  public async addPushNotification(notification: FirestorePushNotification) {
    const status = notification.status.kind.toUpperCase();
    const date = this.formatDate(notification.createdAt);
    const body = this.formatBody(notification.body, 40);

    this.logger.info(`[FirestoreDatabase] Adding push notification: [${status}][${date}] ${body}`);
    this.pushNotificationIds.push(notification.id);
  }

  /* ====================================== */
  /* === Apple push notification tokens === */
  /* ====================================== */

  public async getApplePushNotificationTokens(): Promise<string[]> {
    return this.applePushNotificationTokens;
  }
}
