import { LineLocationCollection } from './models';
import { VehicleLocationsControllerType } from './VehicleLocationsControllerType';

export class FakeVehicleLocationsController extends VehicleLocationsControllerType {

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
