import { default as axios, AxiosRequestConfig, AxiosResponse } from 'axios';

import { Vehicle } from '../models';
import { subtractMilliseconds } from '../math';
import { VehicleProvider } from './VehicleProvider';

/* ============== */
/* === Config === */
/* ============== */

const second = 1000;
const minute = 60 * second;

export const ResourceIdRefresh = {
  /**
   * Cache resource id, so that we do not have to re-download it every time.
   */
  cacheDuration: 15 * minute,
  /**
   * If the refresh fails then report error.
   * But if we did that on EVERY error then we would never actually get to
   * update vehicle locations.
   */
  reportErrorInterval: 15 * minute
};

/**
 * Our data source contains some very old entries (think 2012, 2014 etc.).
 * We will remove them.
 */
export const RemoveOldVehicles = {
  maxTimeSinceLastUpdate: 10 * minute
};

/* ============= */
/* === Types === */
/* ============= */

type ResourceId = string;

interface ResourceIdCache {
  readonly id: ResourceId;
  readonly date: Date;
}

class OpenDataVehicleProviderError extends Error {

  innerError: any | undefined;

  constructor(message: string, innerError?: any) {
    super('[OpenDataVehicleProvider] ' + message);
    this.innerError = innerError;
  }
}

/* ============ */
/* === Main === */
/* ============ */

export class OpenDataVehicleProvider implements VehicleProvider {

  private resourceIdCache?: ResourceIdCache;
  private resourceIdLastError?: Date;

  /* ============================= */
  /* === Get vehicle locations === */
  /* ============================= */

  async getVehicles(lineNames: string[]): Promise<Vehicle[]> {
    const resourceCheckDate = new Date();
    const resourceId = await this.getResourceId(resourceCheckDate);

    const oldVehiclesCheckDate = new Date();
    return this.queryVehicleLocations(resourceId, oldVehiclesCheckDate);
  }

  /* =============================== */
  /* === Query vehicle locations === */
  /* =============================== */

  async queryVehicleLocations(resourceId: string, now: Date): Promise<Vehicle[]> {
    let responseData: any;
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
      responseData = response.data;
    } catch (error) {
      const statusCode = error.statusCode || (error.response && error.response.status);
      if (statusCode) {
        throw new OpenDataVehicleProviderError(`Response with status: ${statusCode}.`);
      }

      throw new OpenDataVehicleProviderError("Unknown request error (see 'innerError' for details).", error);
    }

    if (responseData.error) {
      throw new OpenDataVehicleProviderError("Response contains error (see 'innerError' for details).", responseData.error);
    }

    const records = responseData?.result?.records;
    if (!records) {
      throw new OpenDataVehicleProviderError(`Response does not contain any records.`);
    }

    const result: Vehicle[] = [];
    for (const record of records) {
      try {
        // You can preview the data at:
        // https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/17308285-3977-42f7-81b7-fdd168c210a2
        const sideNumber: string = record.Nr_Boczny;
        const line: string = record.Nazwa_Linii;
        const lat: number = record.Ostatnia_Pozycja_Szerokosc;
        const lng: number = record.Ostatnia_Pozycja_Dlugosc;
        const dateString: string = record.Data_Aktualizacji;

        if (line == 'None') {
          continue;
        }

        // We can ignore time zone, because both 'now' and 'date' are in the same time zone.
        // Note that this does not mean that it is 'Europe/Warsaw', but it should work anyway
        // (well, most of the time).
        const date = new Date(dateString);
        const timeSinceUpdate = subtractMilliseconds(now, date);
        if (timeSinceUpdate > RemoveOldVehicles.maxTimeSinceLastUpdate) {
          continue;
        }

        const id = `${line}${sideNumber}`;
        result.push(new Vehicle(id, line, lat, lng));
      } catch (error) {
        throw new OpenDataVehicleProviderError("Response contains invalid record (see 'innerError' for details).", { indalidRecord: record });
      }
    }

    return result;
  }

  /* =================== */
  /* === Resource id === */
  /* =================== */

  async getResourceId(now: Date): Promise<ResourceId> {
    if (this.resourceIdCache) {
      // Ignore DST and other nonsense.
      const timeSinceLastUpdate = subtractMilliseconds(now, this.resourceIdCache.date);
      if (timeSinceLastUpdate <= ResourceIdRefresh.cacheDuration) {
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

      if (timeSinceLastError > ResourceIdRefresh.reportErrorInterval) {
        this.resourceIdLastError = now;
        const statusCode = error.statusCode || (error.response && error.response.status);
        if (statusCode) {
          throw new OpenDataVehicleProviderError(`Resource id response with status: ${statusCode}.`);
        }

        throw new OpenDataVehicleProviderError("Unknown resource id request error (see 'innerError' for details).", error);
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
