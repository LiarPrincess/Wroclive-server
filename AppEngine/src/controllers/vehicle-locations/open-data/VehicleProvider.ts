// This dir
import { ApiType, ApiResult } from "./ApiType";
import { AngleCalculator } from "./AngleCalculator";
import { ErrorReporterType } from "./ErrorReporter";
// Parent dir
import { DatabaseType } from "../database";
import { LineLocationsAggregator } from "../helpers";
import { VehicleLocation, VehicleLocationFromApi } from "../models";
import { VehicleClassifierType, VehicleClassifier } from "../vehicle-classification";
import { VehicleProviderBase, VehicleLocations } from "../vehicle-provider";

/**
 * Open data is designed as a PRIMARY data source.
 * We are more strict on what we show.
 */
export class VehicleProvider extends VehicleProviderBase {
  private readonly api: ApiType;
  private readonly database: DatabaseType;
  private readonly angleCalculator: AngleCalculator;
  private readonly errorReporter: ErrorReporterType;
  private readonly vehicleClassifier: VehicleClassifierType;

  public constructor(
    api: ApiType,
    database: DatabaseType,
    errorReporter: ErrorReporterType,
    vehicleClassifier?: VehicleClassifierType
  ) {
    super();

    this.api = api;
    this.database = database;
    this.errorReporter = errorReporter;
    this.vehicleClassifier = vehicleClassifier || new VehicleClassifier();
    this.angleCalculator = new AngleCalculator(database);
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
    }

    if (!vehicles.length) {
      this.errorReporter.responseContainsNoVehicles(response);
      return { kind: "ResponseContainsNoVehicles" };
    }

    const lineLocationsAggregator = new LineLocationsAggregator();

    // Check if any of the vehicles has moved the last few minutes.
    // It may be possible that api hangs (returns the same data over and over).
    let hasAnyVehicleMovedInLastFewMinutes = false;

    this.angleCalculator.prepareForAngleCalculation();
    this.vehicleClassifier.prepareForClassification();
    for (const vehicle of vehicles) {
      const lineName = vehicle.line;
      const line = this.database.getLineByName(lineName);

      const { isInDepot, isWithinScheduleTimeFrame, hasMovedInLastFewMinutes } = this.vehicleClassifier.classify(
        line,
        vehicle
      );

      hasAnyVehicleMovedInLastFewMinutes = hasAnyVehicleMovedInLastFewMinutes || hasMovedInLastFewMinutes;

      const isVisible = !isInDepot && isWithinScheduleTimeFrame;
      if (isVisible) {
        const angle = await this.angleCalculator.calculateAngle(vehicle);
        const vehicleLocation = new VehicleLocation(vehicle.id, vehicle.lat, vehicle.lng, angle);
        lineLocationsAggregator.addVehicle(line, vehicleLocation);
      }
    }

    if (!hasAnyVehicleMovedInLastFewMinutes) {
      this.errorReporter.noVehicleHasMovedInLastFewMinutes();
      return { kind: "NoVehicleHasMovedInLastFewMinutes" };
    }

    const lineLocations = lineLocationsAggregator.getLineLocations();
    await this.angleCalculator.storeLastVehicleAngleUpdateLocationInDatabase();
    return { kind: "Success", lineLocations };
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
