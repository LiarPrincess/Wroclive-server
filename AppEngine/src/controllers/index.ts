import { LinesController } from './lines';
import { StopsController } from './stops';
import { VehicleLocationsControllerType } from './vehicle-locations';

export { LinesController } from './lines';
export { StopsController } from './stops';
export { VehicleLocationsControllerType } from './vehicle-locations';

export interface Controllers {
  readonly lines: LinesController;
  readonly stops: StopsController;
  readonly vehicleLocation: VehicleLocationsControllerType;
}
