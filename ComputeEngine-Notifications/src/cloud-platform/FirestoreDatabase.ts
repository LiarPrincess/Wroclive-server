import * as fs from '@google-cloud/firestore';

import {
  FirestoreNotification,
  FirestoreAllNotificationsDocument
} from './FirestoreNotificationDatabase';
import {
  FirestorePushNotification,
  FirestorePushNotificationStatus
} from './FirestorePushNotificationDatabase';
import { CloudPlatform } from './CloudPlatform';
import { FirestoreDatabaseType } from './FirestoreDatabaseType';

/**
 * 'YYMMDD_hhmm_id', for example: '220101_0942_1491029797811548167'.
 */
export function createPushNotificationKey(id: string, createdAt: Date): string {
  const year = createdAt.getUTCFullYear();
  const YY = year % 100;

  const month = createdAt.getUTCMonth() + 1;
  const MM = (month < 10 ? '0' : '') + String(month);

  const day = createdAt.getUTCDate();
  const DD = (day < 10 ? '0' : '') + String(day);

  const hour = createdAt.getUTCHours();
  const hh = hour === 0 ? '00' :
    hour < 10 ? '0' + String(hour) :
      String(hour);

  const minute = createdAt.getUTCMinutes();
  const mm = minute === 0 ? '00' :
    minute < 10 ? '0' + String(minute) :
      String(minute);

  return `${YY}${MM}${DD}_${hh}${mm}_${id}`;
}

export function getPushNotificationIdFromKey(key: string): string {
  return key.substring(12);
}

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

  /* ===================== */
  /* === Notifications === */
  /* ===================== */

  private get notificationsCollectionRef(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('Notifications');
  }

  private get allNotificationsDocumentRef(): fs.DocumentReference<any> {
    return this.notificationsCollectionRef.doc('all');
  }

  public async getNotifications(): Promise<FirestoreAllNotificationsDocument | undefined> {
    const doc = await this.allNotificationsDocumentRef.get();
    const data = doc.data() as FirestoreAllNotificationsDocument | undefined;
    return data;
  }

  public async storeNotifications(document: FirestoreAllNotificationsDocument) {
    // Firestore doesn't support JavaScript objects with custom prototypes
    // (i.e. objects that were created via the "new" operator).
    //
    // Solution: we have to create a new object.

    const data: FirestoreNotification[] = [];
    for (const notification of document.data) {
      data.push({
        id: notification.id,
        url: notification.url,
        author: notification.author,
        date: notification.date,
        body: notification.body,
      });
    }

    const storedDocument: FirestoreAllNotificationsDocument = {
      timestamp: document.timestamp,
      data
    };

    await this.allNotificationsDocumentRef.set(storedDocument);
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
      const id = getPushNotificationIdFromKey(docRef.id);
      result.push(id);
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
      url: notification.url,
      author: notification.author,
      createdAt: notification.createdAt,
      body: notification.body,
      status
    };

    const key = createPushNotificationKey(n.id, n.createdAt);
    const documentRef = this.pushNotificationsCollectionRef.doc(key);
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

    return result;
  }
}
