import { UpdateResult } from "./StateType";
import { Line, VehicleLocationFromApi } from "../models";

export class StateMock {
  public updateResult: UpdateResult | undefined;
  public updateCallArgs: { lines: Line[]; vehicleLocations: VehicleLocationFromApi[] }[] = [];

  public async update(lines: Line[], vehicleLocations: VehicleLocationFromApi[]): Promise<UpdateResult> {
    if (this.updateResult === undefined) {
      throw new Error(`[StateMock] Unexpected call to 'update'.`);
    }

    this.updateCallArgs.push({ lines, vehicleLocations });
    return this.updateResult;
  }
}
