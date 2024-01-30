export { VehicleLocation, LineLocation, LineLocationLine, LineLocationCollection } from "./models";
export { MpkApi, MpkErrorReporter, MpkVehicleProvider } from "./mpk";
export { OpenDataApi, OpenDataErrorReporter, OpenDataVehicleProvider } from "./open-data";
export {
  FirestoreDatabase as VehicleLocationsDatabase,
  DatabaseType as VehicleLocationsDatabaseType,
  DatabaseMock as VehicleLocationsDatabaseMock,
} from "./database";
export { VehicleLocationsController } from "./VehicleLocationsController";
export { VehicleLocationsControllerType } from "./VehicleLocationsControllerType";
export { VehicleLocationsControllerMock } from "./VehicleLocationsControllerMock";

import {
  State,
  AngleCalculator,
  AngleCalculatorDatabaseType,
  DepotClassifier,
  LineScheduleClassifier,
  HasMovedInLastFewMinutesClassifier,
} from "./state";
import { FirestoreDatabase, VehicleIdToDatabaseLocation } from "./database";
import { MpkApi, MpkErrorReporter, MpkVehicleProvider } from "./mpk";
import { OpenDataApi, OpenDataErrorReporter, OpenDataVehicleProvider } from "./open-data";
import { VehicleLocationsController } from "./VehicleLocationsController";
import { Logger } from "../../util";
import { FirestoreVehicleLocationsDatabase } from "../../cloud-platform";

function createTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

class OpenDataAngleCalculatorDatabase implements AngleCalculatorDatabaseType {
  public constructor(private readonly firestore: FirestoreVehicleLocationsDatabase) {}

  public async getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToDatabaseLocation | undefined> {
    const doc = await this.firestore.getOpenDataLastVehicleAngleUpdateLocations();
    return doc?.data;
  }

  public async saveLastVehicleAngleUpdateLocations(locations: VehicleIdToDatabaseLocation): Promise<void> {
    const timestamp = createTimestamp();
    await this.firestore.saveOpenDataLastVehicleAngleUpdateLocations({
      timestamp,
      data: locations,
    });
  }
}

class MpkAngleCalculatorDatabase implements AngleCalculatorDatabaseType {
  public constructor(private readonly firestore: FirestoreVehicleLocationsDatabase) {}

  public async getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToDatabaseLocation | undefined> {
    const doc = await this.firestore.getMpkLastVehicleAngleUpdateLocations();
    return doc?.data;
  }

  public async saveLastVehicleAngleUpdateLocations(locations: VehicleIdToDatabaseLocation): Promise<void> {
    const timestamp = createTimestamp();
    await this.firestore.saveMpkLastVehicleAngleUpdateLocations({
      timestamp,
      data: locations,
    });
  }
}

/** Factory function, since the assembly is a bit complicated. */
export function createVehicleLocationsController(
  firestore: FirestoreVehicleLocationsDatabase,
  logger: Logger
): VehicleLocationsController {
  const database = new FirestoreDatabase(firestore, logger);

  // =================
  // === Open data ===
  // =================

  const openDataApi = new OpenDataApi();
  const openDataError = new OpenDataErrorReporter(logger);

  const openDataAngleDatabase = new OpenDataAngleCalculatorDatabase(firestore);
  const openDataState = new State(
    new AngleCalculator(openDataAngleDatabase),
    new DepotClassifier(),
    new LineScheduleClassifier(),
    new HasMovedInLastFewMinutesClassifier()
  );

  const openDataProvider = new OpenDataVehicleProvider(openDataApi, database, openDataState, openDataError);

  // ===========
  // === MPK ===
  // ===========

  const mpkApi = new MpkApi();
  const mpkError = new MpkErrorReporter(logger);

  const mpkAngleDatabase = new MpkAngleCalculatorDatabase(firestore);
  const mpkState = new State(
    new AngleCalculator(mpkAngleDatabase),
    /* DepotClassifier */ undefined,
    /* LineScheduleClassifier */ undefined,
    new HasMovedInLastFewMinutesClassifier()
  );

  const mpkProvider = new MpkVehicleProvider(mpkApi, database, mpkState, mpkError);

  return new VehicleLocationsController(database, openDataProvider, mpkProvider, logger);
}
