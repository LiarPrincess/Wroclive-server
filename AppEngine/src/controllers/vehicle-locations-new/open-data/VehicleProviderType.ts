import { LineLocationsCollection } from '../models';

export type GetVehicleLocationsResult =
  { kind: 'Success', lineLocations: LineLocationsCollection } |
  { kind: 'ApiError' } |
  { kind: 'ResponseContainsNoVehicles' } |
  { kind: 'NoVehicleHasMovedInLastFewMinutes' };

export interface VehicleProviderType {
  getVehicleLocations(): Promise<GetVehicleLocationsResult>;
}
