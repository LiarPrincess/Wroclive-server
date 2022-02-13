import { PushNotificationTokenControllerType, DateProvider } from './PushNotificationTokenControllerType';
import { FirestorePushNotificationTokenDatabase } from '../../cloud-platform';

export class FirestorePushNotificationTokenController extends PushNotificationTokenControllerType {

  private readonly db: FirestorePushNotificationTokenDatabase;

  public constructor(db: FirestorePushNotificationTokenDatabase, dateProvider?: DateProvider) {
    super(dateProvider);
    this.db = db;
  }

  public async save(deviceId: string, token: string, platform: string): Promise<void> {
    const isApple = this.isApple(platform);
    if (isApple) {
      const t = this.createToken(deviceId, token);
      await this.db.saveApplePushNotificationToken(t);
    }
  }

  private isApple(platform: string): boolean {
    if (platform.length !== 3) {
      return false;
    }

    const platformLower = platform.toLowerCase();
    return platformLower === 'ios';
  }
}
