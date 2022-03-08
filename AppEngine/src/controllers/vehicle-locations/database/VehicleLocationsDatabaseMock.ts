import { VehicleLocationsDatabaseType, VehicleIdToLocation } from './VehicleLocationsDatabaseType';
import { LineCollection, Line, VehicleLocation } from '../models';

interface LineByName {
  [key: string]: Line;
}

export class VehicleLocationsDatabaseMock implements VehicleLocationsDatabaseType {

  /* ============= */
  /* === Lines === */
  /* ============= */

  public getLineByNameCallCount = 0;
  private linesByNameLowercase: LineByName = {};

  public getLineByName(name: string): Line {
    this.getLineByNameCallCount++;

    const nameLower = name.toLowerCase();
    const result = this.linesByNameLowercase[nameLower];
    return result || new Line(name, 'NO_MOCK_PROVIDED', 'NO_MOCK_PROVIDED');
  }

  public getLineNamesLowercaseCallCount = 0;
  private lineNamesLowercase: string[] = [];

  public getLineNamesLowercase(): string[] {
    this.getLineNamesLowercaseCallCount++;
    return this.lineNamesLowercase;
  }

  public updateLineDefinitionsCallCount = 0;

  public updateLineDefinitions(lines: LineCollection): void {
    this.updateLineDefinitionsCallCount++;

    this.lineNamesLowercase = [];
    for (const line of lines.data) {
      const lineNameLower = line.name.toLowerCase();
      this.lineNamesLowercase.push(lineNameLower);
      this.linesByNameLowercase[lineNameLower] = line;
    }
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

    return result.sort((lhs, rhs) => lhs.id < rhs.id ? -1 : 1);
  }
}
