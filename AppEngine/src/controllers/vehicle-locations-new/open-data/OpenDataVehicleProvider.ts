import {
  OpenDataApi,
  GetVehicleLocationsResult as GetApiVehicleLocationsResult,
  GetResourceIdError,
  QueryVehicleLocationsError
} from './OpenDataApi';
import {
  LineLocationsCollection,
  VehicleLocation,
  VehicleLocationFromApi
} from '../models';
import {
  AngleCalculator,
  IntervalErrorReporter,
  LineDatabase,
  LineLocationsAggregator
} from '../helpers';
import { VehicleClassifier } from '../vehicle-classification';
import { VehicleProviderBase } from '../VehicleProviderBase';
import { Logger } from '../../../util';

// For calculating intervals.
const second = 1000;
const minute = 60 * second;

type GetVehicleLocationsResult =
  { kind: 'Success', lineLocations: LineLocationsCollection } |
  { kind: 'Error' };

/**
 * Open data is designed as a PRIMARY data source.
 * We are more strict on what we show.
 */
export class OpenDataVehicleProvider extends VehicleProviderBase {

  private readonly api: OpenDataApi;
  private readonly lineDatabase: LineDatabase;
  private readonly angleCalculator: AngleCalculator;
  private readonly vehicleClassifier: VehicleClassifier;

  // If the something fails then report error.
  // But not always, we don't like spam.
  private readonly resourceIdErrorReporter: IntervalErrorReporter;
  private readonly invalidRecordsErrorReporter: IntervalErrorReporter;
  private readonly queryVehicleLocationsErrorReporter: IntervalErrorReporter;
  private readonly noVehicleHasMovedInLastFewMinutesReporter: IntervalErrorReporter;

  constructor(lineDatabase: LineDatabase, logger: Logger) {
    super();

    this.api = new OpenDataApi();
    this.lineDatabase = lineDatabase;
    this.vehicleClassifier = new VehicleClassifier();
    this.angleCalculator = new AngleCalculator();

    this.resourceIdErrorReporter = new IntervalErrorReporter(
      15 * minute,
      '[OpenDataVehicleProvider] Api resource id refresh failed.',
      logger
    );

    this.invalidRecordsErrorReporter = new IntervalErrorReporter(
      30 * minute,
      '[OpenDataVehicleProvider] Api response contains invalid records.',
      logger
    );

    this.queryVehicleLocationsErrorReporter = new IntervalErrorReporter(
      5 * minute,
      '[OpenDataVehicleProvider] Api get vehicle locations failed.',
      logger
    );

    this.noVehicleHasMovedInLastFewMinutesReporter = new IntervalErrorReporter(
      5 * minute,
      '[OpenDataVehicleProvider] No vehicle has moved in last few minutes.',
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
        this.reportResourceIdErrorIfNeeded(response.resourceIdError);
        break;
      case 'Error':
        this.reportQueryVehicleLocationsErrorIfNeeded(response.error);
        this.reportResourceIdErrorIfNeeded(response.resourceIdError);
        return { kind: 'Error' };
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

      if (hasMovedInLastFewMinutes) {
        hasAnyVehicleMovedInLastFewMinutes = true;
      }

      const isVisible = !isInDepot && isWithinScheduleTimeFrame;
      if (isVisible) {
        const angle = this.angleCalculator.calculateAngle(vehicle);
        const vehicleLocation = new VehicleLocation(vehicle.id, vehicle.lat, vehicle.lng, angle);
        lineLocationsAggregator.addVehicle(line, vehicleLocation);
      }
    }

    // Filter may have removed all vehicles.
    if (!hasAnyVehicleMovedInLastFewMinutes) {
      this.noVehicleHasMovedInLastFewMinutesReporter.report({});
      return { kind: 'Error' };
    }

    const result = this.createLineLocationsCollection(lineLocationsAggregator);
    return { kind: 'Success', lineLocations: result };
  }

  private async getVehicleLocationsFromApi(): Promise<GetApiVehicleLocationsResult> {
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

  private reportResourceIdErrorIfNeeded(error: GetResourceIdError | undefined) {
    if (error) {
      this.resourceIdErrorReporter.report(error);
    }
  }

  private reportInvalidRecordsIfNeeded(records: any[]) {
    if (records.length) {
      this.invalidRecordsErrorReporter.report(records);
    }
  }

  private reportQueryVehicleLocationsErrorIfNeeded(error: QueryVehicleLocationsError) {
    this.queryVehicleLocationsErrorReporter.report(error);
  }
}
