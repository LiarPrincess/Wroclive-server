import { VehicleIdToAngleData, DatabaseType } from "./DatabaseType";
import { LineCollection, Line, VehicleLocation } from "../models";

export class DatabaseMock implements DatabaseType {
  /* ============= */
  /* === Lines === */
  /* ============= */

  public getLinesResult: Line[] = [];
  public getLinesCallCount = 0;

  public async getLines(): Promise<Line[]> {
    this.getLinesCallCount += 1;
    return this.getLinesResult;
  }

  public setLinesArg: Line[] = [];
  public setLinesCallCount = 0;

  public async setLines(lines: LineCollection) {
    this.setLinesCallCount += 1;
    this.setLinesArg = lines.data;
  }

  /* ================== */
  /* === Angle data === */
  /* ================== */

  public getAngleLocationsResult: VehicleIdToAngleData = {};
  public getAngleLocationsCallCount = 0;

  public async getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToAngleData | undefined> {
    this.getAngleLocationsCallCount++;
    return this.getAngleLocationsResult;
  }

  public savedAngleLocations: VehicleIdToAngleData | undefined = undefined;
  public saveAngleLocationsCallCount = 0;

  public async saveLastVehicleAngleUpdateLocations(data: VehicleIdToAngleData): Promise<void> {
    this.saveAngleLocationsCallCount++;
    this.savedAngleLocations = data;
  }
}
