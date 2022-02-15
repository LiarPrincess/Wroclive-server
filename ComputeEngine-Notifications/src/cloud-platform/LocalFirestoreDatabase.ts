import { FirestoreDatabaseType } from './FirestoreDatabaseType';
import { FirestorePushNotification } from './FirestorePushNotificationDatabase';
import { Logger } from '../util';

export class LocalFirestoreDatabase implements FirestoreDatabaseType {

  private readonly pushNotificationIds: string[] = [];

  public constructor(
    private readonly applePushNotificationTokens: string[],
    private readonly logger: Logger
  ) { }

  public async getPushNotificationIds(): Promise<string[]> {
    return this.pushNotificationIds;
  }

  public async addPushNotification(notification: FirestorePushNotification) {
    const status = notification.status.kind.toUpperCase();

    const date = notification.createdAt.toISOString()
      .substring(0, 16)
      .replace('T', ' ');

    const body = notification.body
      .substring(0, 40)
      .replace(/\n/g, ' ') + '…';

    this.logger.info(`[FirestoreDatabase] Adding push notification: [${status}][${date}] ${body}`);
    this.pushNotificationIds.push(notification.id);
  }

  public async getApplePushNotificationTokens(): Promise<string[]> {
    return this.applePushNotificationTokens;
  }
}
