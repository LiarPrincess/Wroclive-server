import { Vehicle } from '../models';

export interface VehicleProvider {

  /**
   * Empty result means 'soft' fail (without exceptions).
   */
  getVehicles(lineNames: string[]): Promise<Vehicle[]>;
}
