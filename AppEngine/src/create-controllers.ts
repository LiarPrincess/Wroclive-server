import { Logger, isLocal } from './util';
import { FirestoreDatabase, FakeFirestoreDatabase } from './cloud-platform';

import { FirestoreLinesController } from './controllers/lines';
import { FirestoreStopsController } from './controllers/stops';
import { createVehicleLocationsController } from './controllers/vehicle-locations';
import { FirestoreNotificationsController, } from './controllers/notifications';
import { FirestorePushNotificationTokenController } from './controllers/push-notification-token';
import { Controllers } from './controllers';

export function createControllers(logger: Logger): Controllers {
  // We are 'ok' with using open-data/mpk api locally,
  // but we are not 'ok' with firestore (since it is a live system!).
  const firestore = isLocal ? new FakeFirestoreDatabase(logger) : new FirestoreDatabase();

  const linesController = new FirestoreLinesController(firestore, logger);
  const stopsController = new FirestoreStopsController(firestore, logger);

  const vehicleLocationController = createVehicleLocationsController(firestore, logger);

  const notificationsController = new FirestoreNotificationsController(firestore, logger);
  const pushNotificationTokenController = new FirestorePushNotificationTokenController(firestore);

  return new Controllers(
    linesController,
    stopsController,
    vehicleLocationController,
    notificationsController,
    pushNotificationTokenController
  );
}
