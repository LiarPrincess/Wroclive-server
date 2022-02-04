import { VehicleLocationFromApi } from '../models';

export type ApiResult =
  {
    kind: 'Success',
    vehicles: VehicleLocationFromApi[],
    invalidRecords: any[]
    resourceIdError: ResourceIdError | undefined
  } |
  {
    kind: 'Error',
    error: VehicleLocationsError,
    resourceIdError: ResourceIdError | undefined
  };

export class VehicleLocationsError {
  constructor(
    public readonly kind: 'Network error' | 'Response with error' | 'No records' | 'All records invalid',
    public readonly message: string,
    public readonly data: any
  ) { }
}

export class ResourceIdError {
  constructor(
    public readonly kind: 'Response without Id' | 'Network error',
    public readonly message: string,
    public readonly errorData: any
  ) { }
}

export interface ApiType {
  getVehicleLocations(): Promise<ApiResult>;
}
