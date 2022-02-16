import { Database } from '../Database';
import { PushNotification } from '../../PushNotification';
import { FirestoreDatabaseMock } from './FirestoreDatabaseMock';

const date = new Date(0);

function createNotification(id: string): PushNotification {
  return new PushNotification(id, 'threadId' + id, 'url' + id, 'author' + id, date, 'body' + id);
}

describe('Push notification database', () => {

  it('reads push notification ids from firestore and caches them', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    const present = createNotification('present');
    const notPresent = createNotification('not_present');

    firestore.pushNotificationIds = [present.id];

    const wasPresentSend = await database.wasAlreadySend(present);
    expect(wasPresentSend).toBeTruthy();
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);

    const wasNotPresentSend = await database.wasAlreadySend(notPresent);
    expect(wasNotPresentSend).toBeFalsy();
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);
  });

  it('writes too old notifications to firestore', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    const n = createNotification('id');

    const wasSendBefore = await database.wasAlreadySend(n);
    expect(wasSendBefore).toBeFalsy();

    await database.storeNotificationTooOldToSend(n);

    expect(firestore.getPushNotificationIdsCallCount).toBe(1);
    expect(firestore.addedPushNotifications).toEqual([
      {
        id: n.id,
        threadId: n.threadId,
        url: n.url,
        author: n.author,
        createdAt: n.createdAt,
        body: n.body,
        status: { kind: 'Too old' }
      }
    ]);

    const wasSendAfter = await database.wasAlreadySend(n);
    expect(wasSendAfter).toBeTruthy();
  });

  it('writes send notifications to firestore', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    const n = createNotification('id');

    const wasSendBefore = await database.wasAlreadySend(n);
    expect(wasSendBefore).toBeFalsy();

    const sendAt = new Date(5);
    const appleDelivered = ['token_delivered'];
    const appleFailed = [{ device: 'token_failed', reason: 'Some reason' }];
    await database.storeSendNotification(n, sendAt, appleDelivered, appleFailed);

    expect(firestore.getPushNotificationIdsCallCount).toBe(1);
    expect(firestore.addedPushNotifications).toEqual([
      {
        id: n.id,
        threadId: n.threadId,
        url: n.url,
        author: n.author,
        createdAt: n.createdAt,
        body: n.body,
        status: { kind: 'Send', sendAt, appleDelivered, appleFailed }
      }
    ]);

    const wasSendAfter = await database.wasAlreadySend(n);
    expect(wasSendAfter).toBeTruthy();
  });

  it('writes send errors to firestore', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    const n = createNotification('id');

    const wasSendBefore = await database.wasAlreadySend(n);
    expect(wasSendBefore).toBeFalsy();

    const error = { message: 'Error' };
    await database.storeSendError(n, error);

    expect(firestore.getPushNotificationIdsCallCount).toBe(1);
    expect(firestore.addedPushNotifications).toEqual([
      {
        id: n.id,
        threadId: n.threadId,
        url: n.url,
        author: n.author,
        createdAt: n.createdAt,
        body: n.body,
        status: { kind: 'Error', error }
      }
    ]);

    const wasSendAfter = await database.wasAlreadySend(n);
    expect(wasSendAfter).toBeTruthy();
  });

  it('gets apple tokens from firestore and DOES NOT cache them', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    firestore.applePushNotificationTokens = ['TOKEN_1'];
    const tokens1 = await database.getApplePushNotificationTokens();
    expect(tokens1).toEqual(['TOKEN_1']);
    expect(firestore.getApplePushNotificationTokensCallCount).toEqual(1);

    firestore.applePushNotificationTokens = ['TOKEN_1', 'TOKEN_2'];
    const tokens2 = await database.getApplePushNotificationTokens();
    expect(tokens2).toEqual(['TOKEN_1', 'TOKEN_2']);
    expect(firestore.getApplePushNotificationTokensCallCount).toEqual(2); // Do not cache!
  });
});
