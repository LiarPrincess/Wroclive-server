import { Line } from '..';

export interface VehicleLocation {
  readonly id: string;
  readonly lat: number;
  readonly lng: number;
  readonly angle: number;
}

export interface LineLocations {
  readonly line: Line;
  readonly vehicles: VehicleLocation[];
}

export interface TimestampedLineLocations {
  readonly timestamp: string;
  readonly data: LineLocations[];
}
