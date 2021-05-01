import { TimestampedLines } from './models';
import { LinesController } from './LinesController';
import { DummyLinesController } from './DummyLinesController';
import { FirestoreDatabase } from '../../cloud-platform';

export class FirestoreLineController extends LinesController {

  private db: FirestoreDatabase;
  private lines: TimestampedLines;

  constructor(db: FirestoreDatabase) {
    super();

    this.db = db;
    this.lines = {
      timestamp: this.createTimestamp(),
      data: DummyLinesController.data
    };
  }

  getLines(): TimestampedLines {
    return this.lines;
  }

  async updateLines(): Promise<void> {
    try {
      const dbLines = await this.db.getAllLines();

      // If the response doesn't contain any lines, then leave 'this.lines' without changes:
      // - If every response we got was error then use 'DummyLineProvider.data' set in 'constructor'
      // - If at some point we got valid response then it is still valid
      if (dbLines.data) {
        this.lines = dbLines;
      }
    } catch (error) {
      // Leave 'this.lines' as they are, see comment in try block.
      throw error;
    }
  }
}
