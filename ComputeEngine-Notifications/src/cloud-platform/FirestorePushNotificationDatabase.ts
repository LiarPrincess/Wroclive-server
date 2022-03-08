export type FirestorePushNotificationStatus =
  { kind: 'Too old' } |
  {
    kind: 'Send',
    /** Send date in ISO_8601 format. */
    sendAt: string,
    appleDelivered: string[],
    appleFailed: { device: string, reason: string }[]
  } |
  {
    kind: 'Error',
    error: any
  };

export interface FirestorePushNotification {
  readonly id: string;
  /** An app-specific identifier for grouping related notifications. */
  readonly threadId: string;
  readonly url: string;
  readonly author: string;
  /** Original creation date (not the send date) in ISO_8601 format. */
  readonly createdAt: string;
  readonly body: string;
  readonly status: FirestorePushNotificationStatus;
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
