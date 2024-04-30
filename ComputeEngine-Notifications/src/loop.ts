import { NotificationStore } from "./notification-store";
import { PushNotificationSender } from "./push-notifications";
import { Logger } from "./util";
import { TwitterClient } from "./TwitterClient";
import { twitterUser, loopInterval, tweetCount } from "./config";

export class LoopDependencies {
  constructor(
    public readonly twitter: TwitterClient,
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
  const { twitter, notificationStore, pushNotificationSender, logger } = dependencies;

  const notifications = await twitter.getTweets(twitterUser, {
    count: tweetCount,
    includeReplies: false,
    includeRetweets: false,
  });

  if (notifications === undefined) {
    return;
  }

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
