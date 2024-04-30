import { User } from "./User";
import { Tweet } from "./Tweet";
import { ApiBase, Api, Credentials } from "./Api";
import { Logger } from "../util";
import { Notification, NotificationAuthor } from "../Notification";
import { TwitterClient, TwitterUser, GetTweetsOptions } from "../TwitterClient";

export class TwitterApiClient implements TwitterClient {
  private readonly api: ApiBase;
  private readonly logger: Logger;
  private readonly usernameToUser = new Map<string, User>();

  public constructor(credentials: Credentials | ApiBase, logger: Logger) {
    if (credentials instanceof ApiBase) {
      this.api = credentials;
    } else {
      this.api = new Api(credentials);
    }

    this.logger = logger;
  }

  public async getTweets(userArg: TwitterUser, options: GetTweetsOptions): Promise<Notification[] | undefined> {
    const username = userArg.username;
    let user = this.usernameToUser.get(username);

    if (user === undefined) {
      const response = await this.api.getUser(username);
      const errorMessage = `[Notifications] Unable to get Twitter user '${username}': ${response.kind}`;

      switch (response.kind) {
        case "Success":
          this.logger.info(`[Notifications] Got twitter user '${username}'.`);
          user = response.user;
          this.usernameToUser.set(username, user);
          break;

        case "Response with errors":
          this.logger.error(errorMessage, response.errors);
          return undefined;
        case "Invalid response":
          this.logger.error(errorMessage, response.response);
          return undefined;
        case "Network error":
          this.logger.error(errorMessage, response.error);
          return undefined;
      }
    }

    const tweetCount = options.count;

    const response = await this.api.getTweets(user, {
      maxResults: tweetCount,
      excludeReplies: !options.includeReplies,
      excludeRetweets: !options.includeReplies,
    });

    const errorMessage = `[Notifications] Unable to get latest ${tweetCount} tweets from '${username}': ${response.kind}`;

    switch (response.kind) {
      case "Success":
        const tweets = response.tweets;
        return tweets.map((t) => TwitterApiClient.createNotification(t));
      case "Response with errors":
        this.logger.error(errorMessage, response.errors);
        return undefined;
      case "Invalid response":
        this.logger.error(errorMessage, response.response);
        return undefined;
      case "Network error":
        this.logger.error(errorMessage, response.error);
        return undefined;
    }
  }

  public static createNotification(t: Tweet): Notification {
    const text = Notification.cleanText(t.text);
    const author = new NotificationAuthor(t.author.name, t.author.username);
    return new Notification(t.id, t.url, author, t.createdAt, text);
  }
}
