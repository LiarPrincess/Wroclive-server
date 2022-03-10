import { LineLocationCollection } from './models';
import { DatabaseType } from './database';

export abstract class VehicleLocationsControllerType {

  public readonly database: DatabaseType;

  public constructor(database: DatabaseType) {
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
