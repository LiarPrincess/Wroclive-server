import { LinesControllerType } from './lines';
import { StopsControllerType } from './stops';
import { VehicleLocationsControllerType } from './vehicle-locations';

export class Controllers {
  constructor(
    public readonly lines: LinesControllerType,
    public readonly stops: StopsControllerType,
    public readonly vehicleLocation: VehicleLocationsControllerType
  ) { }
}
