export interface FirestorePushNotification {
  readonly id: string;
  /**
   * An app-specific identifier for grouping related notifications.
   */
  readonly threadId: string;
  /**
   * Empty if the push notification was not send.
   * This may happen if the tweet is too old to be relevant.
   */
  readonly sendAt: Date | undefined;
  readonly body: string;
}

export interface FirestorePushNotificationDatabase {

  /**
   * Returns ids of all of the push notifications in the database.
   */
  getPushNotificationIds(): Promise<string[]>;

  /**
   * Adds new push notification to database.
   */
  addPushNotification(notification: FirestorePushNotification): Promise<void>;

  /**
   * Get push notification tokens for all of the Apple users.
   */
  getApplePushNotificationTokens(): Promise<string[]>;
}
