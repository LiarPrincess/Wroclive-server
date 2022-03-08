import { NotificationCollection } from '../models';
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

  it('returns notifications from database without caching', async function () {
    const database = new FirestoreDatabaseMock();
    const controller = new FirestoreNotificationsController(database, logger);

    const collection1: NotificationCollection = {
      timestamp: 'TIMESTAMP1',
      data: [
        { id: 'ID1', url: 'URL1', author: { name: 'NAME1', username: 'USERNAME1' }, date: 'DATE1', body: 'BODY1' },
        { id: 'ID2', url: 'URL2', author: { name: 'NAME2', username: 'USERNAME2' }, date: 'DATE2', body: 'BODY2' }
      ]
    };
    database.getNotificationsResult = collection1;

    const result1 = await controller.getNotifications();
    expect(database.getNotificationsCallCount).toEqual(1);
    expect(result1).toEqual(collection1);

    const collection2: NotificationCollection = {
      timestamp: 'TIMESTAMP2',
      data: [
        { id: 'ID2', url: 'URL2', author: { name: 'NAME2', username: 'USERNAME2' }, date: 'DATE2', body: 'BODY2' },
        { id: 'ID3', url: 'URL3', author: { name: 'NAME3', username: 'USERNAME3' }, date: 'DATE3', body: 'BODY3' }
      ]
    };
    database.getNotificationsResult = collection2;

    const result2 = await controller.getNotifications();
    expect(database.getNotificationsCallCount).toEqual(2);
    expect(result2).toEqual(collection2);
  });
});
