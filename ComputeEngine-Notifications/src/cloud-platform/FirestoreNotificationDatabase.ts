export interface FirestoreNotification {
  readonly id: string;
  readonly url: string;
  readonly author: {
    readonly name: string;
    readonly username: string;
  };
  /** Creation date in ISO_8601 format. */
  readonly date: string;
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

  storeNotifications(document: FirestoreAllNotificationsDocument): Promise<void>;
}
