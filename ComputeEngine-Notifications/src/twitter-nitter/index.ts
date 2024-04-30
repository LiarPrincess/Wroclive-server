import { Api, Tweet } from "./Api";
import { Logger } from "../util";
import { Notification, NotificationAuthor } from "../Notification";
import { TwitterClient, TwitterUser, GetTweetsOptions } from "../TwitterClient";

export class NitterClient implements TwitterClient {
  private readonly api: Api;
  private readonly logger: Logger;

  public constructor(logger: Logger) {
    this.api = new Api();
    this.logger = logger;
  }

  public async getTweets(user: TwitterUser, options: GetTweetsOptions): Promise<Notification[] | undefined> {
    const tweetCount = options.count;
    const response = await this.api.getTweets(user, tweetCount);

    const errorMessage = `[Notifications] Unable to get latest ${tweetCount} tweets from '${user.username}': ${response.kind}`;

    switch (response.kind) {
      case "Success":
        const tweets = response.tweets;
        return tweets.map((t) => NitterClient.createNotification(t));
      case "Invalid response":
        this.logger.error(errorMessage, response.error);
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
