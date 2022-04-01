export {
  VehicleLocation,
  LineLocation,
  LineLocationLine,
  LineLocationCollection
} from './models';
export {
  MpkApi,
  MpkErrorReporter,
  MpkVehicleProvider
} from './mpk';
export {
  OpenDataApi,
  OpenDataErrorReporter,
  OpenDataVehicleProvider
} from './open-data';
export {
  FirestoreDatabase as VehicleLocationsDatabase,
  DatabaseType as VehicleLocationsDatabaseType,
  DatabaseMock as VehicleLocationsDatabaseMock
} from './database';
export { VehicleLocationsController } from './VehicleLocationsController';
export { VehicleLocationsControllerType } from './VehicleLocationsControllerType';
export { VehicleLocationsControllerMock } from './VehicleLocationsControllerMock';

import { FirestoreDatabase } from './database';
import { MpkApi, MpkErrorReporter, MpkVehicleProvider } from './mpk';
import { OpenDataApi, OpenDataErrorReporter, OpenDataVehicleProvider } from './open-data';
import { VehicleLocationsController } from './VehicleLocationsController';
import { Logger } from '../../util';
import { FirestoreVehicleLocationsDatabase } from '../../cloud-platform';

/** Factory function, since the assembly is a bit complicated. */
export function createVehicleLocationsController(
  firestore: FirestoreVehicleLocationsDatabase,
  logger: Logger
): VehicleLocationsController {
  const database = new FirestoreDatabase(firestore, logger);

  const openDataApi = new OpenDataApi();
  const openDataError = new OpenDataErrorReporter(logger);
  const openDataProvider = new OpenDataVehicleProvider(openDataApi, database, openDataError);

  const mpkApi = new MpkApi();
  const mpkError = new MpkErrorReporter(logger);
  const mpkProvider = new MpkVehicleProvider(mpkApi, database, mpkError);

  return new VehicleLocationsController(
    database,
    openDataProvider,
    mpkProvider,
    logger
  );
}
