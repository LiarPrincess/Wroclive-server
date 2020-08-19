import { Logger } from "../util";

export default class Mpk {

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Get all of the available lines.
   */
  getLines(): Promise<number[]> {
    return Promise.resolve([]);
  }

  /**
   * Get vehicle locations for selected lines.
   */
  getVehicleLocations(lineNames: string[]): Promise<number[]> {
    return Promise.resolve([]);
  }
}