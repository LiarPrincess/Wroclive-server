import { FakeLinesController } from './lines/FakeLinesController';
import { FakeStopsController } from './stops/FakeStopsController';
import { FakeVehicleLocationsController } from './vehicle-locations/FakeVehicleLocationsController';

export { FakeLinesController } from './lines/FakeLinesController';
export { FakeStopsController } from './stops/FakeStopsController';
export { FakeVehicleLocationsController } from './vehicle-locations/FakeVehicleLocationsController';

export interface FakeControllers {
  readonly lines: FakeLinesController;
  readonly stops: FakeStopsController;
  readonly vehicleLocation: FakeVehicleLocationsController;
}
