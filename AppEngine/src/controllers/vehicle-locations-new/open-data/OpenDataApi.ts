import { default as axios, AxiosRequestConfig, AxiosResponse } from 'axios';

import {
  ApiType,
  ApiResult,
  VehicleLocationsError,
  ResourceIdError
} from './interfaces';
import { ApiBase } from '../ApiBase';
import { subtractMilliseconds } from '../math';
import { VehicleLocationFromApi } from '../models';

/* ============== */
/* === Config === */
/* ============== */

const second = 1000;
const minute = 60 * second;

/**
 * Cache resource id, so that we do not have to re-download it every time.
 */
export const ResourceIdRefreshInterval = 15 * minute;

/**
 * Our data source contains some very old entries (think 2012, 2014 etc.).
 * We will remove them.
 */
export const RemoveVehiclesOlderThan = 10 * minute;

/* ============= */
/* === Types === */
/* ============= */

type ResourceId = string;

interface ResourceIdCache {
  readonly id: ResourceId;
  readonly date: Date;
}

/**
 * We will ALWAYS return 'resourceId'.
 * Sometimes the obsolete one, sometimes the hard-coded one. But it will be there.
 */
class ResourceIdResult {
  constructor(
    public readonly resourceId: ResourceId,
    public readonly error: ResourceIdError | undefined,
  ) { }
}

type QueryVehicleLocationsResult =
  { kind: 'Success', vehicles: VehicleLocationFromApi[], invalidRecords: any[] } |
  { kind: 'Error', error: VehicleLocationsError };

/* ============ */
/* === Main === */
/* ============ */

export class OpenDataApi extends ApiBase implements ApiType {

  private resourceIdCache?: ResourceIdCache;

  /* ============================= */
  /* === Get vehicle locations === */
  /* ============================= */

  async getVehicleLocations(): Promise<ApiResult> {
    const resourceCheckDate = new Date();
    const resourceResult = await this.getResourceId(resourceCheckDate);
    const resourceId = resourceResult.resourceId;
    const resourceErrorIfAny = resourceResult.error;

    const oldVehiclesCheckDate = new Date();
    const queryResult = await this.queryVehicleLocations(resourceId, oldVehiclesCheckDate);

    switch (queryResult.kind) {
      case 'Success':
        return {
          kind: 'Success',
          vehicles: queryResult.vehicles,
          invalidRecords: queryResult.invalidRecords,
          resourceIdError: resourceErrorIfAny
        };

      case 'Error':
        return {
          kind: 'Error',
          error: queryResult.error,
          resourceIdError: resourceErrorIfAny
        };
    }
  }

  /* =============================== */
  /* === Query vehicle locations === */
  /* =============================== */

  async queryVehicleLocations(
    resourceId: string,
    now: Date
  ): Promise<QueryVehicleLocationsResult> {
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
    } catch (responseError) {
      const statusCode = this.getStatusCode(responseError);
      const message = statusCode ?
        `Response with status: ${statusCode}.` :
        `Unknown request error.`;

      const error = new VehicleLocationsError('Network error', message, responseError);
      return { kind: 'Error', error };
    }

    if (responseData.error) {
      const error = new VehicleLocationsError(
        'Response with error',
        'Response contains error field.',
        responseData
      );

      return { kind: 'Error', error };
    }

    const records = responseData?.result?.records;
    if (!records) {
      const error = new VehicleLocationsError(
        'No records',
        'Response does not contain any records.',
        responseData
      );

      return { kind: 'Error', error };
    }

    const result: VehicleLocationFromApi[] = [];
    const invalidRecords: any[] = [];
    for (const record of records) {
      // You can preview the data at:
      // https://www.wroclaw.pl/open-data/dataset/93f26958-c0f3-4b27-a153-619e26080442/resource/17308285-3977-42f7-81b7-fdd168c210a2
      const sideNumber: string = record.Nr_Boczny;
      const line: string = record.Nazwa_Linii;
      const lat: number = record.Ostatnia_Pozycja_Szerokosc;
      const lng: number = record.Ostatnia_Pozycja_Dlugosc;
      const date = this.parseDate(record.Data_Aktualizacji);

      const isValid = this.isString(sideNumber)
        && this.isString(line)
        && this.isNumber(lat)
        && this.isNumber(lng)
        && date !== undefined;

      if (!isValid) {
        invalidRecords.push(record);
        continue;
      }

      // Some records are permanently invalid, which means that they are always there,
      // but do not represent the valid vehicle.
      if (line === 'None') {
        continue;
      }

      // We can ignore time zone, because both 'now' and 'date' are in the same time zone.
      // Note that this does not mean that it is 'Europe/Warsaw', but it should work anyway.
      const timeSinceUpdate = subtractMilliseconds(now, (date as Date));
      if (timeSinceUpdate > RemoveVehiclesOlderThan) {
        continue;
      }

      const id = line.concat(sideNumber);
      result.push(new VehicleLocationFromApi(id, line, lat, lng));
    }

    if (!result.length) {
      const error = new VehicleLocationsError(
        'All records invalid',
        'Response contains records, but all of them are invalid.',
        responseData
      );

      return { kind: 'Error', error };
    }

    return { kind: 'Success', vehicles: result, invalidRecords };
  }

  private getStatusCode(error: any): string | undefined {
    return error.statusCode || (error.response && error.response.status);
  }

  /* =================== */
  /* === Resource id === */
  /* =================== */

  async getResourceId(now: Date): Promise<ResourceIdResult> {
    // If everything failed then we will still try to return some id.
    // For now let's use hard-coded one and hope that it has not changed!
    let resourceIdOnError = '17308285-3977-42f7-81b7-fdd168c210a2';

    if (this.resourceIdCache) {
      // Ignore DST and other nonsense.
      const timeSinceLastUpdate = subtractMilliseconds(now, this.resourceIdCache.date);
      if (timeSinceLastUpdate <= ResourceIdRefreshInterval) {
        const id = this.resourceIdCache.id;
        return new ResourceIdResult(id, undefined);
      }

      // We can't use the cached id.
      // But if everything else fails this would be our best option.
      resourceIdOnError = this.resourceIdCache.id;
    }

    // Try to get resource id from 'wroclaw.pl/open-data'
    try {
      const url = 'https://www.wroclaw.pl/open-data/dataset/lokalizacjapojazdowkomunikacjimiejskiejnatrasie_data.jsonld';
      const config: AxiosRequestConfig = {};

      const response = await axios.get(url, config);
      const id = this.getResourceIdFromResponse(response);

      if (id) {
        this.resourceIdCache = { id, date: now };
        return new ResourceIdResult(id, undefined);
      }

      const resourceError = new ResourceIdError(
        'Response without Id',
        'Unable to get resource id from response',
        response.data
      );

      return new ResourceIdResult(resourceIdOnError, resourceError);
    } catch (error) {
      const statusCode = this.getStatusCode(error);
      const message = statusCode ?
        `Resource id response with status: ${statusCode}.` :
        `Unknown resource id request error.`;

      const resourceError = new ResourceIdError('Network error', message, error);
      return new ResourceIdResult(resourceIdOnError, resourceError);
    }
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
