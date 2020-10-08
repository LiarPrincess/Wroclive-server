import { default as axios, AxiosRequestConfig, AxiosResponse } from 'axios';

import { VehicleLocationProvider } from './VehicleLocationProvider';
import { MPKVehicle } from '../models';
import { hour, minute } from '../../util';

/* ============== */
/* === Config === */
/* ============== */

/**
 * Cache resource id, so that we do not have to re-download it every time.
 */
export const refreshResourceIdEvery = 15 * minute;

/**
 * If the resource id refresh fails then send mail.
 * But if we did that on EVERY error then we would never update vehicle locations.
 */
export const reportResourceIdErrorInterval = 15 * minute;

/**
 * Our data source contains some very old data (think 2012, 2014 etc.).
 * We will remove those entries.
 */
export const removeVehiclesThatAreOlderThan = 10 * minute;

/* ============= */
/* === Types === */
/* ============= */

type ResourceId = string;

interface ResourceIdCache {
  id: ResourceId;
  date: Date;
}

/* ============ */
/* === Main === */
/* ============ */

export class MPKVehicleLocationProvider implements VehicleLocationProvider {

  private resourceIdCache?: ResourceIdCache;
  private resourceIdLastError?: Date;

  /* ============================= */
  /* === Get vehicle locations === */
  /* ============================= */

  async getVehicleLocations(): Promise<MPKVehicle[]> {
    const resourceCheckDate = new Date();
    const resourceId = await this.getResourceId(resourceCheckDate);

    const oldVehiclesCheckDate = new Date();
    return this.queryVehicleLocations(resourceId, oldVehiclesCheckDate);
  }

  /* =============================== */
  /* === Query vehicle locations === */
  /* =============================== */

  async queryVehicleLocations(resourceId: string, now: Date): Promise<MPKVehicle[]> {
    try {
      // https://docs.ckan.org/en/latest/api/index.html#making-an-api-request
      const url = 'https://www.wroclaw.pl/open-data/api/action/datastore_search';

      const params = new URLSearchParams();
      params.append('resource_id', resourceId);
      params.append('limit', '99999'); // Required, otherwise 100
      params.append('fields', 'Nr_Boczny'); // Part of id
      params.append('fields', 'Nazwa_Linii'); // Line
      params.append('fields', 'Ostatnia_Pozycja_Szerokosc'); // Lat
      params.append('fields', 'Ostatnia_Pozycja_Dlugosc'); // Lng
      params.append('fields', 'Data_Aktualizacji'); // Remove stale vehicles

      const config: AxiosRequestConfig = { params };
      const response = await axios.get(url, config);

      if (response.data.error) {
        throw response.data.error;
      }

      const records = response.data?.result?.records;
      if (!records) {
        throw new Error(`Response does not contain 'response.data.result.records'`);
      }

      const result: MPKVehicle[] = [];
      for (const vehicle of records) {
        // You can preview the data at:
        // https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/17308285-3977-42f7-81b7-fdd168c210a2
        const sideNumber = vehicle.Nr_Boczny;
        const line = vehicle.Nazwa_Linii;
        const lat = vehicle.Ostatnia_Pozycja_Szerokosc;
        const lng = vehicle.Ostatnia_Pozycja_Dlugosc;
        const dateString = vehicle.Data_Aktualizacji;

        if (line == 'None') {
          continue;
        }

        // We can ignore time zone, because both 'now' and 'date' are in the same time zone.
        // Note that this does not mean that it is 'Europe/Warsaw', but it should work anyway
        // (well, most of the time).
        const date = new Date(dateString);
        const dateDiff = this.subtract(now, date);
        if (dateDiff > removeVehiclesThatAreOlderThan) {
          continue;
        }

        const id = `${line}${sideNumber}`;
        result.push({ id, line, lat, lng });
      }

      return result;
    } catch (error) {
      const statusCode = error.statusCode || (error.response && error.response.status);
      if (statusCode) {
        throw new Error(`Failed to get vehicle locations: ${statusCode}.`);
      }

      throw error;
    }
  }

  /* =================== */
  /* === Resource id === */
  /* =================== */

  async getResourceId(now: Date): Promise<ResourceId> {
    if (this.resourceIdCache) {
      const timeSinceLastUpdate = this.subtract(now, this.resourceIdCache.date);
      if (timeSinceLastUpdate <= refreshResourceIdEvery) {
        return this.resourceIdCache.id;
      }
    }

    // Try to get resource id from 'wroclaw.pl/open-data'
    try {
      const url = 'https://www.wroclaw.pl/open-data/dataset/lokalizacjapojazdowkomunikacjimiejskiejnatrasie_data.jsonld';
      const config: AxiosRequestConfig = {};

      const response = await axios.get(url, config);
      const id = this.getResourceIdFromResponse(response);

      if (id) {
        this.resourceIdCache = { id, date: now };
        return id;
      }
    } catch (error) {
      const lastErrorDate = this.resourceIdLastError || new Date(2000, 1, 1);
      const timeSinceLastError = now.getTime() - lastErrorDate.getTime();

      if (timeSinceLastError > reportResourceIdErrorInterval) {
        this.resourceIdLastError = now;
        throw new Error(`Failed to download resource description: ${error}`);
      }
    }

    // Response does not contain Id!
    // Try to re-use cached one.
    if (this.resourceIdCache) {
      return this.resourceIdCache.id;
    }

    // Use hard-coded one.
    // Let's hope that it has not changed!
    return '17308285-3977-42f7-81b7-fdd168c210a2';
  }

  private getResourceIdFromResponse(response: AxiosResponse<any>): ResourceId | undefined {
    const data = response.data;
    const graph: any[] = data['@graph'];

    // Try: [@graph][dcat:Dataset][dcat:distribution][@id]
    try {
      const dataset: any = graph.find(node => node['@type'] === 'dcat:Dataset');
      const url = dataset['dcat:distribution']['@id'];
      const id = this.getSuffixAfterLastSlash(url);

      if (id) {
        return id;
      }
    } catch (error) {
      // Ignore
    }

    // Try: [@graph][dcat:Distribution][dcat:accessURL][@id]
    try {
      const distribution: any = graph.find(node => node['@type'] === 'dcat:Distribution');
      const url = distribution['dcat:accessURL']['@id'];
      const id = this.getSuffixAfterLastSlash(url);

      if (id) {
        return id;
      }
    } catch (error) {
      // Ignore
    }

    // Try: [@graph][dcat:Distribution][@id]
    try {
      const distribution: any = graph.find(node => node['@type'] === 'dcat:Distribution');
      const url = distribution['@id'];
      const id = this.getSuffixAfterLastSlash(url);

      if (id) {
        return id;
      }
    } catch (error) {
      // Ignore
    }

    return undefined;
  }

  /* =============== */
  /* === Helpers === */
  /* =============== */

  /**
   * Returns difference in milliseconds.
   */
  private subtract(lhs: Date, rhs: Date): number {
    const lhsMilliseconds = lhs.getTime();
    const rhsMilliseconds = rhs.getTime();
    return lhsMilliseconds - rhsMilliseconds;
  }

/**
 * Look for the last '/' in the string and return the part after it.
 */
  private getSuffixAfterLastSlash(url: string): string | undefined {
    const lastSlashIndex = url.lastIndexOf('/');

    if (lastSlashIndex == -1) {
      return undefined;
    }

    return url.slice(lastSlashIndex + 1);
  }
}
