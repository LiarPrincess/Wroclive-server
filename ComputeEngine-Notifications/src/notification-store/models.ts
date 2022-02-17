import { CleanTweet } from '../CleanTweet';
import { FirestoreNotification } from '../cloud-platform';

export class StoredNotification implements FirestoreNotification {

  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly author: string,
    public readonly date: Date,
    public readonly body: string
  ) { }

  public static fromTweet(tweet: CleanTweet): StoredNotification {
    return new StoredNotification(
      tweet.id,
      tweet.url,
      tweet.author.url,
      tweet.createdAt,
      tweet.text
    );
  }
}
