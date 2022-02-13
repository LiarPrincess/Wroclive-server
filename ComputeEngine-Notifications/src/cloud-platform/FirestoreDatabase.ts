import * as fs from '@google-cloud/firestore';

import {
  FirestorePushNotification,
  FirestorePushNotificationDatabase
} from './FirestorePushNotificationDatabase';
import { CloudPlatform } from './CloudPlatform';

export class FirestoreDatabase implements FirestorePushNotificationDatabase {

  private db: fs.Firestore;

  constructor() {
    this.db = new fs.Firestore({
      projectId: CloudPlatform.projectId(),
      keyFilename: CloudPlatform.credentialsFile()
    });

    // We need 'ignoreUndefinedProperties' to allow lines without 'stopArrivalTimes'.
    this.db.settings({
      ignoreUndefinedProperties: true
    });
  }

  /* ========================== */
  /* === Push notifications === */
  /* ========================== */

  private get pushNotificationsCollectionRef(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('PushNotifications');
  }

  public async getPushNotificationIds(): Promise<string[]> {
    const result: string[] = [];

    const documentRefs = await this.pushNotificationsCollectionRef.listDocuments();
    documentRefs.forEach(docRef => {
      result.push(docRef.id);
    });

    return result;
  }

  public async addPushNotification(notification: FirestorePushNotification) {
    const id = notification.id;
    const documentRef = this.pushNotificationsCollectionRef.doc(id);
    await documentRef.set(notification);
  }

  /* ====================================== */
  /* === Apple push notification tokens === */
  /* ====================================== */

  private get applePushNotificationTokensCollectionRef(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('PushNotificationTokensApple');
  }

  public async getApplePushNotificationTokens(): Promise<string[]> {
    const collectionRef = this.applePushNotificationTokensCollectionRef;
    const query = await collectionRef
      .where('token', '!=', 'null')
      .select('token')
      .get();

    const result: string[] = [];
    query.forEach(doc => {
      const data = doc.data();
      result.push(data.token);
    });

    return [];
  }
}
