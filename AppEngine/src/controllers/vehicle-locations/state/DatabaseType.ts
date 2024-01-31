import { LineCollection, Line } from "../models";

export class AngleData {
  public constructor(
    public readonly lat: number,
    public readonly lng: number,
    public readonly angle: number,
    public readonly millisecondsSince1970: number
  ) {}
}

export interface VehicleIdToAngleData {
  [key: string]: AngleData | undefined;
}

export interface DatabaseType {
  getLines(): Promise<Line[]>;
  setLines(lines: LineCollection): Promise<void>;

  getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToAngleData | undefined>;
  saveLastVehicleAngleUpdateLocations(data: VehicleIdToAngleData): Promise<void>;
}
