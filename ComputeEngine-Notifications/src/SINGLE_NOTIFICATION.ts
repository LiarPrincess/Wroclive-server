import { join } from "path";

import { FirestoreDatabaseType, FirestoreDatabase, LocalFirestoreDatabase } from "./cloud-platform";
import {
  AppleEnvironment,
  ApplePushNotifications,
  LocalApplePushNotifications,
  ApplePushNotificationsType,
  PushNotificationDatabase,
  PushNotificationSender,
} from "./push-notifications";
import { TwitterApiClient } from "./twitter-api";
import { NitterClient } from "./twitter-nitter";
import { NotificationStore } from "./notification-store";
import { nitterUrl } from "./config";
import { Logger, createLogger, getRootDir, isProduction, isLocal } from "./util";
import { LoopDependencies, startLoop } from "./loop";
import { Notification, NotificationAuthor } from "./Notification";

(async function () {
  // Uncomment this line.
  // Then disable check in 'createApplePushNotificationClient'.
  // const isProduction = true;
  const logger = createLogger("CE-Notifications-SINGLE");

  try {
    let firestore: FirestoreDatabaseType;
    let apn: ApplePushNotificationsType;

    if (isProduction) {
      logger.info(`[Notifications-SINGLE] Connecting to Firestore.`);
      firestore = new FirestoreDatabase();
      logger.info(`[Notifications-SINGLE] Connecting to ApplePushNotification.`);
      apn = await createApplePushNotificationClient("production");
    } else {
      const applePushNotificationTokens: string[] = ["TOKEN_1"];
      firestore = new LocalFirestoreDatabase(applePushNotificationTokens, logger);
      apn = new LocalApplePushNotifications(logger);
    }

    logger.info(`[Notifications-SINGLE] Creating push notification sender.`);
    const sender = createPushNotificationSender(apn, firestore, logger);

    const text = "Przerwa techniczna. Do niedzieli 30.11 Wroclive NIE będzie działać.";

    const url = "";
    const createdAt = new Date();
    const id = createdAt.toISOString() + "-SINGLE";
    const author = new NotificationAuthor("Wroclive", "Wroclive");
    const notification = new Notification(
      id,
      url,
      author,
      createdAt,
      text,
    );

    await sender.send([notification]);
    logger.info(`[Notifications-SINGLE] End ${createdAt.toISOString()}.`);

  } catch (error) {
    logger.error("[Notifications-SINGLE] Error when sending", error);
  }
})();

async function createApplePushNotificationClient(environment: AppleEnvironment): Promise<ApplePushNotifications> {
  if (isLocal && environment === "production") {
    throw new Error(`Using 'production' apple server locally?`);
  }

  const rootDir = await getRootDir();
  const credentialsPath = join(rootDir, "APN-Credentials.json");
  const credentials = require(credentialsPath);

  return new ApplePushNotifications({
    token: {
      key: join(rootDir, "APN-Key.p8"),
      keyId: credentials.keyId,
      teamId: credentials.teamId,
    },
    appBundle: "app.wroclive",
    environment,
  });
}

function createPushNotificationSender(
  apn: ApplePushNotificationsType,
  firestore: FirestoreDatabaseType,
  logger: Logger
): PushNotificationSender {
  const database = new PushNotificationDatabase(firestore);
  return new PushNotificationSender(apn, database, logger);
}
