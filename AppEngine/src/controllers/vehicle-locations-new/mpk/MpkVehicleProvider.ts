import {
  MpkApi,
  GetVehicleLocationsResult as GetApiVehicleLocationsResult,
  GetVehicleLocationsError
} from './MpkApi';
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
import { VehicleProviderBase } from '../VehicleProviderBase';
import { Logger } from '../../../util';

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

  private readonly api: MpkApi;
  private readonly lineDatabase: LineDatabase;
  private readonly angleCalculator: AngleCalculator;

  // If the something fails then report error.
  // But not always, we don't like spam.
  private readonly invalidRecordsErrorReporter: IntervalErrorReporter;
  private readonly apiErrorReporter: IntervalErrorReporter;

  constructor(lineDatabase: LineDatabase, logger: Logger) {
    super();

    this.api = new MpkApi(lineDatabase);
    this.lineDatabase = lineDatabase;
    this.angleCalculator = new AngleCalculator();

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

    const lineLocationsAggregator = new LineLocationsAggregator();

    for (const vehicle of vehicles) {
      const lineName = vehicle.line;
      const line = this.lineDatabase.getLineByName(lineName);

      // Technically we should reset 'angleCalculator' if the mpk provider was
      // not used in a while (like 30 min etc.).
      const angle = this.angleCalculator.calculateAngle(vehicle);
      const vehicleLocation = new VehicleLocation(vehicle.id, vehicle.lat, vehicle.lng, angle);
      lineLocationsAggregator.addVehicle(line, vehicleLocation);
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

  private reportInvalidRecordsIfNeeded(records: any[]) {
    if (records.length) {
      this.invalidRecordsErrorReporter.report(records);
    }
  }

  private reportApiErrorIfNeeded(error: GetVehicleLocationsError) {
    this.apiErrorReporter.report(error);
  }
}
