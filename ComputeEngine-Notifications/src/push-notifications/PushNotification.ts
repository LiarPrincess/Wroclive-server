import { Notification } from "../Notification";

export class PushNotification {
  public constructor(
    public readonly id: string,
    /** An app-specific identifier for grouping related notifications. */
    public readonly threadId: string,
    public readonly url: string,
    public readonly author: string,
    public readonly createdAt: Date,
    public readonly body: string
  ) {}

  public static fromNotification(n: Notification): PushNotification {
    // We will group push notifications by day.
    // Btw. ISOString: 1970-01-01T00:00:00.001Z
    const isoDate = n.createdAt.toISOString();
    const dailyThreadId = isoDate.substring(0, 10);
    const author = `${n.author.name} (@${n.author.username})`;
    return new PushNotification(n.id, dailyThreadId, n.url, author, n.createdAt, n.text);
  }
}
