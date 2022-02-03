import {
  LineLocationsCollection,
  VehicleLocation,
  VehicleLocationFromApi
} from '../models';
import {
  AngleCalculator,
  LineDatabase,
  LineLocationsAggregator
} from '../helpers';
import { ApiType, ApiResult } from './interfaces';
import { OpenDataErrorReporterType } from './OpenDataErrorReporter';
import { VehicleProviderBase, DateProvider } from '../VehicleProviderBase';
import { VehicleClassifierType, VehicleClassifier } from '../vehicle-classification';

export type GetVehicleLocationsResult =
  { kind: 'Success', lineLocations: LineLocationsCollection } |
  { kind: 'ApiError' } |
  { kind: 'ResponseContainsNoVehicles' } |
  { kind: 'NoVehicleHasMovedInLastFewMinutes' };

/**
 * Open data is designed as a PRIMARY data source.
 * We are more strict on what we show.
 */
export class OpenDataVehicleProvider extends VehicleProviderBase {

  private readonly api: ApiType;
  private readonly lineDatabase: LineDatabase;
  private readonly angleCalculator: AngleCalculator;
  private readonly errorReporter: OpenDataErrorReporterType;
  private readonly vehicleClassifier: VehicleClassifierType;

  constructor(
    api: ApiType,
    lineDatabase: LineDatabase,
    errorReporter: OpenDataErrorReporterType,
    vehicleClassifier?: VehicleClassifierType,
    dateProvider?: DateProvider
  ) {
    super(dateProvider);
    this.api = api;
    this.lineDatabase = lineDatabase;
    this.errorReporter = errorReporter;
    this.vehicleClassifier = vehicleClassifier || new VehicleClassifier();
    this.angleCalculator = new AngleCalculator();
  }

  async getVehicleLocations(): Promise<GetVehicleLocationsResult> {
    let vehicles: VehicleLocationFromApi[] = [];

    const response = await this.getVehicleLocationsFromApi();
    switch (response.kind) {
      case 'Success':
        vehicles = response.vehicles;
        this.errorReporter.responseContainsInvalidRecords(response.invalidRecords);
        this.errorReporter.resourceIdError(response.resourceIdError);
        break;
      case 'Error':
        this.errorReporter.apiError(response.error);
        this.errorReporter.resourceIdError(response.resourceIdError);
        return { kind: 'ApiError' };
    }

    if (!vehicles.length) {
      this.errorReporter.responseContainsNoVehicles(response);
      return { kind: 'ResponseContainsNoVehicles' };
    }

    const lineLocationsAggregator = new LineLocationsAggregator();

    // Check if any of the vehicles has moved the last few minutes.
    // It may be possible that api hangs (returns the same data over and over).
    let hasAnyVehicleMovedInLastFewMinutes = false;

    this.vehicleClassifier.prepareForClassification();
    for (const vehicle of vehicles) {
      const lineName = vehicle.line;
      const line = this.lineDatabase.getLineByName(lineName);

      const {
        isInDepot,
        isWithinScheduleTimeFrame,
        hasMovedInLastFewMinutes
      } = this.vehicleClassifier.classify(line, vehicle);

      hasAnyVehicleMovedInLastFewMinutes = hasAnyVehicleMovedInLastFewMinutes || hasMovedInLastFewMinutes;

      const isVisible = !isInDepot && isWithinScheduleTimeFrame;
      if (isVisible) {
        const angle = this.angleCalculator.calculateAngle(vehicle);
        const vehicleLocation = new VehicleLocation(vehicle.id, vehicle.lat, vehicle.lng, angle);
        lineLocationsAggregator.addVehicle(line, vehicleLocation);
      }
    }

    if (!hasAnyVehicleMovedInLastFewMinutes) {
      this.errorReporter.noVehicleHasMovedInLastFewMinutes();
      return { kind: 'NoVehicleHasMovedInLastFewMinutes' };
    }

    const result = this.createLineLocationsCollection(lineLocationsAggregator);
    return { kind: 'Success', lineLocations: result };
  }

  private async getVehicleLocationsFromApi(): Promise<ApiResult> {
    // Try 2 times.
    // If the 2nd one fails -> hard fail.
    const response1 = await this.api.getVehicleLocations();
    switch (response1.kind) {
      case 'Success':
        return response1;
      case 'Error':
        break;
    }

    const response2 = await this.api.getVehicleLocations();
    return response2;
  }
}
