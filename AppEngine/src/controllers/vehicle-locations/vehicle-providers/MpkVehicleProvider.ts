import { default as axios, AxiosRequestConfig } from 'axios';

import { Vehicle } from '../models';
import { VehicleProvider } from './VehicleProvider';

class MpkVehicleProviderError extends Error {

  innerError: any | undefined;

  constructor(message: string, innerError?: any) {
    super('[MpkVehicleProvider] ' + message);
    this.innerError = innerError;
  }
}

export class MpkVehicleProvider implements VehicleProvider {

  async getVehicles(lineNames: string[]): Promise<Vehicle[]> {
    const url = 'https://mpk.wroc.pl/bus_position';
    const query = lineNames.map(l => `busList[bus][]=${l.toLowerCase()}`).join('&');
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
      const statusCode = error.statusCode || (error.response && error.response.status);
      if (statusCode) {
        throw new MpkVehicleProviderError(`Response with status: ${statusCode}.`);
      }

      throw new MpkVehicleProviderError("Unknown request error (see 'innerError' for details).", error);
    }

    if (!responseData) {
      throw new MpkVehicleProviderError('Response is empty.');
    }

    if (!Array.isArray(responseData)) {
      throw new MpkVehicleProviderError('Response data is not an array.');
    }

    const vehicles = responseData.map(v => {
      const id = v.name + v.k.toString();
      return new Vehicle(id, v.name, v.x, v.y);
    });

    return vehicles;
  }
}
