import { Database } from '../Database';
import { StoredAppleStatus } from '../DatabaseType';
import { StoredPushNotification } from '../DatabaseType';
import { PushNotification } from '../../PushNotification';
import { FirestoreDatabaseMock } from './FirestoreDatabaseMock';

describe('Push notification database', () => {

  it('gets push notification ids from firestore and caches them', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    const present = new PushNotification('PRESENT', 'THREAD_1', 'BODY_1');
    const notPresent = new PushNotification('NOT_PRESENT', 'THREAD_2', 'BODY_2');

    firestore.pushNotificationIds = [present.id];

    const wasPresentSend = await database.wasAlreadySend(present);
    expect(wasPresentSend).toBeTruthy();
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);

    const wasNotPresentSend = await database.wasAlreadySend(notPresent);
    expect(wasNotPresentSend).toBeFalsy();
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);
  });

  it('uploads new notifications to firestore', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    const notSendNotification = new PushNotification('ID1', 'THREAD1', 'BODY1');
    const notSendStored = new StoredPushNotification(notSendNotification, 'Not send');
    await database.store(notSendStored);

    expect(firestore.addedPushNotifications).toEqual([notSendStored]);
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);

    const sendAt = new Date('2020.01.01');
    const sendNotification = new PushNotification('ID2', 'THREAD2', 'BODY2');
    const sendAppleStatus = new StoredAppleStatus(['token'], []);
    const sendStored = new StoredPushNotification(sendNotification, sendAt, sendAppleStatus);

    await database.store(sendStored);
    expect(firestore.addedPushNotifications).toEqual([notSendStored, sendStored]);
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);
  });

  it('remembers send notifications (wasAlreadySend -> markAsSend -> wasAlreadySend)', async () => {
    const firestore = new FirestoreDatabaseMock();
    const database = new Database(firestore);

    // Without 'sendAt'
    const notSendNotification = new PushNotification('ID1', 'THREAD1', 'BODY1');
    const notSendStored = new StoredPushNotification(notSendNotification, 'Not send');

    const wasSend1Before = await database.wasAlreadySend(notSendNotification);
    expect(wasSend1Before).toBeFalsy();
    await database.store(notSendStored);
    const wasSend1After = await database.wasAlreadySend(notSendNotification);
    expect(wasSend1After).toBeTruthy();

    expect(firestore.addedPushNotifications).toEqual([notSendStored]);
    expect(firestore.getPushNotificationIdsCallCount).toEqual(1);

    // With 'sendAt'
    const sendAt = new Date('2020.01.01');
    const sendNotification = new PushNotification('ID2', 'THREAD2', 'BODY2');
    const sendAppleStatus = new StoredAppleStatus(['token'], []);
    const sendStored = new StoredPushNotification(sendNotification, sendAt, sendAppleStatus);

    const wasSend2Before = await database.wasAlreadySend(sendNotification);
    expect(wasSend2Before).toBeFalsy();
    await database.store(sendStored);
    const wasSend2After = await database.wasAlreadySend(sendNotification);
    expect(wasSend2After).toBeTruthy();

    expect(firestore.addedPushNotifications).toEqual([notSendStored, sendStored]);
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
