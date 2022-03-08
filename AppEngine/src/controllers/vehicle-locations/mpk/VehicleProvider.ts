// This dir
import { ApiType, ApiResult } from './ApiType';
import { VehicleProviderType, VehicleLocations } from './VehicleProviderType';
import { ErrorReporterType } from './ErrorReporter';
// Parent dir
import { VehicleLocationsDatabaseType } from '../database';
import { VehicleLocation, VehicleLocationFromApi } from '../models';
import { AngleCalculator, LineLocationsAggregator } from '../helpers';
import { HasMovedInLastFewMinutesClassifier, HasMovedInLastFewMinutesClassifierType } from '../vehicle-classification';

/**
 * Mpk is designed as a SECONDARY data source.
 * We are more lenient on what we show.
 */
export class VehicleProvider implements VehicleProviderType {

  private readonly api: ApiType;
  public readonly database: VehicleLocationsDatabaseType;
  private readonly angleCalculator: AngleCalculator;
  private readonly errorReporter: ErrorReporterType;
  private readonly hasMovedInLastFewMinutesClassifier: HasMovedInLastFewMinutesClassifierType;

  constructor(
    api: ApiType,
    database: VehicleLocationsDatabaseType,
    errorReporter: ErrorReporterType,
    hasMovedInLastFewMinutesClassifier?: HasMovedInLastFewMinutesClassifierType
  ) {
    this.api = api;
    this.database = database;
    this.errorReporter = errorReporter;
    this.angleCalculator = new AngleCalculator();
    this.hasMovedInLastFewMinutesClassifier = hasMovedInLastFewMinutesClassifier || new HasMovedInLastFewMinutesClassifier();
  }

  async getVehicleLocations(): Promise<VehicleLocations> {
    let vehicles: VehicleLocationFromApi[] = [];

    const response = await this.getVehicleLocationsFromApi();
    switch (response.kind) {
      case 'Success':
        vehicles = response.vehicles;
        this.errorReporter.responseContainsInvalidRecords(response.invalidRecords);
        break;
      case 'Error':
        this.errorReporter.apiError(response.error);
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

    this.hasMovedInLastFewMinutesClassifier.prepareForClassification();
    for (const vehicle of vehicles) {
      const lineName = vehicle.line;
      const line = this.database.getLineByName(lineName);

      // Note that we still want to show this vehicle.
      // Maybe a tram broke in the middle of Powstancow and all of the other
      // wait int line.
      const hasMoved = this.hasMovedInLastFewMinutesClassifier.hasMovedInLastFewMinutes(vehicle);
      hasAnyVehicleMovedInLastFewMinutes = hasAnyVehicleMovedInLastFewMinutes || hasMoved;

      // Technically we should reset 'angleCalculator' if the mpk provider was
      // not used in a while (like 30 min etc.).
      const angle = this.angleCalculator.calculateAngle(vehicle);
      const vehicleLocation = new VehicleLocation(vehicle.id, vehicle.lat, vehicle.lng, angle);
      lineLocationsAggregator.addVehicle(line, vehicleLocation);
    }

    if (!hasAnyVehicleMovedInLastFewMinutes) {
      this.errorReporter.noVehicleHasMovedInLastFewMinutes();
      return { kind: 'NoVehicleHasMovedInLastFewMinutes' };
    }

    const lineLocations = lineLocationsAggregator.getLineLocations();
    return { kind: 'Success', lineLocations };
  }

  private async getVehicleLocationsFromApi(): Promise<ApiResult> {
    const lineNamesLowercase = this.database.getLineNamesLowercase();

    // Try 2 times.
    // If the 2nd one fails -> hard fail.
    const response1 = await this.api.getVehicleLocations(lineNamesLowercase);
    switch (response1.kind) {
      case 'Success':
        return response1;
      case 'Error':
        break;
    }

    const response2 = await this.api.getVehicleLocations(lineNamesLowercase);
    return response2;
  }
}
