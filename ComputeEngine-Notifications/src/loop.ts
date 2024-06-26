import { Notification } from "./Notification";
import { NotificationStore } from "./notification-store";
import { PushNotificationSender } from "./push-notifications";
import { Tweet, Twitter, TwitterUser } from "./twitter";
import { Logger } from "./util";
import { loopInterval, tweetCount } from "./config";

export class LoopDependencies {
  constructor(
    public readonly twitter: Twitter,
    public readonly twitterUser: TwitterUser,
    public readonly notificationStore: NotificationStore,
    public readonly pushNotificationSender: PushNotificationSender,
    public readonly logger: Logger
  ) {}
}

export function startLoop(dependencies: LoopDependencies) {
  async function update() {
    try {
      await singleIteration(dependencies);
    } catch (error) {
      dependencies.logger.error("[Notifications] Loop iteration failed", error);
    }

    setTimeout(update, loopInterval);
  }

  update();
}

async function singleIteration(dependencies: LoopDependencies) {
  const {
    twitter,
    twitterUser,
    notificationStore,
    pushNotificationSender,
    logger
  } = dependencies;

  const tweets = await getTweets(twitter, twitterUser, logger);
  if (tweets === undefined) {
    return;
  }

  const notifications = tweets.map((t) => Notification.fromTweet(t));

  try {
    await notificationStore.store(notifications);
  } catch (error) {
    logger.error("[Notifications] Unable to store notifications", error);
  }

  try {
    await pushNotificationSender.send(notifications);
  } catch (error) {
    logger.error("[Notifications] Unable to send push notifications", error);
  }
}

async function getTweets(twitter: Twitter, user: TwitterUser, logger: Logger): Promise<Tweet[] | undefined> {
  const getTweetsResult = await twitter.getTweets(user, {
    maxResults: tweetCount,
    excludeReplies: true,
    excludeRetweets: true,
  });

  const getTweetsErrorMessage = `[PushNotifications] Unable to get latest ${tweetCount} tweets from '${user.username}': ${getTweetsResult.kind}`;

  switch (getTweetsResult.kind) {
    case "Success":
      return getTweetsResult.tweets;

    case "Response with errors":
      logger.error(getTweetsErrorMessage, getTweetsResult.errors);
      return undefined;

    case "Invalid response":
      logger.error(getTweetsErrorMessage, getTweetsResult.response);
      return undefined;

    case "Network error":
      logger.error(getTweetsErrorMessage, getTweetsResult.error);
      return undefined;
  }
}
