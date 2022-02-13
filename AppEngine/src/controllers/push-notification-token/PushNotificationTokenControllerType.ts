import { PushNotificationToken } from './PushNotificationToken';

export type DateProvider = () => Date;

export abstract class PushNotificationTokenControllerType {

  private readonly dateProvider: DateProvider;

  public constructor(dateProvider?: DateProvider) {
    this.dateProvider = dateProvider || (() => new Date());
  }

  /**
   * Save (deviceId, token) in a database.
   */
  abstract save(deviceId: string, token: string, platform: string): Promise<void>;

  protected createToken(deviceId: string, token: string): PushNotificationToken {
    const createdAt = this.dateProvider();
    return new PushNotificationToken(deviceId, token, createdAt);
  }
}
