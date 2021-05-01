import { Logger } from "../util";
import {
  Day,
  Line,
  LineTrip,
  LineLocations,
  Timestamped,
  VehicleLocation
} from './models';
import {
  VehicleLocationProvider,
  VehicleLocationUpdater,
  PreventStaleResponseFromVehicleLocationProvider
} from './update-vehicle-locations';
import { LinesProvider, DummyLineProvider } from './update-lines';

export default class Mpk {

  private linesProvider: LinesProvider;
  /// If the 1st provider returns no locations, then try the next one.
  private vehicleLocationProviders: VehicleLocationProvider[];
  private vehicleLocationUpdater: VehicleLocationUpdater;
  private logger: Logger;

  /**
   * All of the available MPK lines.
   */
  private lines: Timestamped<Line[]>;

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

    this.lines = { timestamp, data: DummyLineProvider.data };
    this.vehicleLocations = { timestamp, data: [] };

    this.vehicleLocationUpdater.setLines(this.lines.data);
  }

  /* ----- */
  /* Lines */
  /* ----- */

  /**
   * Get all of the available lines.
   */
  getLines(): Timestamped<Line[]> {
    return this.lines;
  }

  /**
   * Update internal line definitions.
   */
  async updateLines() {
    try {
      const timestampedLines = await this.linesProvider.getLines();

      // If the response doesn't contain any lines, then leave 'this.lines' without changes:
      // - If every response we got was error then use 'DummyLineProvider.data'
      //   set in 'constructor'
      // - If at some point we got valid response then it is still valid
      if (timestampedLines.data) {
        this.lines = timestampedLines;
        this.vehicleLocationUpdater.setLines(timestampedLines.data);
      }
    } catch (error) {
      // Leave 'this.lines' as they are, see comment in try block.
      throw error;
    }
  }

  /**
   * Get shape of all routes that belong to given line.
   */
  // async getLineShape(lineName: string): Promise<Timestamped<LineTrip[]>> {
  //   const data = await this.database.getLineShape(lineName);
  //   return { timestamp: this.createTimestamp(), data };
  // }

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
    const lines = this.lines.data;
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
