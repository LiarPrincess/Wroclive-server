import {
  FirestoreNotification,
  FirestoreAllNotificationsDocument
} from '../../cloud-platform';

export interface Notification extends FirestoreNotification { }
export interface NotificationCollection extends FirestoreAllNotificationsDocument { }
