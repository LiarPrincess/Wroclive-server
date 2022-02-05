import { LineLocationCollection } from './models';

export abstract class VehicleLocationsControllerType {

  /**
   * Get vehicle locations for selected lines.
   */
  abstract getVehicleLocations(lineNamesLowercase: Set<string>): LineLocationCollection;

  /**
   * Update locations for all of the vehicles.
   */
  abstract updateVehicleLocations(): Promise<void>;
}
