// This dir
import { ApiType, ApiResult } from "./ApiType";
import { ErrorReporterType } from "./ErrorReporter";
// Parent dir
import { StateType } from "../state";
import { DatabaseType } from "../database";
import { Line, VehicleLocationFromApi } from "../models";
import { VehicleProviderBase, VehicleLocations } from "../VehicleProviderBase";

export class VehicleProvider extends VehicleProviderBase {
  public constructor(
    private readonly api: ApiType,
    private readonly database: DatabaseType,
    private readonly state: StateType,
    private readonly errorReporter: ErrorReporterType
  ) {
    super();
  }

  public async getVehicleLocations(): Promise<VehicleLocations> {
    const lines = await this.database.getLines();
    const response = await this.getVehicleLocationsFromApi(lines);
    let vehicles: VehicleLocationFromApi[] = [];

    switch (response.kind) {
      case "Success":
        vehicles = response.vehicles;
        this.errorReporter.responseContainsInvalidRecords(response.invalidRecords);
        break;
      case "Error":
        this.errorReporter.apiError(response.error);
        return { kind: "ApiError" };
      default:
        this.assertUnreachable(response);
    }

    const result = await this.state.update(lines, vehicles);

    switch (result.kind) {
      case "Success":
        return result;
      case "ResponseContainsNoVehicles":
        this.errorReporter.responseContainsNoVehicles(response);
        return { kind: "ResponseContainsNoVehicles" };
      case "NoVehicleHasMovedInLastFewMinutes":
        this.errorReporter.noVehicleHasMovedInLastFewMinutes();
        return { kind: "NoVehicleHasMovedInLastFewMinutes" };
      default:
        this.assertUnreachable(result);
    }
  }

  private async getVehicleLocationsFromApi(lines: Line[]): Promise<ApiResult> {
    const lineNamesLowercase: string[] = [];

    for (const line of lines) {
      const nameLower = line.name.toLowerCase();
      lineNamesLowercase.push(nameLower);
    }

    // Try 2 times.
    // If the 2nd one fails -> hard fail.
    const response1 = await this.api.getVehicleLocations(lineNamesLowercase);
    switch (response1.kind) {
      case "Success":
        return response1;
      case "Error":
        break;
    }

    const response2 = await this.api.getVehicleLocations(lineNamesLowercase);
    return response2;
  }
}
