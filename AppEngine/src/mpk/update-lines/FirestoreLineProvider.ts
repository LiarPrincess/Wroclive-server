import { Line, Timestamped } from '../models';
import { LinesProvider } from './LinesProvider';
import { FirestoreDatabase } from '../../cloud-platform';

export class FirestoreLineProvider implements LinesProvider {

  private db: FirestoreDatabase;

  constructor(db: FirestoreDatabase) {
    this.db = db;
  }

  async getLines(): Promise<Timestamped<Line[]>> {
    return this.db.getAllLinesDocument()
  }
}
