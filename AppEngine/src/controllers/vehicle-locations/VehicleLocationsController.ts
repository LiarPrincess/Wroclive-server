import { TimestampedLineLocations } from './models';

export abstract class VehicleLocationsController {

  /**
   * Get vehicle locations for selected lines.
   */
  abstract getVehicleLocations(lineNamesLowerCase: Set<string>): TimestampedLineLocations;

  /**
   * Update locations for all of the vehicles.
   */
  abstract updateVehicleLocations(): Promise<void>;

  protected createTimestamp(): string {
    return new Date().toISOString();
  }
}
