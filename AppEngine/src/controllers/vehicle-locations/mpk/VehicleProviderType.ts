import { LineDatabase } from '../helpers';
import { LineLocation } from '../models';

export type VehicleLocations =
  { kind: 'Success', lineLocations: LineLocation[] } |
  { kind: 'ApiError' } |
  { kind: 'ResponseContainsNoVehicles' } |
  { kind: 'NoVehicleHasMovedInLastFewMinutes' };

export interface VehicleProviderType {
  readonly lineDatabase: LineDatabase;
  getVehicleLocations(): Promise<VehicleLocations>;
}
