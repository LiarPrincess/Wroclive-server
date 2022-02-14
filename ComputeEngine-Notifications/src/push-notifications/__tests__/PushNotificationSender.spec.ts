import { LoggerMock, DatabaseMock, ApplePushNotificationsMock } from './mocks';
import { PushNotification } from '../PushNotification';
import { StoredAppleStatus, StoredPushNotification } from '../database';
import { PushNotificationSender, dontSendTweetsOlderThan } from '../PushNotificationSender';
import { CleanTweet } from '../../CleanTweet';

const date: Date = new Date(dontSendTweetsOlderThan);

function getDateMock(): Date {
  return date;
}

// We are currently at 'dontSendTweetsOlderThan', tweets are send in the past.
const tweetSend1 = new CleanTweet('id1', 'conversationId1', new Date(1), 'body1');
const tweetSend2 = new CleanTweet('id2', 'conversationId2', new Date(5), 'body2');
const tweetTooOld = new CleanTweet('id3', 'conversationId3', new Date(-1), 'body3');
const tweetFromFuture = new CleanTweet('id4', 'conversationId4', new Date(dontSendTweetsOlderThan + 1), 'body4');

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

function toNotification(tweet: CleanTweet): PushNotification {
  return new PushNotification(tweet);
}

function toNotSendStored(tweet: CleanTweet): StoredPushNotification {
  const notification = toNotification(tweet);
  return new StoredPushNotification(notification, 'Not send');
}

function toSendStored(tweet: CleanTweet, sendAt: Date, apple: StoredAppleStatus): StoredPushNotification {
  const notification = toNotification(tweet);
  return new StoredPushNotification(notification, sendAt, apple);
}

describe('PushNotificationSender', () => {

  it('sends new tweets', async () => {
    const { apple, database, sender } = setup();
    database.alreadySendIds = [];
    database.applePushNotificationTokens = appleTokens;

    apple.sendResult = {
      kind: 'Success',
      delivered: [appleToken1],
      failed: [{ device: appleToken2, reason: 'Some error' }]
    };

    await sender.send([tweetSend1, tweetSend2]);

    expect(apple.sendArgs).toEqual([
      { notification: toNotification(tweetSend1), deviceTokens: appleTokens },
      { notification: toNotification(tweetSend2), deviceTokens: appleTokens }
    ]);

    const appleStatus = {
      delivered: apple.sendResult.delivered,
      errors: apple.sendResult.failed
    };

    expect(database.markedAsSend).toEqual([
      toSendStored(tweetSend1, date, appleStatus),
      toSendStored(tweetSend2, date, appleStatus),
    ]);
  });

  it('skips already send tweets', async () => {
    const { apple, database, sender } = setup();
    database.alreadySendIds = [tweetSend1.id]; // <-- This
    database.applePushNotificationTokens = appleTokens;
    apple.sendResult = { kind: 'Success', delivered: appleTokens, failed: [] };

    await sender.send([tweetSend1, tweetSend2]);

    expect(apple.sendArgs).toEqual([
      { notification: toNotification(tweetSend2), deviceTokens: appleTokens }
    ]);

    expect(database.markedAsSend).toEqual([
      toSendStored(tweetSend2, date, { delivered: appleTokens, errors: [] })
    ]);
  });

  it('skips old tweets', async () => {
    const { apple, database, sender } = setup();
    database.alreadySendIds = [];
    database.applePushNotificationTokens = appleTokens;
    apple.sendResult = { kind: 'Success', delivered: appleTokens, failed: [] };

    await sender.send([tweetTooOld, tweetSend1]);

    expect(apple.sendArgs).toEqual([
      { notification: toNotification(tweetSend1), deviceTokens: appleTokens }
    ]);

    expect(database.markedAsSend).toEqual([
      toNotSendStored(tweetTooOld),
      toSendStored(tweetSend1, date, { delivered: appleTokens, errors: [] })
    ]);
  });

  it('sends tweets from the future', async () => {
    const { apple, database, sender } = setup();
    database.alreadySendIds = [];
    database.applePushNotificationTokens = appleTokens;
    apple.sendResult = { kind: 'Success', delivered: appleTokens, failed: [] };

    await sender.send([tweetSend2, tweetFromFuture]);

    expect(apple.sendArgs).toEqual([
      { notification: toNotification(tweetSend2), deviceTokens: appleTokens },
      { notification: toNotification(tweetFromFuture), deviceTokens: appleTokens }
    ]);

    expect(database.markedAsSend).toEqual([
      toSendStored(tweetSend2, date, { delivered: appleTokens, errors: [] }),
      toSendStored(tweetFromFuture, date, { delivered: appleTokens, errors: [] })
    ]);
  });

  it('does nothing if there are no new tweets', async () => {
    const { apple, database, sender } = setup();
    database.alreadySendIds = [tweetSend1.id];
    database.applePushNotificationTokens = appleTokens;

    await sender.send([tweetTooOld, tweetSend1]);

    expect(database.markedAsSend).toEqual([
      toNotSendStored(tweetTooOld)
    ]);

    expect(apple.sendArgs).toEqual([]);
  });
});
