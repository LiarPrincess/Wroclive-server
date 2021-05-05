import { Line, LineCollection } from './models';
import { LinesController } from './LinesController';
import { DummyLinesController } from './DummyLinesController';
import { FirestoreAllLinesDocument } from '../../cloud-platform';

export interface FirestoreLinesProvider {
  getAllLines(): Promise<FirestoreAllLinesDocument>;
}

export class FirestoreLinesController extends LinesController {

  private db: FirestoreLinesProvider;
  private lines: LineCollection;

  constructor(db: FirestoreLinesProvider) {
    super();

    this.db = db;
    this.lines = {
      timestamp: this.createTimestamp(),
      data: DummyLinesController.data
    };
  }

  getLines(): LineCollection {
    return this.lines;
  }

  async updateLines(): Promise<void> {
    const dbLines = await this.db.getAllLines();

    // If the response doesn't contain any lines, then leave 'this.lines' without changes:
    // - If every response we got was error then use 'DummyLineProvider.data' set in 'constructor'
    // - If at some point we got valid response then it is still valid
    const hasAnyLines = dbLines.data.length != 0;
    // Avoid creating new objects if the timestamp has not changed
    const hasTimestampChanged = dbLines.timestamp != this.lines.timestamp;

    if (hasAnyLines && hasTimestampChanged) {
      const timestamp = dbLines.timestamp;
      const stops = dbLines.data.map(l => new Line(l.name, l.type, l.subtype, l.stopArrivalTimes));
      this.lines = new LineCollection(timestamp, stops);
    }
  }
}
