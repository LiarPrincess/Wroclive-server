import { Exporter } from './Exporter';
import { Logger } from '../util';
import { FirestoreDatabase } from '../cloud-platform';
import { Line, Stop } from '../models';

export class FirestoreExporter extends Exporter {

  private db: FirestoreDatabase;

  constructor(db: FirestoreDatabase, logger: Logger) {
    super(logger);
    this.db = db;
  }

  async exportLines(timestamp: string, lines: Line[]): Promise<void> {
    await this.db.setAllLinesDocument(timestamp, lines);
  }

  async exportStops(timestamp: string, stops: Stop[]): Promise<void> {
    await this.db.setAllStopsDocument(timestamp, stops);
  }
}
