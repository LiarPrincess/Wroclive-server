import { Logger, isLocal } from './util';
import { FirestoreDatabase } from './cloud-platform';
import {
  LinesController, FirestoreLinesController, DummyLinesController,
  StopsController, FirestoreStopsController, DummyStopsController,
  VehicleLocationsControllerImpl,
  OpenDataVehicleProvider, MpkVehicleProvider, PreventStaleDataFromVehicleProvider,
  Controllers
} from './controllers';

export function createControllers(logger: Logger): Controllers {
  let linesController: LinesController;
  let stopsController: StopsController;

  if (isLocal) {
    linesController = new DummyLinesController();
    stopsController = new DummyStopsController();
  } else {
    const db = new FirestoreDatabase();
    linesController = new FirestoreLinesController(db);
    stopsController = new FirestoreStopsController(db);
  }

  // If the 1st provider returns no locations, then try the next one.
  const openDataVehicleProvider = new OpenDataVehicleProvider();
  const mpkVehicleProvider = new MpkVehicleProvider();
  const vehicleProviders = [openDataVehicleProvider, mpkVehicleProvider]
    .map(p => new PreventStaleDataFromVehicleProvider(p, logger));

  const vehicleController = new VehicleLocationsControllerImpl(linesController, vehicleProviders);

  return {
    lines: linesController,
    stops: stopsController,
    vehicleLocation: vehicleController
  };
}
