export { VehicleLocation, LineLocation, LineLocationLine, LineLocationCollection } from "./models";
export { MpkApi, MpkErrorReporter, MpkVehicleProvider } from "./mpk";
export { OpenDataApi, OpenDataErrorReporter, OpenDataVehicleProvider } from "./open-data";
export { DatabaseType as VehicleLocationsDatabaseType, DatabaseMock as VehicleLocationsDatabaseMock } from "./state";
export { VehicleLocationsController } from "./VehicleLocationsController";
export { VehicleLocationsControllerType } from "./VehicleLocationsControllerType";
export { VehicleLocationsControllerMock } from "./VehicleLocationsControllerMock";

import { State, AngleCalculator } from "./state";
import { VehicleLocationsController } from "./VehicleLocationsController";
import { MpkVehicleProvider, MpkApi, MpkDatabase, MpkErrorReporter } from "./mpk";
import { OpenDataVehicleProvider, OpenDataApi, OpenDataDatabase, OpenDataErrorReporter } from "./open-data";
import { DepotClassifier, LineScheduleClassifier, HasMovedInLastFewMinutesClassifier } from "./vehicle-classification";
import { Logger } from "../../util";
import { FirestoreVehicleLocationsDatabase } from "../../cloud-platform";

/** Factory function, since the assembly is a bit complicated. */
export function createVehicleLocationsController(
  firestore: FirestoreVehicleLocationsDatabase,
  logger: Logger
): VehicleLocationsController {
  // =================
  // === Open data ===
  // =================
  // Open data is designed as a PRIMARY data source.
  // We are more strict on what we show.

  const openDataApi = new OpenDataApi();
  const openDataError = new OpenDataErrorReporter(logger);
  const openDataDatabase = new OpenDataDatabase(firestore, logger);

  const openDataState = new State(
    new AngleCalculator(openDataDatabase),
    new DepotClassifier(),
    new LineScheduleClassifier(),
    new HasMovedInLastFewMinutesClassifier()
  );

  const openDataProvider = new OpenDataVehicleProvider(openDataApi, openDataDatabase, openDataState, openDataError);

  // ===========
  // === MPK ===
  // ===========
  // Mpk is designed as a SECONDARY data source.
  // We are more lenient on what we show.

  const mpkApi = new MpkApi();
  const mpkError = new MpkErrorReporter(logger);
  const mpkDatabase = new MpkDatabase(firestore, logger);

  const mpkState = new State(
    new AngleCalculator(mpkDatabase),
    /* DepotClassifier */ undefined,
    /* LineScheduleClassifier */ undefined,
    new HasMovedInLastFewMinutesClassifier()
  );

  const mpkProvider = new MpkVehicleProvider(mpkApi, mpkDatabase, mpkState, mpkError);

  return new VehicleLocationsController(openDataProvider, mpkProvider, logger);
}
