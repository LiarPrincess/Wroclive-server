import { FirestorePushNotification } from '../../cloud-platform';

export class StoredPushNotification implements FirestorePushNotification {
  constructor(
    public readonly id: string,
    public readonly threadId: string,
    public readonly sendAt: Date | undefined,
    public readonly body: string
  ) { }
}

export interface DatabaseType {
  wasAlreadySend(id: string): Promise<boolean>;
  markAsSend(notification: StoredPushNotification): Promise<void>;
  getApplePushNotificationTokens(): Promise<string[]>;
}
