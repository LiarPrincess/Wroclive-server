import { default as axios, AxiosResponse } from "axios";
import { Tweet, parse } from "./parse";
import { Logger } from "../util";
import { Notification, NotificationAuthor } from "../Notification";
import { TwitterClient, TwitterUser, GetTweetsOptions } from "../TwitterClient";

// https://rss.app/feed/BeCZy2G8hbxynlRS
// https://rss.app/feeds/BeCZy2G8hbxynlRS.xml
// https://nitter.poast.org/AlertMPK/rss
// https://nitter.privacydev.net/AlertMpk/rss

export class NitterClient implements TwitterClient {
  public constructor(private readonly baseUrl: string, private readonly logger: Logger) {}

  public async getTweets(user: TwitterUser, options: GetTweetsOptions): Promise<Notification[] | undefined> {
    const username = user.username;
    const tweetCount = options.count;

    const url = `${this.baseUrl}/${username}/rss`;
    let response: AxiosResponse<any, any>;

    try {
      response = await axios.get(url);
    } catch (axiosError) {
      const statusCode = this.getStatusCode(axiosError);
      const errorMessage = `[Notifications] NitterClient.getTweets(${username}, ${tweetCount}): response status ${statusCode}.`;
      this.logger.error(errorMessage, axiosError);
      return undefined;
    }

    const xmlString = response.data;
    const result = await parse(xmlString, user, tweetCount);

    switch (result.kind) {
      case "Success":
        const tweets = result.tweets;
        return tweets.map((t) => NitterClient.createNotification(t, user));
      case "Failure":
        const errorMessage = `[Notifications] NitterClient.getTweets(${username}, ${tweetCount}): ${result.message}.`;
        this.logger.error(errorMessage, {
          response,
          data: result.data,
        });
        return undefined;
    }
  }

  private getStatusCode(error: any): string | undefined {
    return error.statusCode || (error.response && error.response.status);
  }

  public static createNotification(t: Tweet, u: TwitterUser): Notification {
    const text = Notification.cleanText(t.text);
    const url = `https://twitter.com/${u.username}`;
    const author = new NotificationAuthor(t.author.name, t.author.username);
    return new Notification(t.textHash, url, author, t.createdAt, text);
  }
}
