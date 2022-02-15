import { CleanTweet } from '../CleanTweet';

export class PushNotification {

  public constructor(
    public readonly id: string,
    /** An app-specific identifier for grouping related notifications. */
    public readonly threadId: string,
    public readonly body: string,
    /** Original creation date (not the send date). */
    public readonly createdAt: Date
  ) { }

  public static fromTweet(tweet: CleanTweet): PushNotification {
    return new PushNotification(tweet.id, tweet.conversationId, tweet.text, tweet.createdAt);
  }
}
