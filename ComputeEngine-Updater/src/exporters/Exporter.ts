import { Logger } from '../util';
import { LocalDatabase, Line, Stop } from '../local-database';

export abstract class Exporter {

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async exportData(db: LocalDatabase): Promise<void> {
    const timestamp = new Date().toISOString();

    const lines = await db.getAllLines();
    this.logger.info(`Exporting ${lines.length} lines`);
    await this.exportLines(timestamp, lines);

    const stops = await db.getAllStops();
    this.logger.info(`Exporting ${stops.length} stops`);
    await this.exportStops(timestamp, stops);
  }

  abstract async exportLines(timestamp: string, lines: Line[]): Promise<void>;
  abstract async exportStops(timestamp: string, stops: Stop[]): Promise<void> ;
}
