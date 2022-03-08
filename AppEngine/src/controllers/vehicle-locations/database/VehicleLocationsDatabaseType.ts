import { LineCollection, Line } from '../models';

export class VehicleLocation {
  public constructor(
    public readonly lat: number,
    public readonly lng: number,
    public readonly angle: number
  ) { }
}

export interface VehicleIdToLocation {
  [key: string]: VehicleLocation | undefined;
}

export interface VehicleLocationsDatabaseType {

  /** Get a single line by its name. */
  getLineByName(name: string): Line;
  /** Get names of all of the lines. */
  getLineNamesLowercase(): string[];
  updateLineDefinitions(lines: LineCollection): void;

  getOpenDataLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined>;
  saveOpenDataLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation): Promise<void>;

  getMpkLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined>;
  saveMpkLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation): Promise<void>;
}
