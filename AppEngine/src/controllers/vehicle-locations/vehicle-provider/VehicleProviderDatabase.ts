import { Line } from "../models";
import { VehicleIdToDatabaseLocation } from "../database";

export interface VehicleProviderDatabaseType {
  getLines(): Promise<Line[]>;
  getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToDatabaseLocation | undefined>;
  saveLastVehicleAngleUpdateLocations(locations: VehicleIdToDatabaseLocation): Promise<void>;
}

export class VehicleProviderDatabaseMock implements VehicleProviderDatabaseType {
  public lines: Line[] | undefined;
  public getLinesCallCount = 0;

  public constructor(lines?: Line[]) {
    this.lines = lines;
  }

  public async getLines(): Promise<Line[]> {
    this.getLinesCallCount += 1;

    if (this.lines === undefined) {
      throw new Error("[DatabaseMock.getLines] was not expected to be called.");
    }

    return this.lines;
  }

  public getAngleLocationsResult: VehicleIdToDatabaseLocation = {};
  public getAngleLocationsCallCount = 0;

  public async getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToDatabaseLocation | undefined> {
    if (this.getAngleLocationsResult === undefined) {
      throw new Error("[DatabaseMock.getLastVehicleAngleUpdateLocations] was not expected to be called.");
    }

    this.getAngleLocationsCallCount += 1;
    return this.getAngleLocationsResult;
  }

  public savedAngleLocations: VehicleIdToDatabaseLocation | undefined;
  public saveAngleLocationsCallCount = 0;

  public async saveLastVehicleAngleUpdateLocations(locations: VehicleIdToDatabaseLocation) {
    this.saveAngleLocationsCallCount += 1;
    this.savedAngleLocations = locations;
  }
}
