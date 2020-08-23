import { Line, Timestamped } from '../models';
import { LineProvider } from './LineProvider';
import { FirestoreDatabase } from '../../cloud-platform';

export class FirestoreLineProvider implements LineProvider {

  private db: FirestoreDatabase;

  constructor(db: FirestoreDatabase) {
    this.db = db;
  }

  async getLines(): Promise<Timestamped<Line[]>> {
    return this.db.getAllLinesDocument()
  }
}
