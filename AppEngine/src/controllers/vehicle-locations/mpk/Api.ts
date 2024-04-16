import { Agent as HttpsAgent } from "https";
import { default as axios, AxiosRequestConfig } from "axios";

import { ApiBase } from "../ApiBase";
import { VehicleLocationFromApi } from "../models";
import { ApiType, ApiResult, ApiError } from "./ApiType";

export class Api extends ApiBase implements ApiType {
  async getVehicleLocations(lineNamesLowercase: string[]): Promise<ApiResult> {
    const url = "https://mpk.wroc.pl/bus_position";
    const query = this.createQuery(lineNamesLowercase);

    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json, text/javascript, */*; q=0.01",
      },
      httpsAgent: new HttpsAgent({
        rejectUnauthorized: false,
      }),
    };

    let responseData: any;
    try {
      const response = await axios.post(url, query, config);
      responseData = response.data;
    } catch (error) {
      const statusCode = this.getStatusCode(error);
      const message = statusCode ? `Response with status: ${statusCode}.` : `Unknown request error.`;

      const e = new ApiError("Network error", message, error);
      return { kind: "Error", error: e };
    }

    if (!Array.isArray(responseData)) {
      const error = new ApiError("Invalid response", "Response data is not an array.", responseData);
      return { kind: "Error", error };
    }

    const result: VehicleLocationFromApi[] = [];
    const invalidRecords: any[] = [];

    for (const v of responseData) {
      const nonUniqueId: number = v.k;
      const lineName: string = v.name;
      const lat: number = v.x;
      const lng: number = v.y;

      const isValid = this.isString(lineName) && this.isNumber(lat) && this.isNumber(lng);

      if (isValid) {
        const id = lineName + nonUniqueId.toString();
        const vehicle = new VehicleLocationFromApi(id, v.name, v.x, v.y);
        result.push(vehicle);
      } else {
        invalidRecords.push(v);
      }
    }

    return { kind: "Success", vehicles: result, invalidRecords };
  }

  private createQuery(lineNamesLowercase: string[]): string {
    let result = "";

    for (let index = 0; index < lineNamesLowercase.length; index++) {
      if (index > 0) {
        result += "&";
      }

      const lineNameLower = lineNamesLowercase[index];
      result += `busList[bus][]=`;
      result += lineNameLower;
    }

    return result;
  }

  private getStatusCode(error: any): string | undefined {
    return error.statusCode || (error.response && error.response.status);
  }
}
