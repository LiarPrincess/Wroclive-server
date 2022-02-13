import { DatabaseMock, AppleEndpointMock } from './mocks';
import { PushNotification } from '../PushNotification';
import { StoredPushNotification } from '../database';
import { PushNotificationSender, dontSendTweetsOlderThan } from '../PushNotificationSender';
import { CleanTweet } from '../../CleanTweet';

const date: Date = new Date(dontSendTweetsOlderThan);

function getDateMock(): Date {
  return date;
}

// We are currently at 'dontSendTweetsOlderThan', tweets are send in the past.
const tweetSend1 = new CleanTweet('id1', 'conversationId1', new Date(1), 'body1');
const tweetSend2 = new CleanTweet('id2', 'conversationId2', new Date(5), 'body2');
const tweetNotSend = new CleanTweet('id3', 'conversationId3', new Date(-1), 'body3');
const tweetFromFuture = new CleanTweet('id4', 'conversationId4', new Date(dontSendTweetsOlderThan + 1), 'body4');

const appleDeviceTokens = ['TOKEN1', 'TOKEN2'];

describe('PushNotificationSender', () => {

  it('sends new tweets', async () => {
    const apple = new AppleEndpointMock();
    const database = new DatabaseMock();
    const sender = new PushNotificationSender(database, apple, getDateMock);

    database.alreadySendIds = [];
    database.applePushNotificationTokens = appleDeviceTokens;

    await sender.send([tweetSend1, tweetSend2]);

    expect(database.sendNotifications).toEqual([
      new StoredPushNotification(tweetSend1, date),
      new StoredPushNotification(tweetSend2, date)
    ]);

    expect(apple.sendArgs).toEqual([
      {
        notification: new PushNotification(tweetSend1),
        deviceTokens: appleDeviceTokens
      },
      {
        notification: new PushNotification(tweetSend2),
        deviceTokens: appleDeviceTokens
      }
    ]);
  });

  it('skips already send tweets', async () => {
    const apple = new AppleEndpointMock();
    const database = new DatabaseMock();
    const sender = new PushNotificationSender(database, apple, getDateMock);

    database.alreadySendIds = [tweetSend1.id];
    database.applePushNotificationTokens = appleDeviceTokens;

    await sender.send([tweetSend1, tweetSend2]);

    expect(database.sendNotifications).toEqual([
      new StoredPushNotification(tweetSend2, date)
    ]);

    expect(apple.sendArgs).toEqual([
      {
        notification: new PushNotification(tweetSend2),
        deviceTokens: appleDeviceTokens
      }
    ]);
  });

  it('skips old tweets', async () => {
    const apple = new AppleEndpointMock();
    const database = new DatabaseMock();
    const sender = new PushNotificationSender(database, apple, getDateMock);

    database.alreadySendIds = [];
    database.applePushNotificationTokens = appleDeviceTokens;

    await sender.send([tweetNotSend, tweetSend1]);

    expect(database.sendNotifications).toEqual([
      new StoredPushNotification(tweetNotSend, undefined),
      new StoredPushNotification(tweetSend1, date)
    ]);

    expect(apple.sendArgs).toEqual([
      {
        notification: new PushNotification(tweetSend1),
        deviceTokens: appleDeviceTokens
      }
    ]);
  });

  it('sends tweets from the future', async () => {
    const apple = new AppleEndpointMock();
    const database = new DatabaseMock();
    const sender = new PushNotificationSender(database, apple, getDateMock);

    database.alreadySendIds = [];
    database.applePushNotificationTokens = appleDeviceTokens;

    await sender.send([tweetSend2, tweetFromFuture]);

    expect(database.sendNotifications).toEqual([
      new StoredPushNotification(tweetSend2, date),
      new StoredPushNotification(tweetFromFuture, date)
    ]);

    expect(apple.sendArgs).toEqual([
      {
        notification: new PushNotification(tweetSend2),
        deviceTokens: appleDeviceTokens
      },
      {
        notification: new PushNotification(tweetFromFuture),
        deviceTokens: appleDeviceTokens
      }
    ]);
  });

  it('does nothing if there are no new tweets', async () => {
    const apple = new AppleEndpointMock();
    const database = new DatabaseMock();
    const sender = new PushNotificationSender(database, apple, getDateMock);

    database.alreadySendIds = [tweetSend1.id];
    database.applePushNotificationTokens = appleDeviceTokens;

    await sender.send([tweetNotSend, tweetSend1]);

    expect(database.sendNotifications).toEqual([
      new StoredPushNotification(tweetNotSend, undefined),
    ]);

    expect(apple.sendArgs).toEqual([]);
  });
});
