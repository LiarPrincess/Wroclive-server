import { AngleCalculatorType, AngleCalculatorDatabaseType } from "./AngleCalculatorType";
import { VehicleLocationFromApi } from "../models";
import { VehicleIdToDatabaseLocation } from "../database";

export class AngleCalculatorDatabaseMock implements AngleCalculatorDatabaseType {
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

export class AngleCalculatorMock implements AngleCalculatorType {
  public vehicleIdToAngle = new Map<string, number>();
  public calculateAngleCallCount = 0;

  public constructor(vehicles: { id: string; angle: number }[] = []) {
    for (const v of vehicles) {
      this.vehicleIdToAngle.set(v.id, v.angle);
    }
  }

  public add(vehicle: { id: string; angle: number }) {
    this.vehicleIdToAngle.set(vehicle.id, vehicle.angle);
  }

  public async calculateAngle(now: Date, vehicle: VehicleLocationFromApi): Promise<number> {
    this.calculateAngleCallCount += 1;

    const id = vehicle.id;
    const result = this.vehicleIdToAngle.get(id);

    if (result !== undefined) {
      return result;
    }

    throw new Error(`[AngleCalculatorMock.calculateAngle] Unknown vehicle id: ${id}`);
  }

  public saveStateInDatabaseCallCount = 0;

  public async saveStateInDatabase(now: Date) {
    this.saveStateInDatabaseCallCount += 1;
  }
}
