export interface FirestoreNotification {
  readonly id: string;
  readonly url: string;
  readonly author: string;
  readonly date: number;
  readonly body: string;
}

export interface FirestoreAllNotificationsDocument {
  readonly timestamp: string;
  readonly data: FirestoreNotification[];
}

export interface FirestoreNotificationDatabase {
  /**
   * All of the notifications stored in the database.
   */
  getNotifications(): Promise<FirestoreAllNotificationsDocument | undefined>;
}
