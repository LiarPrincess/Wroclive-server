import { NotificationCollection } from './models';
import { NotificationsControllerType } from './NotificationsControllerType';

export class NotificationsControllerMock extends NotificationsControllerType {

  public notifications: NotificationCollection = { timestamp: 'TIMESTAMP', data: [] };
  public getNotificationsCallCount = 0;

  public async getNotifications(): Promise<NotificationCollection> {
    this.getNotificationsCallCount++;
    return this.notifications;
  }
}
