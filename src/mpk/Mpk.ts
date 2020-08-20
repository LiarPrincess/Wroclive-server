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
import { LineProvider } from './lines-update';
import { VehicleLocationProvider, calculateVehicleLocationUpdates } from './vehicle-update';

export default class Mpk {

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
   * Last place at which we updated vehicle angle/heading.
   */
  private lastHeadingUpdate: VehicleLocation[];

  constructor(logger: Logger) {
    this.logger = logger;

    const timestamp = '';
    this.lines = { timestamp, data: [] };
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
   * Update internal line definitions from given provider.
   */
  async updateLines(provider: LineProvider) {
    const lines = await provider.getLines();
    const timestamp = this.createTimestamp();
    this.lines = { timestamp, data: lines };
  }

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
  async updateVehicleLocations(provider: VehicleLocationProvider) {
    const lines = this.lines.data;
    if (!lines || lines.length === 0) {
      this.logger.info('Skipping vehicle locations update');
      return;
    }

    const lineNames = lines.map(l => l.name);
    const vehicles = await provider.getVehicleLocations(lineNames);

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

    this.logger.info('Successfully updated vehicle locations');
  }

  /* ------- */
  /* Helpers */
  /* ------- */

  private createTimestamp(): string {
    return new Date().toISOString();
  }
}
