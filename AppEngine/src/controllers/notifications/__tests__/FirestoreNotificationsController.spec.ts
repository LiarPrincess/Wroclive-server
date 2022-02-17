import { Notification, NotificationCollection } from '../models';
import { FirestoreNotificationsController } from '../FirestoreNotificationsController';
import { FirestoreAllNotificationsDocument, FirestoreNotificationDatabase } from '../../../cloud-platform';
import { Logger } from '../../../util';

class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void { }
  error(message?: any, ...optionalParams: any[]): void { }
}

const logger = new LoggerMock();

class FirestoreDatabaseMock implements FirestoreNotificationDatabase {

  public getNotificationsResult: FirestoreAllNotificationsDocument | undefined;
  public getNotificationsCallCount = 0;

  public async getNotifications(): Promise<FirestoreAllNotificationsDocument | undefined> {
    this.getNotificationsCallCount++;
    return this.getNotificationsResult;
  }
}

describe('FirestoreNotificationsController', function () {

  it('returns no notifications if there are none in database', async function () {
    const database = new FirestoreDatabaseMock();
    const controller = new FirestoreNotificationsController(database, logger);

    database.getNotificationsResult = undefined;

    const result = await controller.getNotifications();
    expect(result).toEqual({
      timestamp: 'TIMESTAMP',
      data: []
    });

    expect(database.getNotificationsCallCount).toEqual(1);
  });

  it('returns no notifications from database without caching', async function () {
    const database = new FirestoreDatabaseMock();
    const controller = new FirestoreNotificationsController(database, logger);

    const collection1: NotificationCollection = {
      timestamp: 'TIMESTAMP_1',
      data: [
        { id: 'id_1', url: 'url_1', author: 'author_1', date: new Date(3), body: 'body_1' },
        { id: 'id_2', url: 'url_2', author: 'author_2', date: new Date(5), body: 'body_2' }
      ]
    };
    database.getNotificationsResult = collection1;

    const result1 = await controller.getNotifications();
    expect(database.getNotificationsCallCount).toEqual(1);
    expect(result1).toEqual(collection1);

    const collection2: NotificationCollection = {
      timestamp: 'TIMESTAMP_1',
      data: [
        { id: 'id_2', url: 'url_2', author: 'author_2', date: new Date(5), body: 'body_2' },
        { id: 'id_3', url: 'url_3', author: 'author_3', date: new Date(7), body: 'body_3' }
      ]
    };
    database.getNotificationsResult = collection2;

    const result2 = await controller.getNotifications();
    expect(database.getNotificationsCallCount).toEqual(2);
    expect(result2).toEqual(collection2);
  });
});
