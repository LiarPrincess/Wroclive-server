import { FirestoreNotification } from '../FirestoreNotificationDatabase';

export const notifications: FirestoreNotification[] = [
  {
    id: 'id',
    url: 'url',
    author: {
      name: 'author_name',
      username: 'author_username'
    },
    date: 'date',
    body: 'body',
  }
];
