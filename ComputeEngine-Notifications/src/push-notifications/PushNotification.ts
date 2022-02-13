import { CleanTweet } from '../CleanTweet';

export class PushNotification {

  public readonly id: string;
  /**
   * An app-specific identifier for grouping related notifications.
   */
  public readonly threadId: string;
  public readonly body: string;

  constructor(tweet: CleanTweet);
  constructor(id: string, threadId: string, body: string);
  constructor(arg0: any, arg1?: any, arg2?: any) {
    if (arg0 instanceof CleanTweet) {
      this.id = arg0.id;
      this.threadId = arg0.conversationId;
      this.body = arg0.text;
    } else {
      this.id = arg0;
      this.threadId = arg1;
      this.body = arg2;
    }
  }
}
