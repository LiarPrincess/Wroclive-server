import { PushNotification } from '../PushNotification';
import { AppleDeviceToken, AppleSendError } from '../apple';
import { CleanTweet } from '../../CleanTweet';

export interface DatabaseType {

  /**
   * Check if this notification was already send.
   */
  wasAlreadySend(notification: PushNotification): Promise<boolean>;

  /**
   * We will not send notifications older than X, but we will store them in database.
   */
  storeNotificationTooOldToSend(notification: PushNotification): Promise<void>;

  /**
   * The notification was send!.
   */
  storeSendNotification(
    notification: PushNotification,
    sendAt: Date,
    appleDelivered: AppleDeviceToken[],
    appleFailed: AppleSendError[]
  ): Promise<void>;

  /**
   * Sending totally failed (not even partial delivery!).
   */
  storeSendError(notification: PushNotification, error: any): Promise<void>;

  /**
   * Get apple tokens to which we want to send this notification.
   */
  getApplePushNotificationTokens(): Promise<string[]>;
}
