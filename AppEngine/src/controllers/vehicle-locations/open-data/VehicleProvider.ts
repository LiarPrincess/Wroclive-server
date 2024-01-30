// This dir
import { ApiType, ApiResult } from "./ApiType";
import { ErrorReporterType } from "./ErrorReporter";
// Parent dir
import { StateType, DatabaseType } from "../state";
import { LineCollection, VehicleLocationFromApi } from "../models";
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

  public async setLines(lines: LineCollection): Promise<void> {
    await this.database.setLines(lines);
  }

  public async getVehicleLocations(): Promise<VehicleLocations> {
    let vehicles: VehicleLocationFromApi[] = [];
    const response = await this.getVehicleLocationsFromApi();

    switch (response.kind) {
      case "Success":
        vehicles = response.vehicles;
        this.errorReporter.responseContainsInvalidRecords(response.invalidRecords);
        this.errorReporter.resourceIdError(response.resourceIdError);
        break;
      case "Error":
        this.errorReporter.apiError(response.error);
        this.errorReporter.resourceIdError(response.resourceIdError);
        return { kind: "ApiError" };
      default:
        this.assertUnreachable(response);
    }

    const lines = await this.database.getLines();
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

  private async getVehicleLocationsFromApi(): Promise<ApiResult> {
    // Try 2 times.
    // If the 2nd one fails -> hard fail.
    const response1 = await this.api.getVehicleLocations();
    switch (response1.kind) {
      case "Success":
        return response1;
      case "Error":
        break;
    }

    const response2 = await this.api.getVehicleLocations();
    return response2;
  }
}
