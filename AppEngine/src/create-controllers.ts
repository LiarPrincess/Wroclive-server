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
  VehicleLocationsControllerType,
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

  if (isLocal) {
    linesController = new PredefinedLinesController();
    stopsController = new PredefinedStopsController();
    notificationsController = new NoNotificationsController();
    pushNotificationTokenController = new LogPushNotificationTokenController(logger);
  } else {
    const db = new FirestoreDatabase();
    linesController = new FirestoreLinesController(db, logger);
    stopsController = new FirestoreStopsController(db, logger);
    notificationsController = new FirestoreNotificationsController(db, logger);
    pushNotificationTokenController = new FirestorePushNotificationTokenController(db);
  }

  const vehicleLocationController: VehicleLocationsControllerType = createVehicleLocationsController(logger);

  return new Controllers(
    linesController,
    stopsController,
    vehicleLocationController,
    notificationsController,
    pushNotificationTokenController
  );
}
