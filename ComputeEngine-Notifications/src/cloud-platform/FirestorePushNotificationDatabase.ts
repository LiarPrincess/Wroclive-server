export interface FirestorePushNotificationAppleStatus {
  readonly delivered: string[];
  readonly errors: { device: string, reason: string }[];
}

export interface FirestorePushNotification {
  readonly id: string;
  readonly threadId: string;
  readonly body: string;
  readonly sendAt: Date | 'Not send';
  readonly apple?: FirestorePushNotificationAppleStatus
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
