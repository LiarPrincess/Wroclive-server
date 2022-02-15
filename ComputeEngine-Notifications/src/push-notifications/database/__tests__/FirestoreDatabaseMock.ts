import {
  FirestorePushNotification,
  FirestorePushNotificationDatabase
} from '../../../cloud-platform';

export class FirestoreDatabaseMock implements FirestorePushNotificationDatabase {

  public pushNotificationIds: string[] = [];
  public getPushNotificationIdsCallCount = 0;

  public async getPushNotificationIds(): Promise<string[]> {
    this.getPushNotificationIdsCallCount++;
    return this.pushNotificationIds;
  }

  public addedPushNotifications: FirestorePushNotification[] = [];

  public async addPushNotification(notification: FirestorePushNotification) {
    this.addedPushNotifications.push(notification);
  }

  public applePushNotificationTokens: string[] = [];
  public getApplePushNotificationTokensCallCount = 0;

  public async getApplePushNotificationTokens(): Promise<string[]> {
    this.getApplePushNotificationTokensCallCount++;
    return this.applePushNotificationTokens;
  }
}
