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

// Vehicle is an implementation detail, and it should not be exported outside 'vehicle-locations'
export interface Vehicle {
  readonly id: string;
  readonly line: string;
  readonly lat: number;
  readonly lng: number;
}
