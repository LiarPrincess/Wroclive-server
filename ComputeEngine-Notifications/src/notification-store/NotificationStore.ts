import { StoredNotification } from './models';
import { CleanTweet } from '../CleanTweet';
import {
  FirestoreAllNotificationDocument,
  FirestoreNotificationDatabase
} from '../cloud-platform';

export type DateProvider = () => Date;

export class NotificationStore {

  private readonly database: FirestoreNotificationDatabase;
  private readonly dateProvider: DateProvider;
  private notificationIdsInDatabase: Set<string> | undefined;

  public constructor(
    database: FirestoreNotificationDatabase,
    dateProvider?: DateProvider
  ) {
    this.database = database;
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

    const document: FirestoreAllNotificationDocument = {
      timestamp,
      data: notifications
    };

    await this.database.storeNotifications(document);
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

    const document = await this.database.getNotifications();
    const result = new Set<string>();

    if (document !== undefined) {
      for (const notification of document.data) {
        result.add(notification.id);
      }
    }

    this.notificationIdsInDatabase = result;
    return result;
  }
}
