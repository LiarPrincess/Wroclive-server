import { MPKVehicle } from '../models';

export interface VehicleLocationProvider {
  getVehicleLocations(lineNames: string[]): Promise<MPKVehicle[]>;
}
