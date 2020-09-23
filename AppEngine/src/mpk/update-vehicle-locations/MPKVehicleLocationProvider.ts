import { default as axios, AxiosRequestConfig } from 'axios';

import { MPKVehicle } from '../models';
import { VehicleLocationProvider } from './VehicleLocationProvider';
import { hour, minute } from '../../util';

const resourceRefreshInterval = 15 * minute;
const staleVehicleCutoff = 3 * hour;

export class MPKVehicleLocationProvider implements VehicleLocationProvider {

  private resource: ResourceDescription | undefined;
  private resourceSetDate: Date | undefined;

  async getVehicleLocations(): Promise<MPKVehicle[]> {
    const resource = await this.getResourceDescription();

    try {
      const url = `https://www.wroclaw.pl/open-data/api/action/datastore_search`;

      const params = new URLSearchParams();
      params.append('resource_id', resource.id);
      params.append('limit', '99999'); // Required, otherwise 100
      params.append('fields', 'Nr_Boczny'); // Id
      params.append('fields', 'Nazwa_Linii'); // Line
      params.append('fields', 'Ostatnia_Pozycja_Szerokosc'); // Lat
      params.append('fields', 'Ostatnia_Pozycja_Dlugosc'); // Lng
      params.append('fields', 'Data_Aktualizacji'); // Remove stale vehicles

      const config: AxiosRequestConfig = { params };
      const response = await axios.get(url, config);

      if (response.data.error) {
        throw response.data.error;
      }

      if (!response.data.result.records) {
        throw new Error(`Response does not contain 'response.data.result.records'`);
      }

      const now = new Date();
      const result: MPKVehicle[] = [];
      for (const vehicle of response.data.result.records) {
        const id = vehicle.Nr_Boczny;
        const line = vehicle.Nazwa_Linii;
        const lat = vehicle.Ostatnia_Pozycja_Szerokosc;
        const lng = vehicle.Ostatnia_Pozycja_Dlugosc;

        if (line == 'None') {
          continue;
        }

        const dateString = vehicle.Data_Aktualizacji;
        const date = new Date(dateString);
        const dateDiff = now.getTime() - date.getTime();
        if (dateDiff > staleVehicleCutoff) {
          continue;
        }

        result.push({ id, line, lat, lng });
      }

      return result;
    } catch (error) {
      if (error.statusCode) {
        throw new Error(`Failed to get vehicle locations: ${error.statusCode}.`);
      }

      throw error;
    }
  }

  private async getResourceDescription(): Promise<ResourceDescription> {
    const now = new Date();

    if (this.resource && this.resourceSetDate) {
      const timeSinceLastUpdate = now.getTime() - this.resourceSetDate.getTime();
      if (timeSinceLastUpdate < resourceRefreshInterval) {
        return this.resource;
      }
    }

    try {
      const url = 'https://www.wroclaw.pl/open-data/dataset/lokalizacjapojazdowkomunikacjimiejskiejnatrasie_data.jsonld';
      const config: AxiosRequestConfig = {};

      const response = await axios.get(url, config);
      const result = parseResourceDescription(response.data);
      this.resource = result;
      this.resourceSetDate = now;
      return result;
    } catch (error) {
      if (error.statusCode) {
        throw new Error(`Failed to download resource description: ${error.statusCode}.`);
      }

      throw error;
    }
  }
}

/* -------------------- */
/* Resource description */
/* -------------------- */

interface ResourceDescription {
  id: string;
  title: string;
  url: string;
  issued: string;
  modified: string;
}

function parseResourceDescription(description: any): ResourceDescription {
  const graph: any[] = description['@graph'];
  const dataset: any = graph.find(node => node['@type'] === 'dcat:Dataset');
  const url = dataset['dcat:distribution']['@id'];

  const lastSlashIndex = url.lastIndexOf('/');
  if (lastSlashIndex == -1) {
    throw `Unable to obtain resource id from '${url}'`;
  }
  const id = url.slice(lastSlashIndex + 1);

  return {
    id,
    title: dataset['dct:title'],
    url,
    issued: dataset['dct:issued']['@value'],
    modified: dataset['dct:modified']['@value'],
  };
}
