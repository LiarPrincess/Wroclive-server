import * as fs from '@google-cloud/firestore';

import {
  FirestorePushNotification,
  FirestorePushNotificationStatus
} from './FirestorePushNotificationDatabase';
import { CloudPlatform } from './CloudPlatform';
import { FirestoreDatabaseType } from './FirestoreDatabaseType';

export class FirestoreDatabase implements FirestoreDatabaseType {

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

    let status: FirestorePushNotificationStatus;
    switch (notification.status.kind) {
      case 'Too old':
        status = { kind: 'Too old' };
        break;

      case 'Send':
        status = {
          kind: 'Send',
          sendAt: notification.status.sendAt,
          appleDelivered: notification.status.appleDelivered,
          appleFailed: notification.status.appleFailed.map(f => ({ device: f.device, reason: f.reason }))
        };
        break;

      case 'Error':
        status = { kind: 'Error', error: notification.status.error };
        break;
    }

    const n: FirestorePushNotification = {
      id: notification.id,
      threadId: notification.threadId,
      body: notification.body,
      createdAt: notification.createdAt,
      status
    };

    const documentRef = this.pushNotificationsCollectionRef.doc(n.id);
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
