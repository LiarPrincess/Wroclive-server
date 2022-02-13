import { PushNotification } from '../PushNotification';

export interface AppleEndpointType {
  send(notification: PushNotification, deviceTokens: string[]): Promise<void>;
}
