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
    this.logger.info('[FirestoreDatabase] Adding notification', notification);
    this.pushNotificationIds.push(notification.id);
  }

  public async getApplePushNotificationTokens(): Promise<string[]> {
    return this.applePushNotificationTokens;
  }
}
