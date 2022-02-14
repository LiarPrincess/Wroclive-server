import { PushNotification } from '../PushNotification';

export type DeviceToken = string;

export class SendError {
  public constructor(
    public readonly device: DeviceToken,
    public readonly reason: string
  ) { }
}

export type SendResult =
  { kind: 'Success', delivered: DeviceToken[], failed: SendError[] } |
  { kind: 'Error', error: any };

export interface ApplePushNotificationsType {
  send(notification: PushNotification, deviceTokens: DeviceToken[]): Promise<SendResult>;
}
