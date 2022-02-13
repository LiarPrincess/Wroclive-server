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
import { Controllers } from './controllers';

import { Logger, isLocal } from './util';
import { FirestoreDatabase } from './cloud-platform';

export function createControllers(logger: Logger): Controllers {
  let linesController: LinesControllerType;
  let stopsController: StopsControllerType;

  if (isLocal) {
    linesController = new PredefinedLinesController();
    stopsController = new PredefinedStopsController();
  } else {
    const db = new FirestoreDatabase();
    linesController = new FirestoreLinesController(db);
    stopsController = new FirestoreStopsController(db);
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

  return new Controllers(linesController, stopsController, vehicleLocationController);
}
