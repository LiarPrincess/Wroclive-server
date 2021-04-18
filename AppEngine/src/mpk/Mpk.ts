import { Logger } from "../util";
import {
  Day,
  Stop,
  StopArrival,
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
import { StopsProvider, DummyStopProvider } from './update-stops';

export default class Mpk {

  private linesProvider: LinesProvider;
  private stopsProvider: StopsProvider;
  /// If the 1st provider returns no locations, then try the next one.
  private vehicleLocationProviders: VehicleLocationProvider[];
  private vehicleLocationUpdater: VehicleLocationUpdater;
  private logger: Logger;

  /**
   * All of the available MPK lines.
   */
  private lines: Timestamped<Line[]>;

  /**
   * All of the available MPK stops.
   */
  private stops: Timestamped<Stop[]>;

  /**
   * Current vehicle locations.
   */
  private vehicleLocations: Timestamped<LineLocations[]>;

  /**
   * @param vehicleLocationProviders If the 1st provider returns no locations, then try the next one.
   */
  constructor(
    linesProvider: LinesProvider,
    stopsProvider: StopsProvider,
    vehicleLocationProviders: VehicleLocationProvider[],
    logger: Logger
  ) {
    this.linesProvider = linesProvider;
    this.stopsProvider = stopsProvider;
    this.vehicleLocationProviders = vehicleLocationProviders;
    this.vehicleLocationUpdater = new VehicleLocationUpdater();
    this.logger = logger;

    const timestamp = '';

    this.lines = { timestamp, data: DummyLineProvider.data };
    this.stops = { timestamp, data: DummyStopProvider.data };
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

  /* ----- */
  /* Stops */
  /* ----- */

  /**
   * Get all of the available stops.
   */
  getStops(): Timestamped<Stop[]> {
    return this.stops;
  }

  /**
   * Update internal stops definitions.
   */
  async updateStops() {
    try {
      const timestampedStops = await this.stopsProvider.getStops();

      // If the response doesn't contain any stops, then leave 'this.stops' without changes:
      // - If every response we got was error then use 'DummyStopProvider.data'
      //   set in 'constructor'
      // - If at some point we got valid response then it is still valid
      if (timestampedStops.data) {
        this.stops = timestampedStops;
      }
    } catch (error) {
      // Leave 'this.stops' as they are, see comment in try block.
      throw error;
    }
  }

  /**
   * Get stop schedule for a next few hours.
   */
  // async getStopSchedule(stopCode: string, day: Day, time: number): Promise<Timestamped<StopArrival[]>> {
  //   // query just before user asked, so we also show recent departures
  //   const queryTime = time - 5;
  //   const data = await this.database.getStopSchedule(stopCode, day, queryTime);
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
