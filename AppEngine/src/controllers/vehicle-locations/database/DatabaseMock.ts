import { DatabaseType, VehicleIdToLocation } from "./DatabaseType";
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

  /* ================= */
  /* === Open data === */
  /* ================= */

  public getOpenDataVehicleLocationsCallCount = 0;
  public saveOpenDataVehicleLocationsCallCount = 0;
  public savedOpenDataVehicleLocations: VehicleLocation[] = [];

  public async getOpenDataLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined> {
    this.getOpenDataVehicleLocationsCallCount++;
    return undefined;
  }

  public async saveOpenDataLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation) {
    this.saveOpenDataVehicleLocationsCallCount++;
    this.savedOpenDataVehicleLocations = this.toVehicleLocations(locations);
  }

  /* =========== */
  /* === Mpk === */
  /* =========== */

  public getMpkVehicleLocationsCallCount = 0;
  public saveMpkVehicleLocationsCallCount = 0;
  public savedMpkVehicleLocations: VehicleLocation[] = [];

  public async getMpkLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined> {
    this.getMpkVehicleLocationsCallCount++;
    return undefined;
  }

  public async saveMpkLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation) {
    this.saveMpkVehicleLocationsCallCount++;
    this.savedMpkVehicleLocations = this.toVehicleLocations(locations);
  }

  private toVehicleLocations(map: VehicleIdToLocation): VehicleLocation[] {
    const result: VehicleLocation[] = [];

    for (const id in map) {
      if (Object.prototype.hasOwnProperty.call(map, id)) {
        const loc = map[id];
        if (loc !== undefined) {
          const vehicle = new VehicleLocation(id, loc.lat, loc.lng, loc.angle);
          result.push(vehicle);
        }
      }
    }

    return result.sort((lhs, rhs) => (lhs.id < rhs.id ? -1 : 1));
  }
}
