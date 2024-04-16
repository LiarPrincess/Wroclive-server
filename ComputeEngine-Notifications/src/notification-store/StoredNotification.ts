import { Notification } from "../Notification";
import { FirestoreNotification } from "../cloud-platform";

export class StoredNotificationAuthor {
  constructor(public readonly name: string, public readonly username: string) {}
}

export class StoredNotification implements FirestoreNotification {
  public constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly author: StoredNotificationAuthor,
    public readonly date: string,
    public readonly body: string
  ) {}

  public static fromNotification(n: Notification): StoredNotification {
    const date = n.createdAt.toISOString();
    const author = new StoredNotificationAuthor(n.author.name, n.author.username);
    return new StoredNotification(n.id, n.url, author, date, n.text);
  }
}
