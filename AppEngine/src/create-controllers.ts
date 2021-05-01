import { FirestoreDatabase } from './cloud-platform';
import { isLocal, Logger } from './util';
import {
  Mpk,
  OpenDataVehicleLocationProvider, MpkVehicleLocationProvider, PreventStaleResponseFromVehicleLocationProvider
} from './mpk';
import {
  LinesController, FirestoreLineController, DummyLinesController,
  StopsController, FirestoreStopsController, DummyStopsController,
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
    linesController = new FirestoreLineController(db);
    stopsController = new FirestoreStopsController(db);
  }

  // If the 1st provider returns no locations, then try the next one.
  const openDataVehicleProvider = new OpenDataVehicleLocationProvider();
  const mpkVehicleProvider = new MpkVehicleLocationProvider();
  const vehicleProviders = [openDataVehicleProvider, mpkVehicleProvider]
    .map(p => new PreventStaleResponseFromVehicleLocationProvider(p));

  const mpk = new Mpk(linesController, vehicleProviders, logger);

  return {
    mpk,
    lines: linesController,
    stops: stopsController
  };
}
