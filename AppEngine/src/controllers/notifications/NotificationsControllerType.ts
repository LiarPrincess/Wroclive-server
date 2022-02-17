import { NotificationCollection } from './models';

export abstract class NotificationsControllerType {
  /**
   * Get all of the notifications from the database.
   */
  public abstract getNotifications(): Promise<NotificationCollection>;
}
