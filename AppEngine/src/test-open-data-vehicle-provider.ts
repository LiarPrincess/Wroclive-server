import { sleep } from "./util";
import { OpenDataApi, OpenDataErrorReporter, OpenDataVehicleProvider } from "./controllers/vehicle-locations";
import { State, AngleCalculator, DatabaseType, VehicleIdToAngleData } from "./controllers/vehicle-locations/state";
import { Line, LineCollection } from "./controllers/vehicle-locations/models";
import { createConsoleLogger } from "./util";

const second = 1000;

class Database implements DatabaseType {
  private lines: Line[] = [];

  public async getLines(): Promise<Line[]> {
    return this.lines;
  }
  public async setLines(lines: LineCollection): Promise<void> {
    this.lines = lines.data;
  }

  public async getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToAngleData | undefined> {
    return undefined;
  }
  public async saveLastVehicleAngleUpdateLocations(data: VehicleIdToAngleData): Promise<void> {}
}

(async () => {
  try {
    const logger = createConsoleLogger();
    const database = new Database();

    const api = new OpenDataApi();
    const errorReporter = new OpenDataErrorReporter(logger);
    const angleCalculator = new AngleCalculator(database);
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
