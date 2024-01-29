import { sleep } from "./util";
import {
  OpenDataApi,
  OpenDataErrorReporter,
  OpenDataVehicleProvider,
  VehicleLocationsDatabaseMock,
} from "./controllers/vehicle-locations";
import { State, AngleCalculator, AngleCalculatorDatabaseType } from "./controllers/vehicle-locations/state";
import { createConsoleLogger } from "./util";
import { VehicleIdToDatabaseLocation } from "./controllers/vehicle-locations/database";

const second = 1000;

class AngleCalculatorDatabase implements AngleCalculatorDatabaseType {
  async getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToDatabaseLocation | undefined> {
    return undefined;
  }
  async saveLastVehicleAngleUpdateLocations(locations: VehicleIdToDatabaseLocation): Promise<void> {}
}

(async () => {
  try {
    const logger = createConsoleLogger();
    const database = new VehicleLocationsDatabaseMock();

    const api = new OpenDataApi();
    const errorReporter = new OpenDataErrorReporter(logger);
    const angleCalculator = new AngleCalculator(new AngleCalculatorDatabase());
    const state = new State(angleCalculator);
    const provider = new OpenDataVehicleProvider(api, database, state, errorReporter);

    while (true) {
      const now = new Date();
      console.log(now.toISOString());

      const result = await provider.getVehicleLocations();
      switch (result.kind) {
        case "Success":
          for (const lineLocation of result.lineLocations) {
            const line = lineLocation.line;
            if (line.name !== "A") {
              continue;
            }

            console.log(`  ${line.name} (${line.type}, ${line.subtype})`);

            for (const vehicle of lineLocation.vehicles) {
              console.log(`    ${vehicle.id}, lat: ${vehicle.lat}, lng: ${vehicle.lng}, angle: ${vehicle.angle}`);
            }
          }
          break;
        case "ApiError":
          console.log("ApiError");
          break;
        case "ResponseContainsNoVehicles":
          console.log("ResponseContainsNoVehicles");
          break;
        case "NoVehicleHasMovedInLastFewMinutes":
          console.log("NoVehicleHasMovedInLastFewMinutes");
          break;
      }

      await sleep(5 * second);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
