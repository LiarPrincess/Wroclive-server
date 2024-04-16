import { Store } from "../Store";
import { StoredNotification } from "../StoredNotification";
import { FirestoreAllNotificationsDocument, FirestoreNotificationDatabase } from "../../cloud-platform";
import { Notification, NotificationAuthor } from "../../Notification";
import { Logger } from "../../util";

/* ============ */
/* === Date === */
/* ============ */

let date: Date = new Date(0);

function getDateMock(): Date {
  return date;
}

/* ============== */
/* === Logger === */
/* ============== */

export class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void {}
  error(message?: any, ...optionalParams: any[]): void {}
}

const logger = new LoggerMock();

/* ================ */
/* === Database === */
/* ================ */

export class FirestoreDatabaseMock implements FirestoreNotificationDatabase {
  public getNotificationsResult: FirestoreAllNotificationsDocument | undefined;
  public getNotificationsCallCount = 0;

  public async getNotifications(): Promise<FirestoreAllNotificationsDocument | undefined> {
    this.getNotificationsCallCount++;
    return this.getNotificationsResult;
  }

  public storedNotifications: FirestoreAllNotificationsDocument | undefined;
  public storeNotificationsCallCount = 0;

  public async storeNotifications(document: FirestoreAllNotificationsDocument) {
    this.storeNotificationsCallCount++;
    this.storedNotifications = document;
  }
}

/* ============ */
/* === Main === */
/* ============ */

function createTweet(id: string): Notification {
  const author = new NotificationAuthor("author_name" + id, "author_username" + id);
  return new Notification(id, "url_" + id, author, new Date(123), "text_" + id);
}

const tweet1 = createTweet("1");
const tweet2 = createTweet("2");
const tweet3 = createTweet("3");

const notification1 = StoredNotification.fromNotification(tweet1);
const notification2 = StoredNotification.fromNotification(tweet2);
const notification3 = StoredNotification.fromNotification(tweet3);

describe("NotificationStore", () => {
  it("stores notifications if there nothing in database", async () => {
    const database = new FirestoreDatabaseMock();
    const store = new Store(database, logger, getDateMock);

    date = new Date("2022-01-02T03:04:05.999Z");
    database.getNotificationsResult = undefined;

    await store.store([tweet1, tweet2, tweet3]);

    expect(database.getNotificationsCallCount).toEqual(1);
    expect(database.storeNotificationsCallCount).toEqual(1);
    expect(database.storedNotifications).toEqual({
      timestamp: "2022-01-02T03:04:05.999Z",
      data: [notification1, notification2, notification3],
    });
  });

  it("stores notifications if there is a new tweet", async () => {
    const database = new FirestoreDatabaseMock();
    const store = new Store(database, logger, getDateMock);

    // 1st store
    date = new Date("2022-01-02T03:04:05.999Z");
    database.getNotificationsResult = {
      timestamp: "OLD",
      data: [notification1],
    };

    await store.store([tweet1, tweet2]);
    expect(database.getNotificationsCallCount).toEqual(1);
    expect(database.storeNotificationsCallCount).toEqual(1);
    expect(database.storedNotifications).toEqual({
      timestamp: "2022-01-02T03:04:05.999Z",
      data: [notification1, notification2],
    });

    // 2nd store - new tweets
    date = new Date("2022-02-03T04:05:06.999Z");

    await store.store([tweet2, tweet3]);
    expect(database.getNotificationsCallCount).toEqual(1);
    expect(database.storeNotificationsCallCount).toEqual(2);
    expect(database.storedNotifications).toEqual({
      timestamp: "2022-02-03T04:05:06.999Z",
      data: [notification2, notification3],
    });
  });

  it("does nothing if there are no new tweets", async () => {
    const database = new FirestoreDatabaseMock();
    const store = new Store(database, logger, getDateMock);

    // 1st store
    date = new Date("2022-01-02T03:04:05.999Z");
    database.getNotificationsResult = {
      timestamp: "OLD",
      data: [notification1],
    };

    await store.store([tweet1, tweet2]);
    expect(database.getNotificationsCallCount).toEqual(1);
    expect(database.storeNotificationsCallCount).toEqual(1);
    expect(database.storedNotifications).toEqual({
      timestamp: "2022-01-02T03:04:05.999Z",
      data: [notification1, notification2],
    });

    // 2nd store - no new tweets (the same expectations as before)
    date = new Date("2022-02-03T04:05:06.999Z");

    await store.store([tweet1, tweet2]);
    expect(database.getNotificationsCallCount).toEqual(1);
    expect(database.storeNotificationsCallCount).toEqual(1);
    expect(database.storedNotifications).toEqual({
      timestamp: "2022-01-02T03:04:05.999Z",
      data: [notification1, notification2],
    });
  });
});
