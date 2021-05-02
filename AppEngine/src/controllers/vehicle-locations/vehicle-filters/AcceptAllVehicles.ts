import { Line } from '../..';
import { Vehicle } from '../models';
import { VehicleFilter } from './VehicleFilter';

export class AcceptAllVehicles implements VehicleFilter {

  prepareForFiltering(): void { }

  isAccepted(vehicle: Vehicle, line: Line): boolean {
    return true;
  }
}
