export interface FirestorePushNotificationToken {
  readonly deviceId: string;
  readonly token: string;
  readonly createdAt: Date;
}

export interface FirestorePushNotificationTokenDatabase {
  saveApplePushNotificationToken(token: FirestorePushNotificationToken): Promise<void>;
}
