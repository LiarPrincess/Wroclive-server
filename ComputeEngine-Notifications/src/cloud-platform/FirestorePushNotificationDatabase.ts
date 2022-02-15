export type FirestorePushNotificationStatus =
  { kind: 'Too old' } |
  {
    kind: 'Send',
    sendAt: Date,
    appleDelivered: string[],
    appleFailed: { device: string, reason: string }[]
  } |
  {
    kind: 'Error',
    error: any
  };

export interface FirestorePushNotification {
  readonly id: string;
  readonly threadId: string;
  readonly body: string;
  /** Original creation date (not the send date). */
  readonly createdAt: Date;
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
