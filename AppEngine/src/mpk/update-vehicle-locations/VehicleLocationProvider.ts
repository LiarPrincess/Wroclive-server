import { MPKVehicle } from '../models';

export interface VehicleLocationProvider {
  getVehicleLocations(): Promise<MPKVehicle[]>;
}
