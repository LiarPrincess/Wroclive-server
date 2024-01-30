import { AngleCalculatorType } from "./AngleCalculatorType";
import { VehicleLocationFromApi } from "../models";

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
