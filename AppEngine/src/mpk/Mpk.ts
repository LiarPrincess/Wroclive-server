import { Logger } from "../util";
import {
  Day,
  LineLocations,
  Timestamped,
  VehicleLocation
} from './models';
import {
  VehicleLocationProvider,
  VehicleLocationUpdater,
  PreventStaleResponseFromVehicleLocationProvider
} from './update-vehicle-locations';
import { TimestampedLines } from '../controllers';

export interface LinesProvider {

  /**
   * Get all of the available lines.
   */
  getLines(): TimestampedLines;
}

export default class Mpk {

  private linesProvider: LinesProvider;
  /// If the 1st provider returns no locations, then try the next one.
  private vehicleLocationProviders: VehicleLocationProvider[];
  private vehicleLocationUpdater: VehicleLocationUpdater;
  private logger: Logger;

  /**
   * Current vehicle locations.
   */
  private vehicleLocations: Timestamped<LineLocations[]>;

  /**
   * @param vehicleLocationProviders If the 1st provider returns no locations, then try the next one.
   */
  constructor(
    linesProvider: LinesProvider,
    vehicleLocationProviders: VehicleLocationProvider[],
    logger: Logger
  ) {
    this.linesProvider = linesProvider;
    this.vehicleLocationProviders = vehicleLocationProviders;
    this.vehicleLocationUpdater = new VehicleLocationUpdater();
    this.logger = logger;

    const timestamp = '';
    this.vehicleLocations = { timestamp, data: [] };

    const lines = linesProvider.getLines();
    this.vehicleLocationUpdater.setLines(lines.data);
  }

  /* -------- */
  /* Vehicles */
  /* -------- */

  /**
   * Get vehicle locations for selected lines.
   */
  getVehicleLocations(lineNamesLowerCase: Set<string>): Timestamped<LineLocations[]> {
    const { timestamp, data } = this.vehicleLocations;
    const filteredLocations = data.filter(lineLoc =>
      lineNamesLowerCase.has(lineLoc.line.name.toLowerCase())
    );

    return { timestamp, data: filteredLocations };
  }

  /**
   * Update locations for all of the vehicles.
   */
  async updateVehicleLocations(timestamp?: string) {
    const lines = this.linesProvider.getLines().data;
    if (!lines || lines.length === 0) {
      return;
    }

    const ts = timestamp || this.createTimestamp();
    const lineNames = lines.map(line => line.name);

    for (const provider of this.vehicleLocationProviders) {
      const vehicles = await provider.getVehicleLocations(lineNames);
      const hasResponse = vehicles.length;

      if (hasResponse) {
        const lineLocations = this.vehicleLocationUpdater.calculateVehicleLocations(vehicles);
        this.vehicleLocations = { timestamp: ts, data: lineLocations };
        return; // Do not check other providers
      }
    }

    throw new Error('Failed to obtain current vehicle locations from all providers!');
  }

  /* ------- */
  /* Helpers */
  /* ------- */

  private createTimestamp(): string {
    return new Date().toISOString();
  }
}
