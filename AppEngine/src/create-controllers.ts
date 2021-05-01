import { FirestoreDatabase } from './cloud-platform';
import { isLocal, Logger } from './util';
import {
  Mpk,
  LinesProvider, DummyLineProvider, FirestoreLineProvider,
  OpenDataVehicleLocationProvider, MpkVehicleLocationProvider, PreventStaleResponseFromVehicleLocationProvider
} from './mpk';
import {
  StopsController, FirestoreStopsController, DummyStopsController,
  Controllers
} from './controllers';

export function createControllers(logger: Logger): Controllers {
  let linesProvider: LinesProvider;
  let stopsController: StopsController;

  if (isLocal) {
    linesProvider = new DummyLineProvider();
    stopsController = new DummyStopsController();
  } else {
    const db = new FirestoreDatabase();
    linesProvider = new FirestoreLineProvider(db);
    stopsController = new FirestoreStopsController(db);
  }

  // If the 1st provider returns no locations, then try the next one.
  const openDataVehicleProvider = new OpenDataVehicleLocationProvider();
  const mpkVehicleProvider = new MpkVehicleLocationProvider();
  const vehicleProviders = [openDataVehicleProvider, mpkVehicleProvider]
    .map(p => new PreventStaleResponseFromVehicleLocationProvider(p));

  const mpk = new Mpk(linesProvider, vehicleProviders, logger);

  return { mpk, stops: stopsController };
}
