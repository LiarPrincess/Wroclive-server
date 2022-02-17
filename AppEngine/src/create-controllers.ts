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
  let pushNotificationToken: PushNotificationTokenControllerType;

  if (isLocal) {
    linesController = new PredefinedLinesController();
    stopsController = new PredefinedStopsController();
    pushNotificationToken = new LogPushNotificationTokenController(logger);
  } else {
    const db = new FirestoreDatabase();
    linesController = new FirestoreLinesController(db, logger);
    stopsController = new FirestoreStopsController(db, logger);
    pushNotificationToken = new FirestorePushNotificationTokenController(db);
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
    mpkProvider
  );

  return new Controllers(
    linesController,
    stopsController,
    vehicleLocationController,
    pushNotificationToken
  );
}
