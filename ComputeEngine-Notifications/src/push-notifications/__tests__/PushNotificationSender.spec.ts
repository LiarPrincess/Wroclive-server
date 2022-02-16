import { LoggerMock, DatabaseMock, ApplePushNotificationsMock } from './mocks';
import { AppleSendError, AppleSendResult } from '../apple';
import { PushNotification } from '../PushNotification';
import { PushNotificationSender, dontSendTweetsOlderThan } from '../PushNotificationSender';
import { CleanTweet } from '../../CleanTweet';
import { TweetAuthor } from '../../twitter';

const date: Date = new Date(dontSendTweetsOlderThan);

function getDateMock(): Date {
  return date;
}

class TweetAndNotification {

  public readonly id: string;
  public readonly tweet: CleanTweet;
  public readonly notification: PushNotification;

  public constructor(suffix: string, createdAt: Date) {
    this.id = 'id_' + suffix;

    this.tweet = new CleanTweet(
      this.id,
      'url_' + suffix,
      'thread_' + suffix,
      'thread_url' + suffix,
      new TweetAuthor('author_id_' + suffix, 'author_name_' + suffix, 'author_username_' + suffix),
      createdAt,
      'body_' + suffix
    );

    this.notification = PushNotification.fromTweet(this.tweet);
  }
}

// We are currently at 'dontSendTweetsOlderThan', tweets are send in the past.
const send1 = new TweetAndNotification('send1', new Date(1));
const send2 = new TweetAndNotification('send2', new Date(5));
const tooOld = new TweetAndNotification('old', new Date(-1));
const fromFuture = new TweetAndNotification('future', new Date(dontSendTweetsOlderThan + 1));

const appleToken1 = 'TOKEN1';
const appleToken2 = 'TOKEN2';
const appleTokens = [appleToken1, appleToken2];

function setup() {
  const apple = new ApplePushNotificationsMock();
  const database = new DatabaseMock();
  const logger = new LoggerMock();
  const sender = new PushNotificationSender(apple, database, logger, getDateMock);
  return { apple, database, sender };
}

async function send(sender: PushNotificationSender, tns: TweetAndNotification[]) {
  const tweets = tns.map(tn => tn.tweet);
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
      { notification: send1.notification, deviceTokens: appleTokens },
      { notification: send2.notification, deviceTokens: appleTokens }
    ]);

    expect(database.getApplePushNotificationTokensCallCount).toEqual(1);
    expect(database.storedTooOld).toEqual([]);
    expect(database.storedSendNotifications).toEqual([
      { notification: send1.notification, sendAt: date, appleDelivered, appleFailed },
      { notification: send2.notification, sendAt: date, appleDelivered, appleFailed }
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
      { notification: send2.notification, deviceTokens: appleTokens }
    ]);

    expect(database.getApplePushNotificationTokensCallCount).toEqual(1);
    expect(database.storedTooOld).toEqual([]);
    expect(database.storedSendNotifications).toEqual([
      { notification: send2.notification, sendAt: date, appleDelivered, appleFailed }
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
      { notification: send1.notification, deviceTokens: appleTokens }
    ]);

    expect(database.getApplePushNotificationTokensCallCount).toEqual(1);
    expect(database.storedTooOld).toEqual([
      tooOld.notification
    ]);
    expect(database.storedSendNotifications).toEqual([
      { notification: send1.notification, sendAt: date, appleDelivered, appleFailed }
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
      { notification: send2.notification, deviceTokens: appleTokens },
      { notification: fromFuture.notification, deviceTokens: appleTokens }
    ]);

    expect(database.getApplePushNotificationTokensCallCount).toEqual(1);
    expect(database.storedTooOld).toEqual([]);
    expect(database.storedSendNotifications).toEqual([
      { notification: send2.notification, sendAt: date, appleDelivered, appleFailed },
      { notification: fromFuture.notification, sendAt: date, appleDelivered, appleFailed }
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
    expect(database.storedTooOld).toEqual([tooOld.notification]);
    expect(database.storedSendNotifications).toEqual([]);
    expect(database.storedSendErrors).toEqual([]);
  });
});
