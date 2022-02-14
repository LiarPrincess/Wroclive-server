import { Database } from '../Database';
import { StoredPushNotification } from '../DatabaseType';
import { FirestoreDatabaseMock } from './FirestoreDatabaseMock';

describe('Push notification database', () => {

  it('gets push notification ids from firestore and caches them', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    firestore.pushNotificationIds = ['PRESENT'];

    const present = await database.wasAlreadySend('PRESENT');
    expect(present).toBeTruthy();
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);

    const notPresent = await database.wasAlreadySend('NOT_PRESENT');
    expect(notPresent).toBeFalsy();
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);
  });

  it('uploads new notifications to firestore', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    const notification1 = new StoredPushNotification('id1', 'threadId', 'body1', 'Not send');
    await database.markAsSend(notification1);
    expect(firestore.addedPushNotifications).toEqual([notification1]);
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);

    const sendAt = new Date('2020.01.01');
    const notification2 = new StoredPushNotification('id2', 'threadId', 'body2', sendAt);
    await database.markAsSend(notification2);
    expect(firestore.addedPushNotifications).toEqual([notification1, notification2]);
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);
  });

  it('remembers send notifications (wasAlreadySend -> markAsSend -> wasAlreadySend)', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    // Without 'sendAt'
    const notification1 = new StoredPushNotification('id1', 'threadId', 'body1', 'Not send');

    const wasSend1Before = await database.wasAlreadySend(notification1.id);
    expect(wasSend1Before).toBeFalsy();
    await database.markAsSend(notification1);
    const wasSend1After = await database.wasAlreadySend(notification1.id);
    expect(wasSend1After).toBeTruthy();

    expect(firestore.addedPushNotifications).toEqual([notification1]);
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);

    // With 'sendAt'
    const sendAt = new Date('2020.01.01');
    const notification2 = new StoredPushNotification('id2', 'threadId', 'body2', sendAt);

    const wasSend2Before = await database.wasAlreadySend(notification2.id);
    expect(wasSend2Before).toBeFalsy();
    await database.markAsSend(notification2);
    const wasSend2After = await database.wasAlreadySend(notification2.id);
    expect(wasSend2After).toBeTruthy();

    expect(firestore.addedPushNotifications).toEqual([notification1, notification2]);
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);
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
