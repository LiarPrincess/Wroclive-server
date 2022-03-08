import {
  LinesControllerType,
  FirestoreLinesController,
  PredefinedLinesController
} from './controllers/lines';
import {
  StopsControllerType,
  FirestoreStopsController,
  PredefinedStopsController
} from './controllers/stops';
import {
  VehicleLocationsDatabaseType,
  VehicleLocationsDatabase,
  VehicleLocationsDatabaseMock,
  createVehicleLocationsController
} from './controllers/vehicle-locations';
import {
  NotificationsControllerType,
  FirestoreNotificationsController,
  NoNotificationsController
} from './controllers/notifications';
import {
  LogPushNotificationTokenController,
  PushNotificationTokenControllerType,
  FirestorePushNotificationTokenController
} from './controllers/push-notification-token';
import { Controllers } from './controllers';

import { Logger, isLocal } from './util';
import { FirestoreDatabase } from './cloud-platform';

export function createControllers(logger: Logger): Controllers {
  let linesController: LinesControllerType;
  let stopsController: StopsControllerType;
  let notificationsController: NotificationsControllerType;
  let pushNotificationTokenController: PushNotificationTokenControllerType;

  // We are 'ok' with using open-data/mpk api locally,
  // but we are not 'ok' with firestore (since it is a live system!).
  let vehicleLocationsDatabase: VehicleLocationsDatabaseType;

  if (isLocal) {
    linesController = new PredefinedLinesController();
    stopsController = new PredefinedStopsController();
    notificationsController = new NoNotificationsController();
    pushNotificationTokenController = new LogPushNotificationTokenController(logger);
    vehicleLocationsDatabase = new VehicleLocationsDatabaseMock();
  } else {
    const db = new FirestoreDatabase();
    linesController = new FirestoreLinesController(db, logger);
    stopsController = new FirestoreStopsController(db, logger);
    notificationsController = new FirestoreNotificationsController(db, logger);
    pushNotificationTokenController = new FirestorePushNotificationTokenController(db);

    // We don't want to store update, just some of them (performance/free GCP tier limits).
    const limitStoreRequests = true;
    vehicleLocationsDatabase = new VehicleLocationsDatabase(db, limitStoreRequests);
  }

  const vehicleLocationController = createVehicleLocationsController(vehicleLocationsDatabase, logger);

  return new Controllers(
    linesController,
    stopsController,
    vehicleLocationController,
    notificationsController,
    pushNotificationTokenController
  );
}
