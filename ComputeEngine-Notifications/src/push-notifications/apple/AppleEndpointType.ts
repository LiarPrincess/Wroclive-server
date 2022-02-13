import { PushNotification } from '../PushNotification';

export interface AppleEndpointType {
  send(notifications: PushNotification[], deviceTokens: string[]): Promise<void>;
}
