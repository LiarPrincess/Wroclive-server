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
import { LinesProvider, DummyLineProvider } from './update-lines';
import { StopsProvider, DummyStopProvider } from "./update-stops";
import { VehicleLocationProvider, calculateVehicleLocationUpdates } from './update-vehicle-locations';

export default class Mpk {

  private linesProvider: LinesProvider;
  private stopsProvider: StopsProvider;
  private vehicleLocationProvider: VehicleLocationProvider;
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
   * Last place at which we updated vehicle angle/heading.
   */
  private lastHeadingUpdate: VehicleLocation[];

  constructor(
    linesProvider: LinesProvider,
    stopsProvider: StopsProvider,
    vehicleLocationProvider: VehicleLocationProvider,
    logger: Logger
  ) {
    this.linesProvider = linesProvider;
    this.stopsProvider = stopsProvider;
    this.vehicleLocationProvider = vehicleLocationProvider;
    this.logger = logger;

    const timestamp = '';

    this.lines = { timestamp, data: DummyLineProvider.data };
    this.stops = { timestamp, data: DummyStopProvider.data };
    this.vehicleLocations = { timestamp, data: [] };
    this.lastHeadingUpdate = [];
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
      const data = await this.linesProvider.getLines();
      this.lines = data;
    } catch (error) {
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
      const data = await this.stopsProvider.getStops();
      this.stops = data;
    } catch (error) {
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
  getVehicleLocations(lineNames: string[]): Timestamped<LineLocations[]> {
    const { timestamp, data } = this.vehicleLocations;
    const filteredLocations = data.filter(lineLoc =>
      lineNames.some(name => name === lineLoc.line.name.toLowerCase())
    );

    return { timestamp, data: filteredLocations };
  }

  /**
   * Update locations for all of the vehicles (of all of the lines).
   */
  async updateVehicleLocations() {
    const lines = this.lines.data;
    if (!lines || lines.length === 0) {
      return;
    }

    const lineNames = lines.map(l => l.name);
    const vehicles = await this.vehicleLocationProvider.getVehicleLocations(lineNames);

    const input = {
      lines: lines,
      currentVehicleLocations: vehicles,
      lastHeadingUpdates: this.lastHeadingUpdate,
      minMovementToUpdateHeading: 50, // meters
    };

    const result = calculateVehicleLocationUpdates(input);
    const timestamp = this.createTimestamp();
    this.vehicleLocations = { timestamp, data: result.lineLocations };
    this.lastHeadingUpdate = result.headingUpdates;
  }

  /* ------- */
  /* Helpers */
  /* ------- */

  private createTimestamp(): string {
    return new Date().toISOString();
  }
}
