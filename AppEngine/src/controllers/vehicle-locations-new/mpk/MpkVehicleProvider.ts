import {
  LineLocationsCollection,
  VehicleLocation,
  VehicleLocationFromApi,
  Logger
} from '../models';
import {
  AngleCalculator,
  IntervalErrorReporter,
  LineDatabase,
  LineLocationsAggregator
} from '../helpers';
import {
  HasMovedInLastFewMinutesClassifier,
  HasMovedInLastFewMinutesClassifierType
} from '../vehicle-classification';
import { MpkApi } from './MpkApi';
import { ApiType, ApiResult, ApiError } from './interfaces';
import { VehicleProviderBase, DateProvider } from '../VehicleProviderBase';

// For calculating intervals.
const second = 1000;
const minute = 60 * second;

type GetVehicleLocationsResult =
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
  private readonly hasMovedInLastFewMinutesClassifier: HasMovedInLastFewMinutesClassifierType;

  // If the something fails then report error.
  // But not always, we don't like spam.
  private readonly invalidRecordsErrorReporter: IntervalErrorReporter;
  private readonly apiErrorReporter: IntervalErrorReporter;
  private readonly apiResponseDoesNotContainVehiclesReporter: IntervalErrorReporter;
  private readonly noVehicleHasMovedInLastFewMinutesReporter: IntervalErrorReporter;

  constructor(
    lineDatabase: LineDatabase,
    logger: Logger,
    api?: ApiType,
    hasMovedInLastFewMinutesClassifier?: HasMovedInLastFewMinutesClassifierType,
    dateProvider?: DateProvider
  ) {
    super(dateProvider);

    this.api = api || new MpkApi(lineDatabase);
    this.lineDatabase = lineDatabase;
    this.angleCalculator = new AngleCalculator();
    this.hasMovedInLastFewMinutesClassifier = hasMovedInLastFewMinutesClassifier || new HasMovedInLastFewMinutesClassifier();

    this.invalidRecordsErrorReporter = new IntervalErrorReporter(
      30 * minute,
      '[MpkVehicleProvider] Api response contains invalid records.',
      logger
    );

    this.apiErrorReporter = new IntervalErrorReporter(
      5 * minute,
      '[MpkVehicleProvider] Api get vehicle locations failed.',
      logger
    );

    this.apiResponseDoesNotContainVehiclesReporter = new IntervalErrorReporter(
      5 * minute,
      '[MpkVehicleProvider] Api response contains no valid vehicles.',
      logger
    );

    this.noVehicleHasMovedInLastFewMinutesReporter = new IntervalErrorReporter(
      5 * minute,
      '[MpkVehicleProvider] No vehicle has moved in last few minutes.',
      logger
    );
  }

  async getVehicleLocations(): Promise<GetVehicleLocationsResult> {
    let vehicles: VehicleLocationFromApi[] = [];

    const response = await this.getVehicleLocationsFromApi();
    switch (response.kind) {
      case 'Success':
        vehicles = response.vehicles;
        this.reportInvalidRecordsIfNeeded(response.invalidRecords);
        break;
      case 'Error':
        this.reportApiErrorIfNeeded(response.error);
        return { kind: 'Error' };
    }

    if (!vehicles.length) {
      this.apiResponseDoesNotContainVehiclesReporter.report(response);
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
      this.noVehicleHasMovedInLastFewMinutesReporter.report({});
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

  private reportInvalidRecordsIfNeeded(records: any[]) {
    if (records.length) {
      this.invalidRecordsErrorReporter.report(records);
    }
  }

  private reportApiErrorIfNeeded(error: ApiError) {
    this.apiErrorReporter.report(error);
  }
}
