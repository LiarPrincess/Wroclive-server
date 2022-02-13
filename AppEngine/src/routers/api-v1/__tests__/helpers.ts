import { LinesControllerMock } from '../../../controllers/lines';
import { StopsControllerMock } from '../../../controllers/stops';
import { VehicleLocationsControllerMock } from '../../../controllers/vehicle-locations';

export { Line, LineCollection } from '../../../controllers/lines';
export { Stop, StopCollection } from '../../../controllers/stops';
export { LineLocation, LineLocationLine, LineLocationCollection, VehicleLocation } from '../../../controllers/vehicle-locations';

export class ControllersMock {
  constructor(
    public readonly lines: LinesControllerMock,
    public readonly stops: StopsControllerMock,
    public readonly vehicleLocation: VehicleLocationsControllerMock
  ) { }
}

export function createControllers(): ControllersMock {
  const lines = new LinesControllerMock();
  const stops = new StopsControllerMock();
  const vehicleLocation = new VehicleLocationsControllerMock();
  return new ControllersMock(lines, stops, vehicleLocation);
}
