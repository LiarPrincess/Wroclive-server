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
import { Logger, createLogger, getRootDir, isProduction, isLocal } from "./util";
import { LoopDependencies, startLoop } from "./loop";

// Set process title, so it is easier to kill it during install.
// New title has to be shorter than 'node ./dist/app.js'
process.title = "CE-Notifications";

(async function () {
  const logger = createLogger("CE-Notifications");

  try {
    logger.info(`[Notifications] Creating Twitter api.`);
    // const rootDir = await getRootDir();
    // const twitterCredentialsPath = join(rootDir, "Twitter-Credentials.json");
    // const twitterCredentials = require(twitterCredentialsPath);
    // const twitter = new TwitterApiClient(twitterCredentials, logger);

    const twitter = new NitterClient(logger);

    if (twitter === undefined) {
      // Error was already logged.
      return;
    }

    let firestore: FirestoreDatabaseType;
    let apn: ApplePushNotificationsType;

    if (isProduction) {
      logger.info(`[Notifications] Connecting to Firestore.`);
      firestore = new FirestoreDatabase();
      logger.info(`[Notifications] Connecting to ApplePushNotification.`);
      apn = await createApplePushNotificationClient("production");
    } else {
      const applePushNotificationTokens: string[] = ["TOKEN_1"];
      firestore = new LocalFirestoreDatabase(applePushNotificationTokens, logger);
      apn = new LocalApplePushNotifications(logger);
    }

    logger.info(`[Notifications] Creating notification store.`);
    const notificationStore = new NotificationStore(firestore, logger);

    logger.info(`[Notifications] Creating push notification sender.`);
    const pushNotificationSender = createPushNotificationSender(apn, firestore, logger);

    logger.info(`[Notifications] Starting loop.`);
    const dependencies = new LoopDependencies(twitter, notificationStore, pushNotificationSender, logger);
    startLoop(dependencies);
  } catch (error) {
    logger.error("[Notifications] Error when starting the loop", error);
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
