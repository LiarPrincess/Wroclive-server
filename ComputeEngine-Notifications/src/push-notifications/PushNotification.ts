import { CleanTweet } from '../CleanTweet';

export class PushNotification {

  public constructor(
    public readonly id: string,
    /** An app-specific identifier for grouping related notifications. */
    public readonly threadId: string,
    public readonly url: string,
    public readonly author: string,
    public readonly createdAt: Date,
    public readonly body: string
  ) { }

  public static fromTweet(tweet: CleanTweet): PushNotification {
    return new PushNotification(
      tweet.id,
      tweet.conversationId,
      tweet.url,
      tweet.author.url,
      tweet.createdAt,
      tweet.text
    );
  }
}
