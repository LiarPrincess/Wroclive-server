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
  VehicleLocationsDatabase
} from './database';
export { VehicleLocationsController } from './VehicleLocationsController';
export { VehicleLocationsControllerType } from './VehicleLocationsControllerType';
export { VehicleLocationsControllerMock } from './VehicleLocationsControllerMock';

import { VehicleLocationsController } from './VehicleLocationsController';
import { MpkApi, MpkErrorReporter, MpkVehicleProvider } from './mpk';
import { OpenDataApi, OpenDataErrorReporter, OpenDataVehicleProvider } from './open-data';
import { VehicleLocationsDatabase } from './database';
import { Logger } from './models';

export function createVehicleLocationsController(logger: Logger): VehicleLocationsController {
  const database = new VehicleLocationsDatabase();

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
