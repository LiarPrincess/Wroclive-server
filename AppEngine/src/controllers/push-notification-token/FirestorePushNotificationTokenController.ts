import {
  SaveResult,
  DateProvider,
  PushNotificationTokenControllerType
} from './PushNotificationTokenControllerType';
import { FirestorePushNotificationTokenDatabase } from '../../cloud-platform';

export class FirestorePushNotificationTokenController extends PushNotificationTokenControllerType {

  private readonly db: FirestorePushNotificationTokenDatabase;

  public constructor(db: FirestorePushNotificationTokenDatabase, dateProvider?: DateProvider) {
    super(dateProvider);
    this.db = db;
  }

  public async save(deviceId: string, token: string, platform: string): Promise<SaveResult> {
    try {
      await this.trySave(deviceId, token, platform);
      return { kind: 'Success' };
    } catch (error) {
      return { kind: 'Error', error };
    }
  }

  private async trySave(deviceId: string, token: string, platform: string) {
    if (this.isPlatformEqual(platform, 'ios')) {
      const t = this.createToken(deviceId, token);
      await this.db.saveApplePushNotificationToken(t);
      return;
    }

    if (this.isPlatformEqual(platform, 'android')) {
      // Not supported, but not error...
      return;
    }

    throw new Error(`Unknown platform: '${platform}'`);
  }

  private isPlatformEqual(platform: string, value: string): boolean {
    if (platform.length !== value.length) {
      return false;
    }

    const platformLower = platform.toLowerCase();
    return platformLower === value;
  }
}
