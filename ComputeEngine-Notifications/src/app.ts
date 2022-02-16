import { join } from 'path';

import {
  FirestoreDatabaseType,
  FirestoreDatabase,
  LocalFirestoreDatabase
} from './cloud-platform';
import {
  AppleEnvironment,
  ApplePushNotifications,
  LocalApplePushNotifications,
  ApplePushNotificationsType,
  PushNotificationDatabase,
  PushNotificationSender
} from './push-notifications';
import { Twitter } from './twitter';
import { twitterUsername } from './config';
import { Logger, createLogger, getRootDir, isProduction, isLocal } from './util';
import { LoopDependencies, startLoop } from './loop';

(async function () {
  const logger = createLogger('CE-Notifications');

  try {
    const twitter = await createTwitterClient();

    let firestore: FirestoreDatabaseType;
    let apn: ApplePushNotificationsType;

    if (isProduction) {
      firestore = new FirestoreDatabase();
      apn = await createApplePushNotificationClient('production');
    } else {
      const applePushNotificationTokens: string[] = ['TOKEN_1'];
      firestore = new LocalFirestoreDatabase(applePushNotificationTokens, logger);
      apn = new LocalApplePushNotifications(logger);
    }

    const pushNotificationSender = createPushNotificationSender(apn, firestore, logger);

    const twitterUserResult = await twitter.getUser(twitterUsername);
    const twitterUserErrorMessage = `[PushNotifications] Unable to get twitter user '${twitterUsername}': ${twitterUserResult.kind}`;

    switch (twitterUserResult.kind) {
      case 'Success':
        const twitterUser = twitterUserResult.user;
        logger.info(`[PushNotifications] Got twitter user '${twitterUsername}'. Starting loop.`);

        const dependencies = new LoopDependencies(
          twitter,
          twitterUser,
          pushNotificationSender,
          logger
        );

        startLoop(dependencies);
        break;

      case 'Response with errors':
        logger.error(twitterUserErrorMessage, twitterUserResult.errors);
        break;
      case 'Invalid response':
        logger.error(twitterUserErrorMessage, twitterUserResult.response);
        break;
      case 'Network error':
        logger.error(twitterUserErrorMessage, twitterUserResult.error);
        break;
    }
  } catch (error) {
    logger.error('[PushNotifications] Error when starting loop', error);
  }
})();

async function createTwitterClient(): Promise<Twitter> {
  const rootDir = await getRootDir();
  const credentialsPath = join(rootDir, 'Twitter-Credentials.json');
  const credentials = require(credentialsPath);
  return new Twitter(credentials);
}

async function createApplePushNotificationClient(environment: AppleEnvironment): Promise<ApplePushNotifications> {
  if (isLocal && environment === 'production') {
    throw new Error(`Using 'production' apple server locally?`);
  }

  const rootDir = await getRootDir();
  const credentialsPath = join(rootDir, 'APN-Credentials.json');
  const credentials = require(credentialsPath);

  return new ApplePushNotifications({
    token: {
      key: join(rootDir, 'APN-Key.p8'),
      keyId: credentials.keyId,
      teamId: credentials.teamId
    },
    appBundle: 'app.wroclive',
    environment
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
