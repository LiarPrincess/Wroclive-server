import { NotificationCollection } from './models';
import { NotificationsControllerType } from './NotificationsControllerType';
import { FirestoreNotificationDatabase } from '../../cloud-platform';
import { Logger } from '../../util';

export class FirestoreNotificationsController extends NotificationsControllerType {

  private db: FirestoreNotificationDatabase;
  private logger: Logger;

  constructor(db: FirestoreNotificationDatabase, logger: Logger) {
    super();
    this.db = db;
    this.logger = logger;
  }

  public async getNotifications(): Promise<NotificationCollection> {
    const result = await this.db.getNotifications();

    if (result === undefined) {
      this.logger.error('[NotificationsController] No notifications in firestore database?');
      // There is nothing else we can do:
      return { timestamp: 'TIMESTAMP', data: [] };
    }

    return result;
  }
}
