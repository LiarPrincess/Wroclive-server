import { AppleEndpointType } from './apple';
import { PushNotification } from './PushNotification';
import { DatabaseType, StoredPushNotification } from './Database';
import { CleanTweet } from '../CleanTweet';
import { Logger, subtractMilliseconds } from '../util';

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;

export const dontSendTweetsOlderThan = 3 * hour;

export type DateProvider = () => Date;

export class PushNotificationSender {

  private readonly apple: AppleEndpointType;
  private readonly database: DatabaseType;
  private readonly logger: Logger;
  private readonly dateProvider: DateProvider;

  constructor(
    db: DatabaseType,
    apple: AppleEndpointType,
    logger: Logger,
    dateProvider?: DateProvider
  ) {
    this.apple = apple;
    this.database = db;
    this.logger = logger;
    this.dateProvider = dateProvider || (() => new Date());
  }

  async send(tweets: CleanTweet[]) {
    const now = this.dateProvider();
    const notificationsToSend: PushNotification[] = [];
    const tweetsSorted = tweets.sort(fromOldestToNewest);

    for (const tweet of tweetsSorted) {
      const wasAlreadySend = await this.database.wasAlreadySend(tweet.id);
      if (wasAlreadySend) {
        continue;
      }

      // Twitter returns things in UTC.
      // Server is also assumed to work in UTC.
      const timeDiff = subtractMilliseconds(now, tweet.createdAt);
      const isInTimeFrame = timeDiff < dontSendTweetsOlderThan;

      if (!isInTimeFrame) {
        // Don't send an actual push notification, but store it in database.
        const stored = new StoredPushNotification(tweet, undefined);
        await this.database.markAsSend(stored);
        continue;
      }

      const notification = new PushNotification(tweet);
      notificationsToSend.push(notification);
    }

    if (!notificationsToSend.length) {
      return;
    }

    // Store notification in a database before we send.
    // The actual sending may take a while, so if we get called again with the same
    // tweets then we should skip them.
    for (const n of notificationsToSend) {
      this.logger.info(`New notification: ${n.id} (thread: ${n.threadId})`, n);
      const stored = new StoredPushNotification(n, now);
      this.database.markAsSend(stored);
    }

    const appleDeviceTokens = await this.database.getApplePushNotificationTokens();
    this.apple.send(notificationsToSend, appleDeviceTokens);
  }
}

function fromOldestToNewest(lhs: CleanTweet, rhs: CleanTweet): number {
  return lhs.createdAt < rhs.createdAt ? -1 : 1;
}
