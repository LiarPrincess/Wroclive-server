import { CleanTweet } from '../../CleanTweet';
import { FirestorePushNotification } from '../../cloud-platform';
import { PushNotification } from '../PushNotification';

export class StoredPushNotification implements FirestorePushNotification {

  public readonly id: string;
  public readonly threadId: string;
  public readonly sendAt: Date | undefined;
  public readonly body: string;

  constructor(tweet: CleanTweet, sendAt: Date | undefined);
  constructor(notification: PushNotification, sendAt: Date | undefined);
  constructor(id: string, threadId: string, sendAt: Date | undefined, body: string);
  constructor(arg0: any, arg1: any, arg2?: any, arg3?: any) {
    if (arg0 instanceof CleanTweet) {
      this.id = arg0.id;
      this.threadId = arg0.conversationId;
      this.sendAt = arg2;
      this.body = arg0.text;
    } else if (arg0 instanceof PushNotification) {
      this.id = arg0.id;
      this.threadId = arg0.threadId;
      this.sendAt = arg2;
      this.body = arg0.body;
    } else {
      this.id = arg0;
      this.threadId = arg1;
      this.sendAt = arg2;
      this.body = arg3;
    }
  }
}

export interface DatabaseType {
  wasAlreadySend(id: string): Promise<boolean>;
  markAsSend(notification: StoredPushNotification): Promise<void>;
  getApplePushNotificationTokens(): Promise<string[]>;
}
