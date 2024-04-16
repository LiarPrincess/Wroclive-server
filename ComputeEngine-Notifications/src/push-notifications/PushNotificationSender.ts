import { DatabaseType } from "./database";
import { PushNotification } from "./PushNotification";
import { ApplePushNotificationsType, AppleSendResult } from "./apple";
import { Notification } from "../Notification";
import { Logger, subtractMilliseconds } from "../util";

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;

export const dontSendTweetsOlderThan = 3 * hour;

export type DateProvider = () => Date;

class TweetDiff {
  public constructor(
    public readonly alreadySend: Notification[],
    public readonly tooOldToSend: PushNotification[],
    public readonly toSend: PushNotification[]
  ) {}
}

export class PushNotificationSender {
  private readonly apple: ApplePushNotificationsType;
  private readonly database: DatabaseType;
  private readonly logger: Logger;
  private readonly dateProvider: DateProvider;

  public constructor(apple: ApplePushNotificationsType, db: DatabaseType, logger: Logger, dateProvider?: DateProvider) {
    this.apple = apple;
    this.database = db;
    this.logger = logger;
    this.dateProvider = dateProvider || (() => new Date());
  }

  public async send(tweets: Notification[]) {
    const diff = await this.createDiff(tweets);
    await this.storeNotificationTooOldToSend(diff.tooOldToSend);
    await this.sendPushNotifications(diff.toSend);
  }

  private async storeNotificationTooOldToSend(notifications: PushNotification[]) {
    for (const notification of notifications) {
      try {
        await this.database.storeNotificationTooOldToSend(notification);
      } catch (error) {
        this.logger.error(`[PushNotifications] Error when storing too old push notification.`, {
          ...notification,
          error,
        });
      }
    }
  }

  private async sendPushNotifications(notifications: PushNotification[]) {
    if (notifications.length === 0) {
      return;
    }

    const appleDeviceTokens = await this.database.getApplePushNotificationTokens();
    if (appleDeviceTokens.length === 0) {
      this.logger.info("[PushNotifications] No Apple devices to send notifications.");
      return;
    }

    for (const notification of notifications) {
      const logId = `(id: ${notification.id}, threadId: ${notification.threadId})`;
      this.logger.info(`[PushNotifications] New notification: ${logId}.`, notification);

      const sendAt = this.dateProvider();

      let appleResult: AppleSendResult;
      try {
        appleResult = await this.apple.send(notification, appleDeviceTokens);
      } catch (error) {
        this.logger.error(`[PushNotifications] Failed to send notification: ${logId}.`, { ...notification, error });

        // NOTE: If we ever add android then remember that we have to store the
        // notification only ONCE!
        try {
          this.database.storeSendError(notification, error);
        } catch (error) {
          this.logger.error(`[PushNotifications] It even failed a database insert: ${logId}.`, {
            ...notification,
            error,
          });
        }

        continue;
      }

      try {
        await this.database.storeSendNotification(notification, sendAt, appleResult.delivered, appleResult.failed);
      } catch (error) {
        this.logger.error(`[PushNotifications] Error when storing send push notification: ${logId}.`, {
          notification,
          appleResult,
          error,
        });
      }
    }
  }

  private async createDiff(tweets: Notification[]): Promise<TweetDiff> {
    const alreadySend: Notification[] = [];
    const tooOldToSend: PushNotification[] = [];
    const toSend: PushNotification[] = [];

    const now = this.dateProvider();
    const tweetsSorted = tweets.sort(fromOldestToNewest);

    for (const tweet of tweetsSorted) {
      const notification = PushNotification.fromNotification(tweet);

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

function fromOldestToNewest(lhs: Notification, rhs: Notification): number {
  return lhs.createdAt < rhs.createdAt ? -1 : 1;
}
