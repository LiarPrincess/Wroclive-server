import { LineLocationCollection } from './models';
import { VehicleLocationsDatabaseType } from './database';

export abstract class VehicleLocationsControllerType {

  public readonly database: VehicleLocationsDatabaseType;

  public constructor(database: VehicleLocationsDatabaseType) {
    this.database = database;
  }

  /**
   * Get vehicle locations for selected lines.
   */
  public abstract getVehicleLocations(lineNamesLowercase: Set<string>): LineLocationCollection;

  /**
   * Update locations for all of the vehicles.
   */
  public abstract updateVehicleLocations(): Promise<void>;
}
