import { LineLocationsCollection } from './models';
import { VehicleLocationsController } from './VehicleLocationsController';

export class FakeVehicleLocationsController extends VehicleLocationsController {

  data = new LineLocationsCollection('', []);
  lineNamesLowerCaseArg: Set<string> | undefined;
  getVehicleLocationsCallCount = 0;
  updateVehicleLocationsCallCount = 0;

  getVehicleLocations(lineNamesLowerCase: Set<string>): LineLocationsCollection {
    this.lineNamesLowerCaseArg = lineNamesLowerCase;
    this.getVehicleLocationsCallCount++;
    return this.data;
  }

  updateVehicleLocations(): Promise<void> {
    this.updateVehicleLocationsCallCount++;
    return Promise.resolve();
  }
}
