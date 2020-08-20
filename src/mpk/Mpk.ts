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
import { LineProvider } from './lines-update/LineProvider';

export default class Mpk {

  private logger: Logger;

  /**
   * All of the available MPK lines.
    */
  private lines: Timestamped<Line[]>;

  constructor(logger: Logger) {
    this.logger = logger;

    const timestamp = '';
    this.lines = { timestamp, data: [] };
  }

  /* ----- */
  /* Lines */
  /* ----- */

  /**
   * Get all of the available lines.
   */
  getLines(): Promise<Timestamped<Line[]>> {
    return Promise.resolve(this.lines);
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
  getVehicleLocations(lineNames: string[]): Promise<number[]> {
    return Promise.resolve([]);
  }

  /* ------- */
  /* Helpers */
  /* ------- */

  private createTimestamp(): string {
    return new Date().toISOString();
  }
}