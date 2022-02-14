import { CleanTweet } from '../../CleanTweet';
import { PushNotification } from '../PushNotification';
import { AppleDeviceToken, AppleSendError } from '../apple';
import { FirestorePushNotification, FirestorePushNotificationAppleStatus } from '../../cloud-platform';

export class StoredAppleStatus implements FirestorePushNotificationAppleStatus {
  constructor(
    public readonly delivered: AppleDeviceToken[],
    public readonly errors: AppleSendError[]
  ) { }
}

export class StoredPushNotification implements FirestorePushNotification {

  public constructor(
    public readonly id: string,
    public readonly threadId: string,
    public readonly body: string,
    public readonly sendAt: Date | 'Not send',
    public readonly apple?: StoredAppleStatus
  ) { }

  public static fromUnSendTweet(tweet: CleanTweet): StoredPushNotification {
    return new StoredPushNotification(
      tweet.id,
      tweet.conversationId,
      tweet.text,
      'Not send'
    );
  }

  public static fromSendNotification(
    notification: PushNotification,
    sendAt: Date,
    apple: StoredAppleStatus
  ): StoredPushNotification {
    return new StoredPushNotification(
      notification.id,
      notification.threadId,
      notification.body,
      sendAt,
      apple
    );
  }
}

export interface DatabaseType {
  wasAlreadySend(id: string): Promise<boolean>;
  markAsSend(notification: StoredPushNotification): Promise<void>;
  getApplePushNotificationTokens(): Promise<string[]>;
}
