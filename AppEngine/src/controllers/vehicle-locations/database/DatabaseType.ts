import { LineCollection, Line } from "../models";

export class VehicleLocation {
  public constructor(
    public readonly lat: number,
    public readonly lng: number,
    public readonly angle: number,
    public readonly millisecondsSince1970: number
  ) {}
}

export interface VehicleIdToLocation {
  [key: string]: VehicleLocation | undefined;
}

export interface DatabaseType {
  getLines(): Promise<Line[]>;
  setLines(lines: LineCollection): Promise<void>;

  getOpenDataLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined>;
  saveOpenDataLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation): Promise<void>;

  getMpkLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined>;
  saveMpkLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation): Promise<void>;
}
