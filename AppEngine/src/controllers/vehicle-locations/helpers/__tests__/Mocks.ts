import {
  AngleCalculatorBase,
  VehicleIdToLastAngleUpdateLocation,
} from '../AngleCalculatorBase';

export class AngleCalculatorMock extends AngleCalculatorBase {

  public setLocations(locations: VehicleIdToLastAngleUpdateLocation) {
    this.vehicleIdToLastAngleUpdateLocation = locations;
  }

  public getFromDatabaseResult: VehicleIdToLastAngleUpdateLocation = {};
  public getFromDatabaseCallCount = 0;

  protected async getUpdateLocationsFromDatabase(): Promise<VehicleIdToLastAngleUpdateLocation | undefined> {
    this.getFromDatabaseCallCount++;
    return this.getFromDatabaseResult;
  }

  public storedInDatabase: VehicleIdToLastAngleUpdateLocation | undefined;
  public storeInDatabaseCallCount = 0;

  protected async storeUpdateLocationsInDatabase(locations: VehicleIdToLastAngleUpdateLocation): Promise<void> {
    this.storeInDatabaseCallCount++;
    this.storedInDatabase = locations;
  }
}
