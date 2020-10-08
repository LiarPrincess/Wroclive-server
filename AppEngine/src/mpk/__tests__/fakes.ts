import { LinesProvider } from '../update-lines';
import { StopsProvider } from '../update-stops';
import { VehicleLocationProvider, } from '../update-vehicle-locations';
import { Line, Stop, MPKVehicle, Timestamped } from '../models';

export class FakeLinesProvider implements LinesProvider {

  data: Timestamped<Line[]> = { timestamp: '', data: [] };
  callCount = 0;

  getLines(): Promise<Timestamped<Line[]>> {
    this.callCount += 1;
    return Promise.resolve(this.data);
  }
}

export class FakeStopsProvider implements StopsProvider {

  data: Timestamped<Stop[]> = { timestamp: '', data: [] };
  callCount = 0;

  getStops(): Promise<Timestamped<Stop[]>> {
    this.callCount += 1;
    return Promise.resolve(this.data);
  }
}

export class FakeVehicleLocationProvider implements VehicleLocationProvider {

  data: MPKVehicle[] = [];
  callCount = 0;

  getVehicleLocations(): Promise<MPKVehicle[]> {
    this.callCount += 1;
    return Promise.resolve(this.data);
  }
}
