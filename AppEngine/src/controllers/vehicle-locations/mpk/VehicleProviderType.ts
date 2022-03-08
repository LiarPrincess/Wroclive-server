import { LineLocation } from '../models';

export type VehicleLocations =
  { kind: 'Success', lineLocations: LineLocation[] } |
  { kind: 'ApiError' } |
  { kind: 'ResponseContainsNoVehicles' } |
  { kind: 'NoVehicleHasMovedInLastFewMinutes' };

export interface VehicleProviderType {
  getVehicleLocations(): Promise<VehicleLocations>;
}
