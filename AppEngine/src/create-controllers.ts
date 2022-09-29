import { Logger, isLocal } from './util';
import { FirestoreDatabase, FakeFirestoreDatabase } from './cloud-platform';

import { FirestoreLinesController } from './controllers/lines';
import { FirestoreStopsController } from './controllers/stops';
import { StopsLiveController } from './controllers/stops-live';
import { createVehicleLocationsController } from './controllers/vehicle-locations';
import { FirestoreNotificationsController, } from './controllers/notifications';
import { FirestorePushNotificationTokenController } from './controllers/push-notification-token';
import { Controllers } from './controllers';

export function createControllers(logger: Logger): Controllers {
  // We are 'ok' with using open-data/mpk api locally,
  // but we are not 'ok' with firestore (since it is a live system!).
  const firestore = isLocal ? new FakeFirestoreDatabase(logger) : new FirestoreDatabase();

  const lines = new FirestoreLinesController(firestore, logger);
  const stops = new FirestoreStopsController(firestore, logger);
  const stopsLive = new StopsLiveController(logger);

  const vehicleLocations = createVehicleLocationsController(firestore, logger);

  const notifications = new FirestoreNotificationsController(firestore, logger);
  const pushNotificationToken = new FirestorePushNotificationTokenController(firestore);

  return new Controllers(
    lines,
    stops,
    stopsLive,
    vehicleLocations,
    notifications,
    pushNotificationToken
  );
}
