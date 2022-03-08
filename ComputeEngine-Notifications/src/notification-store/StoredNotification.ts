import { CleanTweet } from '../CleanTweet';
import { FirestoreNotification } from '../cloud-platform';

export class StoredNotificationAuthor {
  constructor(
    public readonly name: string,
    public readonly username: string
  ) { }
}

export class StoredNotification implements FirestoreNotification {

  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly author: StoredNotificationAuthor,
    public readonly date: string,
    public readonly body: string
  ) { }

  public static fromTweet(tweet: CleanTweet): StoredNotification {
    const date = tweet.createdAt.toISOString();
    const author = new StoredNotificationAuthor(
      tweet.author.name,
      tweet.author.username
    );

    return new StoredNotification(
      tweet.id,
      tweet.url,
      author,
      date,
      tweet.text
    );
  }
}
