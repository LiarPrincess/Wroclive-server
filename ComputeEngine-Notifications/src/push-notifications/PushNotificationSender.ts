import { PushNotification } from './PushNotification';
import { ApplePushNotificationsType } from './apple';
import { DatabaseType, StoredPushNotification, StoredAppleStatus } from './Database';
import { CleanTweet } from '../CleanTweet';
import { Logger, subtractMilliseconds } from '../util';

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;

export const dontSendTweetsOlderThan = 3 * hour;

export type DateProvider = () => Date;

class TweetDiff {
  public constructor(
    public readonly alreadySend: CleanTweet[],
    public readonly notSendButTooOldToSend: PushNotification[],
    public readonly toSend: PushNotification[]
  ) { }
}

export class PushNotificationSender {

  private readonly apple: ApplePushNotificationsType;
  private readonly database: DatabaseType;
  private readonly logger: Logger;
  private readonly dateProvider: DateProvider;

  public constructor(
    db: DatabaseType,
    apple: ApplePushNotificationsType,
    logger: Logger,
    dateProvider?: DateProvider
  ) {
    this.apple = apple;
    this.database = db;
    this.logger = logger;
    this.dateProvider = dateProvider || (() => new Date());
  }

  public async send(tweets: CleanTweet[]) {
    const diff = await this.calculateDiff(tweets);

    for (const notification of diff.notSendButTooOldToSend) {
      // Don't send the push notification, but store it in the database.
      const stored = new StoredPushNotification(notification, 'Not send');
      await this.database.store(stored);
    }

    if (!diff.toSend.length) {
      return;
    }

    const appleDeviceTokens = await this.database.getApplePushNotificationTokens();

    for (const n of diff.toSend) {
      this.logger.info(`New notification: ${n.id} (thread: ${n.threadId})`, n);

      const sendAt = this.dateProvider();
      const appleResult = await this.apple.send(n, appleDeviceTokens);

      switch (appleResult.kind) {
        case 'Success':
          const appleStatus = new StoredAppleStatus(appleResult.delivered, appleResult.failed);
          const stored = new StoredPushNotification(n, sendAt, appleStatus);
          this.database.store(stored);
          break;

        case 'Error':
          this.logger.error(`Failed to send notification: ${n.id} (thread: ${n.threadId})`, {
            notification: n,
            error: appleResult.error
          });
          break;
      }
    }
  }

  private async calculateDiff(tweets: CleanTweet[]): Promise<TweetDiff> {
    const alreadySend: CleanTweet[] = [];
    const tooOldToSend: PushNotification[] = [];
    const toSend: PushNotification[] = [];

    const now = this.dateProvider();
    const tweetsSorted = tweets.sort(fromOldestToNewest);

    for (const tweet of tweetsSorted) {
      const notification = new PushNotification(tweet);

      const wasAlreadySend = await this.database.wasAlreadySend(notification);
      if (wasAlreadySend) {
        alreadySend.push(tweet);
        continue;
      }

      // Twitter returns things in UTC.
      // Server is also assumed to work in UTC.
      const timeDiff = subtractMilliseconds(now, tweet.createdAt);
      const isInTimeFrame = timeDiff < dontSendTweetsOlderThan;

      if (!isInTimeFrame) {
        tooOldToSend.push(notification);
        continue;
      }

      toSend.push(notification);
    }

    return new TweetDiff(alreadySend, tooOldToSend, toSend);
  }
}

function fromOldestToNewest(lhs: CleanTweet, rhs: CleanTweet): number {
  return lhs.createdAt < rhs.createdAt ? -1 : 1;
}
