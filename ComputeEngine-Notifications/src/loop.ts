import { CleanTweet } from './CleanTweet';
import { PushNotificationSender } from './push-notifications';
import { Tweet, Twitter, TwitterUser } from './twitter';
import { Logger } from './util';
import { loopInterval, tweetCount } from './config';

export class LoopDependencies {
  constructor(
    public readonly twitter: Twitter,
    public readonly twitterUser: TwitterUser,
    public readonly pushNotificationSender: PushNotificationSender,
    public readonly logger: Logger
  ) { }
}

export function startLoop(dependencies: LoopDependencies) {
  async function update() {
    try {
      await singleIteration(dependencies);
    } catch (error) {
      dependencies.logger.error('Failed to update lines', error);
    }

    setTimeout(update, loopInterval);
  }

  update();
}

async function singleIteration(dependencies: LoopDependencies) {
  const {
    twitter,
    twitterUser,
    pushNotificationSender,
    logger
  } = dependencies;

  const tweets = await getTweets(twitter, twitterUser, logger);
  if (tweets === undefined) {
    return;
  }

  const cleanTweets = tweets.map(t => new CleanTweet(t));

  try {
    await pushNotificationSender.send(cleanTweets);
  } catch (error) {
    logger.error('[PushNotifications] Unable to send push notifications', error);
  }
}

async function getTweets(
  twitter: Twitter,
  user: TwitterUser,
  logger: Logger
): Promise<Tweet[] | undefined> {

  const getTweetsResult = await twitter.getTweets(user, {
    maxResults: tweetCount,
    excludeReplies: true,
    excludeRetweets: true
  });

  const getTweetsErrorMessage = `[PushNotifications] Unable to get latest ${tweetCount} tweets from '${user.username}': ${getTweetsResult.kind}`;

  switch (getTweetsResult.kind) {
    case 'Success':
      return getTweetsResult.tweets;

    case 'Response with errors':
      logger.error(getTweetsErrorMessage, getTweetsResult.errors);
      return undefined;

    case 'Invalid response':
      logger.error(getTweetsErrorMessage, getTweetsResult.response);
      return undefined;

    case 'Network error':
      logger.error(getTweetsErrorMessage, getTweetsResult.error);
      return undefined;
  }
}
