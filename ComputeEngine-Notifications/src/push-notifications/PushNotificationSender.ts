import { CleanTweet } from '../CleanTweet';
import { AppleEndpointType } from './AppleEndpoint';
import { PushNotification } from './PushNotification';
import { DatabaseType, StoredPushNotification } from './Database';
import { subtractMilliseconds } from '../util';

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;

export const dontSendTweetsOlderThan = 3 * hour;

export type DateProvider = () => Date;

export class PushNotificationSender {

  private readonly apple: AppleEndpointType;
  private readonly database: DatabaseType;
  private readonly dateProvider: DateProvider;

  constructor(
    db: DatabaseType,
    apple: AppleEndpointType,
    dateProvider?: DateProvider
  ) {
    this.apple = apple;
    this.database = db;
    this.dateProvider = dateProvider || (() => new Date());
  }

  async send(tweets: CleanTweet[]) {
    const now = this.dateProvider();
    const notificationsToSend: PushNotification[] = [];
    const tweetsSorted = tweets.sort(fromOldestToNewest);

    for (const tweet of tweetsSorted) {
      const id = tweet.id;
      const threadId = tweet.conversationId;
      const createdAt = tweet.createdAt;
      const body = tweet.text;

      const wasAlreadySend = await this.database.wasAlreadySend(id);
      if (wasAlreadySend) {
        continue;
      }

      // Twitter returns things in UTC.
      // Server is also assumed to work in UTC.
      const timeDiff = subtractMilliseconds(now, createdAt);
      const isInTimeFrame = timeDiff < dontSendTweetsOlderThan;

      if (!isInTimeFrame) {
        const stored = new StoredPushNotification(id, threadId, undefined, body);
        await this.database.markAsSend(stored);
        continue;
      }

      const notification = new PushNotification(id, threadId, body);
      notificationsToSend.push(notification);
    }

    if (!notificationsToSend.length) {
      return;
    }

    const appleDeviceTokens = await this.database.getApplePushNotificationTokens();
    for (const n of notificationsToSend) {
      const stored = new StoredPushNotification(n.id, n.threadId, now, n.body);
      this.database.markAsSend(stored);
      this.apple.send(n, appleDeviceTokens);
    }
  }
}

function fromOldestToNewest(lhs: CleanTweet, rhs: CleanTweet): number {
  return lhs.createdAt < rhs.createdAt ? -1 : 1;
}
