/*
import { MPKVehicle } from '../models';
import { VehicleLocationProvider, } from '../update-vehicle-locations';
import { LinesProvider } from '../Mpk';
import { TimestampedLines } from '../../controllers';

export class FakeLinesProvider implements LinesProvider {

  data: TimestampedLines = { timestamp: '', data: [] };
  callCount = 0;

  getLines(): TimestampedLines {
    this.callCount += 1;
    return this.data;
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
*/
