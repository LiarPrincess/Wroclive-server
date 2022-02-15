import { LoggerMock, DatabaseMock, ApplePushNotificationsMock } from './mocks';
import { AppleSendError, AppleSendResult } from '../apple';
import { PushNotification } from '../PushNotification';
import { PushNotificationSender, dontSendTweetsOlderThan } from '../PushNotificationSender';
import { CleanTweet } from '../../CleanTweet';

const date: Date = new Date(dontSendTweetsOlderThan);

function getDateMock(): Date {
  return date;
}

// We are currently at 'dontSendTweetsOlderThan', tweets are send in the past.
const send1 = new PushNotification('id_send1', 'thread_send1', 'body_send1', new Date(1));
const send2 = new PushNotification('id_send', 'thread_send2', 'body_send2', new Date(5));
const tooOld = new PushNotification('id_old', 'thread_old', 'body_old', new Date(-1));
const fromFuture = new PushNotification('id_future', 'thread_future', 'body_future', new Date(dontSendTweetsOlderThan + 1));

const appleToken1 = 'TOKEN1';
const appleToken2 = 'TOKEN2';
const appleTokens = [appleToken1, appleToken2];

function setup() {
  const apple = new ApplePushNotificationsMock();
  const database = new DatabaseMock();
  const logger = new LoggerMock();
  const sender = new PushNotificationSender(database, apple, logger, getDateMock);
  return { apple, database, sender };
}

async function send(sender: PushNotificationSender, notification: PushNotification[]) {
  const tweets = notification.map(n => new CleanTweet(
    n.id, n.threadId, n.createdAt, n.body
  ));

  await sender.send(tweets);
}

describe('PushNotificationSender', () => {

  it('sends new tweets', async () => {
    const { apple, database, sender } = setup();
    database.alreadySendIds = [];
    database.applePushNotificationTokens = appleTokens;

    const appleDelivered = [appleToken1];
    const appleFailed = [{ device: appleToken2, reason: 'Some error' }];
    apple.sendResult = new AppleSendResult(appleDelivered, appleFailed);

    await send(sender, [send1, send2]);

    expect(apple.sendArgs).toEqual([
      { notification: send1, deviceTokens: appleTokens },
      { notification: send2, deviceTokens: appleTokens }
    ]);

    expect(database.getApplePushNotificationTokensCallCount).toEqual(1);
    expect(database.storedTooOld).toEqual([]);
    expect(database.storedSendNotifications).toEqual([
      { notification: send1, sendAt: date, appleDelivered, appleFailed },
      { notification: send2, sendAt: date, appleDelivered, appleFailed }
    ]);
    expect(database.storedSendErrors).toEqual([]);
  });

  it('skips already send tweets', async () => {
    const { apple, database, sender } = setup();
    database.alreadySendIds = [send1.id]; // <-- This
    database.applePushNotificationTokens = appleTokens;

    const appleDelivered = appleTokens;
    const appleFailed: AppleSendError[] = [];
    apple.sendResult = new AppleSendResult(appleDelivered, appleFailed);

    await send(sender, [send1, send2]);

    expect(apple.sendArgs).toEqual([
      { notification: send2, deviceTokens: appleTokens }
    ]);

    expect(database.getApplePushNotificationTokensCallCount).toEqual(1);
    expect(database.storedTooOld).toEqual([]);
    expect(database.storedSendNotifications).toEqual([
      { notification: send2, sendAt: date, appleDelivered, appleFailed }
    ]);
    expect(database.storedSendErrors).toEqual([]);
  });

  it('skips old tweets', async () => {
    const { apple, database, sender } = setup();
    database.alreadySendIds = [];
    database.applePushNotificationTokens = appleTokens;

    const appleDelivered = appleTokens;
    const appleFailed: AppleSendError[] = [];
    apple.sendResult = new AppleSendResult(appleDelivered, appleFailed);

    await send(sender, [tooOld, send1]);

    expect(apple.sendArgs).toEqual([
      { notification: send1, deviceTokens: appleTokens }
    ]);

    expect(database.getApplePushNotificationTokensCallCount).toEqual(1);
    expect(database.storedTooOld).toEqual([
      tooOld
    ]);
    expect(database.storedSendNotifications).toEqual([
      { notification: send1, sendAt: date, appleDelivered, appleFailed }
    ]);
    expect(database.storedSendErrors).toEqual([]);
  });

  it('sends tweets from the future', async () => {
    const { apple, database, sender } = setup();
    database.alreadySendIds = [];
    database.applePushNotificationTokens = appleTokens;

    const appleDelivered = appleTokens;
    const appleFailed: AppleSendError[] = [];
    apple.sendResult = new AppleSendResult(appleDelivered, appleFailed);

    await send(sender, [send2, fromFuture]);

    expect(apple.sendArgs).toEqual([
      { notification: send2, deviceTokens: appleTokens },
      { notification: fromFuture, deviceTokens: appleTokens }
    ]);

    expect(database.getApplePushNotificationTokensCallCount).toEqual(1);
    expect(database.storedTooOld).toEqual([]);
    expect(database.storedSendNotifications).toEqual([
      { notification: send2, sendAt: date, appleDelivered, appleFailed },
      { notification: fromFuture, sendAt: date, appleDelivered, appleFailed }
    ]);
    expect(database.storedSendErrors).toEqual([]);
  });

  it('does nothing if there are no new tweets', async () => {
    const { apple, database, sender } = setup();
    database.alreadySendIds = [send1.id]; // <-- THIS
    database.applePushNotificationTokens = appleTokens;

    await send(sender, [tooOld, send1]);

    expect(apple.sendArgs).toEqual([]);

    expect(database.getApplePushNotificationTokensCallCount).toEqual(0);
    expect(database.storedTooOld).toEqual([tooOld]);
    expect(database.storedSendNotifications).toEqual([]);
    expect(database.storedSendErrors).toEqual([]);
  });
});
