import { LineCollection } from './models';

export abstract class LinesController {

  /**
   * Get all of the available lines.
   */
  abstract getLines(): LineCollection;

  /**
   * Update internal line definitions.
   */
  abstract updateLines(): Promise<void>;

  /**
   * Get shape of all routes that belong to given line.
   */
  // async getLineShape(lineName: string): Promise<Timestamped<LineTrip[]>> {
  //   const data = await this.database.getLineShape(lineName);
  //   return { timestamp: this.createTimestamp(), data };
  // }

  protected createTimestamp(): string {
    return new Date().toISOString();
  }
}
