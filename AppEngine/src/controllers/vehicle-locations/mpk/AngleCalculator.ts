import { DatabaseType } from '../database';
import { AngleCalculatorBase, VehicleIdToLastAngleUpdateLocation } from '../helpers';

export class AngleCalculator extends AngleCalculatorBase {

  public constructor(
    private readonly database: DatabaseType
  ) {
    super();
  }

  protected async getLastVehicleAngleUpdateLocationsFromDatabase(): Promise<VehicleIdToLastAngleUpdateLocation | undefined> {
    const result = await this.database.getMpkLastVehicleAngleUpdateLocations();
    return result;
  }

  public async storeLastVehicleAngleUpdateLocationInDatabase() {
    const locations = this.vehicleIdToLastAngleUpdateLocation;
    if (locations !== undefined) {
      this.database.saveMpkLastVehicleAngleUpdateLocations(locations);
    }
  }
}
