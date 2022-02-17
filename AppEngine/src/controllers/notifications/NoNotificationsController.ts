import { NotificationCollection } from './models';
import { NotificationsControllerType } from './NotificationsControllerType';

export class NoNotificationsController extends NotificationsControllerType {

  public async getNotifications(): Promise<NotificationCollection> {
    return { timestamp: 'TIMESTAMP', data: [] };
  }
}
