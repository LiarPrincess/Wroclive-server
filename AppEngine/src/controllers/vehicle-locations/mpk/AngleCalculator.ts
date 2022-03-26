import { DatabaseType } from '../database';
import { AngleCalculatorBase, VehicleIdToLastAngleUpdateLocation } from '../helpers';

export class AngleCalculator extends AngleCalculatorBase {

  public constructor(
    private readonly database: DatabaseType
  ) {
    super();
  }

  protected async getUpdateLocationsFromDatabase(): Promise<VehicleIdToLastAngleUpdateLocation | undefined> {
    return this.database.getMpkLastVehicleAngleUpdateLocations();
  }

  protected async storeUpdateLocationsInDatabase(locations: VehicleIdToLastAngleUpdateLocation) {
    this.database.saveMpkLastVehicleAngleUpdateLocations(locations);
  }
}
