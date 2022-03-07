import { CleanTweet } from '../CleanTweet';

export type DateProvider = () => Date;

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
    // We will group push notifications by day.
    // Btw. ISOString: 1970-01-01T00:00:00.001Z
    const isoDate = tweet.createdAt.toISOString();
    const dailyThreadId = isoDate.substring(0, 10);

    return new PushNotification(
      tweet.id,
      dailyThreadId,
      tweet.url,
      tweet.author.url,
      tweet.createdAt,
      tweet.text
    );
  }
}
