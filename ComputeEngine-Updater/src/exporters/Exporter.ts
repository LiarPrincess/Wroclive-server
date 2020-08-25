import { Logger } from '../util';
import { LocalDatabase, queries } from '../local-database';
import { Line, Stop } from '../models';

export abstract class Exporter {

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async exportData(db: LocalDatabase): Promise<void> {
    const timestamp = new Date().toISOString();

    const lines = await db.all(queries.getAllLines) as Line[];
    this.logger.info(`Exporting ${lines.length} lines`);
    await this.exportLines(timestamp, lines);

    const stops = await db.all(queries.getAllStops) as Stop[];
    this.logger.info(`Exporting ${stops.length} stops`);
    await this.exportStops(timestamp, stops);
  }

  abstract async exportLines(timestamp: string, lines: Line[]): Promise<void>;
  abstract async exportStops(timestamp: string, stops: Stop[]): Promise<void> ;
}
