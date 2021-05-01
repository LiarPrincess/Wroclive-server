import { default as axios, AxiosRequestConfig } from 'axios';

import { Vehicle } from './models';
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

    try {
      const response = await axios.post(url, query, config);
      const data: any = response.data;

      if (!data) {
        throw new Error('Received empty response from mpk api.');
      }

      const vehicles = data.map((v: any) => ({
        id: v.k.toString(),
        line: v.name,
        lat: v.x,
        lng: v.y,
      }));

      return vehicles;
    } catch (error) {
      if (error.statusCode) {
        throw new Error(`Invalid response from mpk api: ${error.statusCode}.`);
      }

      throw error;
    }
  }
}
