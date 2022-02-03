import {
  LineLocationsCollection,
  VehicleLocation,
  VehicleLocationFromApi,
} from '../models';
import {
  AngleCalculator,
  LineDatabase,
  LineLocationsAggregator
} from '../helpers';
import {
  HasMovedInLastFewMinutesClassifier,
  HasMovedInLastFewMinutesClassifierType
} from '../vehicle-classification';
import { ApiType, ApiResult } from './interfaces';
import { MpkErrorReporterType } from './MpkErrorReporter';
import { VehicleProviderBase, DateProvider } from '../VehicleProviderBase';

export type GetVehicleLocationsResult =
  { kind: 'Success', lineLocations: LineLocationsCollection } |
  { kind: 'Error' };

/**
 * Mpk is designed as a SECONDARY data source.
 * We are more lenient on what we show.
 */
export class MpkVehicleProvider extends VehicleProviderBase {

  private readonly api: ApiType;
  private readonly lineDatabase: LineDatabase;
  private readonly angleCalculator: AngleCalculator;
  private readonly errorReporter: MpkErrorReporterType;
  private readonly hasMovedInLastFewMinutesClassifier: HasMovedInLastFewMinutesClassifierType;

  constructor(
    api: ApiType,
    lineDatabase: LineDatabase,
    errorReporter: MpkErrorReporterType,
    hasMovedInLastFewMinutesClassifier?: HasMovedInLastFewMinutesClassifierType,
    dateProvider?: DateProvider
  ) {
    super(dateProvider);
    this.api = api;
    this.lineDatabase = lineDatabase;
    this.errorReporter = errorReporter;
    this.angleCalculator = new AngleCalculator();
    this.hasMovedInLastFewMinutesClassifier = hasMovedInLastFewMinutesClassifier || new HasMovedInLastFewMinutesClassifier();
  }

  async getVehicleLocations(): Promise<GetVehicleLocationsResult> {
    let vehicles: VehicleLocationFromApi[] = [];

    const response = await this.getVehicleLocationsFromApi();
    switch (response.kind) {
      case 'Success':
        vehicles = response.vehicles;
        this.errorReporter.reportResponseContainsInvalidRecords(response.invalidRecords);
        break;
      case 'Error':
        this.errorReporter.reportApiError(response.error);
        return { kind: 'Error' };
    }

    if (!vehicles.length) {
      this.errorReporter.reportResponseContainsNoVehicles(response);
      return { kind: 'Error' };
    }

    const lineLocationsAggregator = new LineLocationsAggregator();

    // Check if any of the vehicles has moved the last few minutes.
    // It may be possible that api hangs (returns the same data over and over).
    let hasAnyVehicleMovedInLastFewMinutes = false;

    this.hasMovedInLastFewMinutesClassifier.prepareForClassification();
    for (const vehicle of vehicles) {
      const lineName = vehicle.line;
      const line = this.lineDatabase.getLineByName(lineName);

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
      this.errorReporter.reportNoVehicleHasMovedInLastFewMinutes();
      return { kind: 'Error' };
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
