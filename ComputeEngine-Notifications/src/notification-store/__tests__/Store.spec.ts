import { Store } from '../Store';
import { StoredNotification } from '../StoredNotification';
import {
  FirestoreAllNotificationDocument,
  FirestoreNotificationDatabase
} from '../../cloud-platform';
import { TweetAuthor } from '../../twitter';
import { CleanTweet } from '../../CleanTweet';
import { Logger } from '../../util';

/* ============ */
/* === Date === */
/* ============ */

let date: Date = new Date(0);

function getDateMock(): Date {
  return date;
}

/* ============== */
/* === Logger === */
/* ============== */

export class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void { }
  error(message?: any, ...optionalParams: any[]): void { }
}

const logger = new LoggerMock();

/* ================ */
/* === Database === */
/* ================ */

export class FirestoreDatabaseMock implements FirestoreNotificationDatabase {

  public getNotificationsResult: FirestoreAllNotificationDocument | undefined;
  public getNotificationsCallCount = 0;

  public async getNotifications(): Promise<FirestoreAllNotificationDocument | undefined> {
    this.getNotificationsCallCount++;
    return this.getNotificationsResult;
  }

  public storedNotifications: FirestoreAllNotificationDocument | undefined;
  public storeNotificationsCallCount = 0;

  public async storeNotifications(document: FirestoreAllNotificationDocument) {
    this.storeNotificationsCallCount++;
    this.storedNotifications = document;
  }
}

/* ============ */
/* === Main === */
/* ============ */

function createTweet(id: string): CleanTweet {
  const author = new TweetAuthor(
    'author_id_' + id,
    'author_name' + id,
    'author_username' + id
  );

  return new CleanTweet(
    id,
    'url_' + id,
    'conversationId_' + id,
    'conversationUrl_' + id,
    author,
    new Date(123),
    'text_' + id
  );
}

const tweet1 = createTweet('1');
const tweet2 = createTweet('2');
const tweet3 = createTweet('3');

const notification1 = StoredNotification.fromTweet(tweet1);
const notification2 = StoredNotification.fromTweet(tweet2);
const notification3 = StoredNotification.fromTweet(tweet3);

describe('NotificationStore', () => {

  it('stores notifications if there nothing in database', async () => {
    const database = new FirestoreDatabaseMock();
    const store = new Store(database, logger, getDateMock);

    date = new Date('2022-01-02T03:04:05.999Z');
    database.getNotificationsResult = undefined;

    await store.store([tweet1, tweet2, tweet3]);

    expect(database.getNotificationsCallCount).toEqual(1);
    expect(database.storeNotificationsCallCount).toEqual(1);
    expect(database.storedNotifications).toEqual({
      timestamp: '2022-01-02T03:04:05.999Z',
      data: [notification1, notification2, notification3]
    });
  });

  it('stores notifications if there is a new tweet', async () => {
    const database = new FirestoreDatabaseMock();
    const store = new Store(database, logger, getDateMock);

    // 1st store
    date = new Date('2022-01-02T03:04:05.999Z');
    database.getNotificationsResult = {
      timestamp: 'OLD',
      data: [notification1]
    };

    await store.store([tweet1, tweet2]);
    expect(database.getNotificationsCallCount).toEqual(1);
    expect(database.storeNotificationsCallCount).toEqual(1);
    expect(database.storedNotifications).toEqual({
      timestamp: '2022-01-02T03:04:05.999Z',
      data: [notification1, notification2]
    });

    // 2nd store - new tweets
    date = new Date('2022-02-03T04:05:06.999Z');

    await store.store([tweet2, tweet3]);
    expect(database.getNotificationsCallCount).toEqual(1);
    expect(database.storeNotificationsCallCount).toEqual(2);
    expect(database.storedNotifications).toEqual({
      timestamp: '2022-02-03T04:05:06.999Z',
      data: [notification2, notification3]
    });
  });

  it('does nothing if there are no new tweets', async () => {
    const database = new FirestoreDatabaseMock();
    const store = new Store(database, logger, getDateMock);

    // 1st store
    date = new Date('2022-01-02T03:04:05.999Z');
    database.getNotificationsResult = {
      timestamp: 'OLD',
      data: [notification1]
    };

    await store.store([tweet1, tweet2]);
    expect(database.getNotificationsCallCount).toEqual(1);
    expect(database.storeNotificationsCallCount).toEqual(1);
    expect(database.storedNotifications).toEqual({
      timestamp: '2022-01-02T03:04:05.999Z',
      data: [notification1, notification2]
    });

    // 2nd store - no new tweets (the same expectations as before)
    date = new Date('2022-02-03T04:05:06.999Z');

    await store.store([tweet1, tweet2]);
    expect(database.getNotificationsCallCount).toEqual(1);
    expect(database.storeNotificationsCallCount).toEqual(1);
    expect(database.storedNotifications).toEqual({
      timestamp: '2022-01-02T03:04:05.999Z',
      data: [notification1, notification2]
    });
  });
});
