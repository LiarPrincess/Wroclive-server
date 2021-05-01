import { Line } from '../../controllers';

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

export interface MPKVehicle {
  readonly id: string;
  readonly line: string;
  readonly lat: number;
  readonly lng: number;
}
