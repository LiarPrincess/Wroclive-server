import { VehicleLocationFromApi } from '../models';

export type ApiResult =
  { kind: 'Success', vehicles: VehicleLocationFromApi[], invalidRecords: any[] } |
  { kind: 'Error', error: ApiError };

export class ApiError {
  constructor(
    public readonly kind: 'Network error' | 'Invalid response',
    public readonly message: string,
    public readonly data: any,
  ) { }
}

export interface ApiType {
  getVehicleLocations(lineNamesLowercase: string[]): Promise<ApiResult>;
}
