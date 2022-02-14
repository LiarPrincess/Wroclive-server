import * as fs from '@google-cloud/firestore';

import {
  FirestorePushNotification,
  FirestorePushNotificationDatabase,
  FirestorePushNotificationAppleStatus
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
    // Firestore doesn't support JavaScript objects with custom prototypes
    // (i.e. objects that were created via the "new" operator).
    //
    // Solution: we have to create a new object.
    const n: FirestorePushNotification = {
      id: notification.id,
      threadId: notification.threadId,
      body: notification.body,
      sendAt: notification.sendAt,
      apple: notification.apple === undefined ? undefined : {
        delivered: notification.apple.delivered,
        errors: notification.apple.errors
      }
    };

    const id = n.id;
    const documentRef = this.pushNotificationsCollectionRef.doc(id);
    await documentRef.set(n);
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
