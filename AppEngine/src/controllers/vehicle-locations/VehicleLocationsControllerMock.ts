import { LineLocationCollection } from './models';
import { VehicleLocationsControllerType } from './VehicleLocationsControllerType';
import { DatabaseMock } from './database';

export class VehicleLocationsControllerMock extends VehicleLocationsControllerType {

  constructor() {
    super(new DatabaseMock());
  }

  data = new LineLocationCollection('', []);
  getVehicleLocationsCallCount = 0;
  updateVehicleLocationsCallCount = 0;
  lineNamesLowerCaseArg: Set<string> = new Set();

  getVehicleLocations(lineNamesLowercase: Set<string>): LineLocationCollection {
    this.getVehicleLocationsCallCount++;
    this.lineNamesLowerCaseArg = lineNamesLowercase;
    return this.data;
  }

  updateVehicleLocations(): Promise<void> {
    this.updateVehicleLocationsCallCount++;
    return Promise.resolve();
  }
}
