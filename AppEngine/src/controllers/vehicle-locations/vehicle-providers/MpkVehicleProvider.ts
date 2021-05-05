import { default as axios, AxiosRequestConfig } from 'axios';

import { Vehicle } from '../models';
import { VehicleProvider } from './VehicleProvider';

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
        throw new Error(`Invalid response from mpk api: ${statusCode}.`);
      }

      throw error;
    }

    if (!responseData) {
      throw new Error('Received empty response from mpk api.');
    }

    if (!Array.isArray(responseData)) {
      throw new Error('Data received from mpk api is not an array.');
    }

    const vehicles = responseData.map(v => new Vehicle(v.k.toString(), v.name, v.x, v.y));
    return vehicles;
  }
}
