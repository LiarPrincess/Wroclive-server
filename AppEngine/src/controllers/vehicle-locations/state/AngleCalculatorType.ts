import { VehicleLocationFromApi } from "../models";
import { VehicleIdToDatabaseLocation } from "../database";

export interface AngleCalculatorDatabaseType {
  getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToDatabaseLocation | undefined>;
  saveLastVehicleAngleUpdateLocations(locations: VehicleIdToDatabaseLocation): Promise<void>;
}

export interface AngleCalculatorType {
  calculateAngle(now: Date, vehicle: VehicleLocationFromApi): Promise<number>;
  saveStateInDatabase(now: Date): Promise<void>;
}
