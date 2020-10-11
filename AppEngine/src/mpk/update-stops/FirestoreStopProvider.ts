import { Stop, Timestamped } from '../models';
import { StopsProvider } from './StopsProvider';
import { FirestoreDatabase } from '../../cloud-platform';

export class FirestoreStopProvider implements StopsProvider {

  private db: FirestoreDatabase;

  constructor(db: FirestoreDatabase) {
    this.db = db;
  }

  getStops(): Promise<Timestamped<Stop[]>> {
    return this.db.getAllStops();
  }
}
