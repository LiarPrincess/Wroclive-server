import { LinesController } from './lines';
import { StopsController } from './stops';
import { VehicleLocationsController } from './vehicle-locations';

export * from './lines';
export * from './stops';
export * from './vehicle-locations';

export interface Controllers {
  readonly lines: LinesController;
  readonly stops: StopsController;
  readonly vehicleLocation: VehicleLocationsController;
}
