import { LineLocations } from '../models';

export type GetVehicleLocationsResult =
  { kind: 'Success', lineLocations: LineLocations[] } |
  { kind: 'ApiError' } |
  { kind: 'ResponseContainsNoVehicles' } |
  { kind: 'NoVehicleHasMovedInLastFewMinutes' };

export interface VehicleProviderType {
  getVehicleLocations(): Promise<GetVehicleLocationsResult>;
}
