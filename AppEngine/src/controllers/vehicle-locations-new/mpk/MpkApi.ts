import { default as axios, AxiosRequestConfig } from 'axios';

import { ApiBase } from '../ApiBase';
import { LineDatabase } from '../helpers';
import { VehicleLocationFromApi } from '../models';

export type GetVehicleLocationsResult =
  { kind: 'Success', vehicles: VehicleLocationFromApi[], invalidRecords: any[] } |
  { kind: 'Error', error: GetVehicleLocationsError };

export class GetVehicleLocationsError {
  constructor(
    public readonly kind: 'Network error' | 'Invalid response',
    public readonly message: string,
    public readonly data: any,
  ) { }
}

export class MpkApi extends ApiBase {

  private readonly lineDatabase: LineDatabase;

  constructor(lineDatabase: LineDatabase) {
    super();
    this.lineDatabase = lineDatabase;
  }

  async getVehicleLocations(): Promise<GetVehicleLocationsResult> {
    const url = 'https://mpk.wroc.pl/bus_position';
    const query = this.createQuery();

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
      }
    };

    let responseData: any;
    try {
      const response = await axios.post(url, query, config);
      responseData = response.data;
    } catch (error) {
      const statusCode = this.getStatusCode(error);
      const message = statusCode ?
        `Response with status: ${statusCode}.` :
        `Unknown request error.`;

      const e = new GetVehicleLocationsError('Network error', message, error);
      return { kind: 'Error', error: e };
    }

    if (!responseData) {
      const error = new GetVehicleLocationsError(
        'Invalid response',
        'Response does not contain any data.',
        {}
      );
      return { kind: 'Error', error };
    }

    if (!Array.isArray(responseData)) {
      const error = new GetVehicleLocationsError(
        'Invalid response',
        'Response data is not an array.',
        responseData
      );
      return { kind: 'Error', error };
    }

    const result: VehicleLocationFromApi[] = [];
    const invalidRecords: any[] = [];

    for (const v of responseData) {
      const nonUniqueId: number = v.k;
      const lineName: string = v.name;
      const lat: number = v.x;
      const lng: number = v.y;

      const isValid = this.isString(lineName)
        && this.isNumber(lat)
        && this.isNumber(lng);

      if (isValid) {
        const id = lineName + nonUniqueId.toString();
        const vehicle = new VehicleLocationFromApi(id, v.name, v.x, v.y);
        result.push(vehicle);
      } else {
        invalidRecords.push(v);
      }
    }

    return { kind: 'Success', vehicles: result, invalidRecords };
  }

  private createQuery(): string {
    let result = '';

    const lineNames = this.lineDatabase.getLineNamesLowercase();
    for (let index = 0; index < lineNames.length; index++) {
      if (index > 0) {
        result += '&';
      }

      const lineNameLower = lineNames[index];
      result += `busList[bus][]=`;
      result += lineNameLower;
    }

    return result;
  }

  private getStatusCode(error: any): string | undefined {
    return error.statusCode || (error.response && error.response.status);
  }
}
