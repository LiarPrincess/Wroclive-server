import { FirestoreNotificationDatabase } from './FirestoreNotificationDatabase';
import { FirestorePushNotificationDatabase } from './FirestorePushNotificationDatabase';

export interface FirestoreDatabaseType extends
  FirestoreNotificationDatabase,
  FirestorePushNotificationDatabase { }
