import { MPKVehicle } from '../models';

export interface VehicleLocationProvider {

  /**
   * Empty result means 'soft' fail.
   */
  getVehicleLocations(lineNames: string[]): Promise<MPKVehicle[]>;
}
