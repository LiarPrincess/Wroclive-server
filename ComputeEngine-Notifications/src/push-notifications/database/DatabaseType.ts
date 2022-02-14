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

  public get id(): string { return this.notification.id; }
  public get threadId(): string { return this.notification.threadId; }
  public get body(): string { return this.notification.body; }

  public constructor(
    public readonly notification: PushNotification,
    public readonly sendAt: Date | 'Not send',
    public readonly apple?: StoredAppleStatus
  ) { }
}

export interface DatabaseType {
  wasAlreadySend(notification: PushNotification): Promise<boolean>;
  store(notification: StoredPushNotification): Promise<void>;
  getApplePushNotificationTokens(): Promise<string[]>;
}
