import * as fs from '@google-cloud/firestore';

import { CloudPlatform } from './CloudPlatform';

export interface FirestorePushNotification {
  readonly id: string;
  readonly threadId: string;
  readonly createdAt: Date;
  readonly text: string;
}

export class FirestoreDatabase {

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

  /**
   * Returns ids of all of the push notifications in the database.
   */
  public async getPushNotificationIds(): Promise<string[]> {
    const result: string[] = [];

    const documents = await this.pushNotificationsCollectionRef.listDocuments();
    for (const doc of documents) {
      result.push(doc.id);
    }

    return result;
  }

  /**
   * Adds new push notification to database.
   */
  public async addPushNotification(notification: FirestorePushNotification) {
    const id = notification.id;
    const documentRef = this.pushNotificationsCollectionRef.doc(id);
    await documentRef.set(notification);
  }
}
