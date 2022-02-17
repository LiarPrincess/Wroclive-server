import { StoredNotification } from './StoredNotification';
import { CleanTweet } from '../CleanTweet';
import {
  FirestoreNotification,
  FirestoreAllNotificationsDocument,
  FirestoreNotificationDatabase
} from '../cloud-platform';
import { Logger } from '../util';

export type DateProvider = () => Date;

export class Store {

  private readonly database: FirestoreNotificationDatabase;
  private readonly logger: Logger;
  private readonly dateProvider: DateProvider;
  private notificationIdsInDatabase: Set<string> | undefined;

  public constructor(
    database: FirestoreNotificationDatabase,
    logger: Logger,
    dateProvider?: DateProvider
  ) {
    this.database = database;
    this.logger = logger;
    this.dateProvider = dateProvider || (() => new Date());
  }

  public async store(tweets: CleanTweet[]) {
    const notifications = tweets.map(t => StoredNotification.fromTweet(t));

    const hasNew = await this.hasNewNotifications(notifications);
    if (!hasNew) {
      return;
    }

    const date = this.dateProvider();
    const timestamp = date.toISOString();

    const document: FirestoreAllNotificationsDocument = {
      timestamp,
      data: notifications
    };

    this.notificationIdsInDatabase = this.toIdSet(notifications);

    try {
      await this.database.storeNotifications(document);
    } catch (error) {
      this.logger.error('[NotificationStore] Error when storing notifications in database.', error);
    }
  }

  private async hasNewNotifications(newNotifications: StoredNotification[]): Promise<boolean> {
    const idInDatabase = await this.getNotificationIdsFromDatabase();

    for (const notification of newNotifications) {
      const isInDatabase = idInDatabase.has(notification.id);
      if (!isInDatabase) {
        return true;
      }
    }

    return false;
  }

  private async getNotificationIdsFromDatabase(): Promise<Set<string>> {
    if (this.notificationIdsInDatabase !== undefined) {
      return this.notificationIdsInDatabase;
    }

    let result: Set<string>;
    try {
      const document = await this.database.getNotifications();
      result = document === undefined ?
        new Set<string>() :
        this.toIdSet(document.data);
    } catch (error) {
      this.logger.error('[NotificationStore] Error when getting notifications from database.', error);
      result = new Set<string>();
    }

    this.notificationIdsInDatabase = result;
    return result;
  }

  private toIdSet(notifications: FirestoreNotification[]): Set<string> {
    const result = new Set<string>();

    for (const notification of notifications) {
      result.add(notification.id);
    }

    return result;
  }
}
