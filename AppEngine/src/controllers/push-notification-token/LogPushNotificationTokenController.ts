import {
  SaveResult,
  DateProvider,
  PushNotificationTokenControllerType
} from './PushNotificationTokenControllerType';
import { Logger } from '../../util';

export class LogPushNotificationTokenController extends PushNotificationTokenControllerType {

  private readonly logger: Logger;

  public constructor(logger: Logger, dateProvider?: DateProvider) {
    super(dateProvider);
    this.logger = logger;
  }

  public async save(deviceId: string, token: string, platform: string): Promise<SaveResult> {
    this.logger.info(`Saving push notification token: (deviceId: '${deviceId}', token: '${token}', platform: '${platform}').`);
    return { kind: 'Success' };
  }
}
