import { LineCollection, LineLocationCollection } from "./models";
import { VehicleLocationsControllerType } from "./VehicleLocationsControllerType";

export class VehicleLocationsControllerMock implements VehicleLocationsControllerType {
  data = new LineLocationCollection("", []);
  getVehicleLocationsCallCount = 0;
  lineNamesLowerCaseArg: Set<string> = new Set();

  public getVehicleLocations(lineNamesLowercase: Set<string>): LineLocationCollection {
    this.getVehicleLocationsCallCount++;
    this.lineNamesLowerCaseArg = lineNamesLowercase;
    return this.data;
  }

  updateVehicleLocationsCallCount = 0;

  public async updateVehicleLocations(): Promise<void> {
    this.updateVehicleLocationsCallCount++;
  }

  public async setLines(lines: LineCollection): Promise<void> {
    throw new Error("[VehicleLocationsControllerMock.setLines] Should not be called.");
  }
}
