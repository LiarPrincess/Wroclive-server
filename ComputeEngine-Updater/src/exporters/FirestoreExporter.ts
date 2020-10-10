import { Exporter } from './Exporter';
import { Logger } from '../util';
import { Line, Stop } from '../local-database';
import {
  FirestoreDatabase,
  FirestoreAllLinesDocument,
  FirestoreAllStopsDocument
} from '../cloud-platform';

export class FirestoreExporter extends Exporter {

  private db: FirestoreDatabase;

  constructor(db: FirestoreDatabase, logger: Logger) {
    super(logger);
    this.db = db;
  }

  async exportLines(timestamp: string, lines: Line[]): Promise<void> {
    const document: FirestoreAllLinesDocument = {
      timestamp,
      data: lines
    };

    await this.db.saveAllLines(document);
  }

  async exportStops(timestamp: string, stops: Stop[]): Promise<void> {
    const document: FirestoreAllStopsDocument = {
      timestamp,
      data: stops
    };

    await this.db.saveAllStops(document);
  }
}
