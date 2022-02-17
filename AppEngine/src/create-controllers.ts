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
  LineDatabase,
  OpenDataApi, OpenDataErrorReporter, OpenDataVehicleProvider,
  MpkApi, MpkErrorReporter, MpkVehicleProvider,
  VehicleLocationsController
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

  const lineDatabase = new LineDatabase();

  const openDataApi = new OpenDataApi();
  const openDataError = new OpenDataErrorReporter(logger);
  const openDataProvider = new OpenDataVehicleProvider(openDataApi, lineDatabase, openDataError);

  const mpkApi = new MpkApi();
  const mpkError = new MpkErrorReporter(logger);
  const mpkProvider = new MpkVehicleProvider(mpkApi, lineDatabase, mpkError);

  const vehicleLocationController = new VehicleLocationsController(
    linesController, // Important!
    openDataProvider,
    mpkProvider,
    logger
  );

  return new Controllers(
    linesController,
    stopsController,
    vehicleLocationController,
    notificationsController,
    pushNotificationTokenController
  );
}
