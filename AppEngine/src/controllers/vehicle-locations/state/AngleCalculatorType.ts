import { VehicleLocationFromApi } from "../models";

export interface AngleCalculatorType {
  calculateAngle(now: Date, vehicle: VehicleLocationFromApi): Promise<number>;
  saveStateInDatabase(now: Date): Promise<void>;
}
