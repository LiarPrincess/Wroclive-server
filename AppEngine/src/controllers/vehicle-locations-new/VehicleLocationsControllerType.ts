import { LineLocationCollection } from './models';

export interface VehicleLocationsControllerType {

  /**
   * Get vehicle locations for selected lines.
   */
  getVehicleLocations(lineNamesLowercase: Set<string>): LineLocationCollection;

  /**
   * Update locations for all of the vehicles.
   */
  updateVehicleLocations(): Promise<void>;
}
