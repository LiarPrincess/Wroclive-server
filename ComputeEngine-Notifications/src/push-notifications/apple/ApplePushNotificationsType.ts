import { PushNotification } from '../PushNotification';

export type DeviceToken = string;

export class SendError {
  public constructor(
    public readonly device: DeviceToken,
    public readonly reason: string
  ) { }
}

export class SendResult {
  constructor(
    public readonly delivered: DeviceToken[],
    public readonly failed: SendError[]
  ) { }
}

export interface ApplePushNotificationsType {
  send(notification: PushNotification, deviceTokens: DeviceToken[]): Promise<SendResult>;
}
