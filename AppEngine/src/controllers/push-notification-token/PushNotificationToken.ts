import { FirestorePushNotificationToken } from '../../cloud-platform';

export class PushNotificationToken implements FirestorePushNotificationToken {
  public constructor(
    public readonly deviceId: string,
    public readonly token: string,
    public readonly createdAt: Date
  ) { }
}
