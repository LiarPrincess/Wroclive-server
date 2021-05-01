import { TimestampedStops } from './models';
import { StopsController } from './StopsController';
import { DummyStopsController } from './DummyStopsController';
import { FirestoreDatabase } from '../../cloud-platform';

export class FirestoreStopsController extends StopsController {

  private db: FirestoreDatabase;
  private stops: TimestampedStops;

  constructor(db: FirestoreDatabase) {
    super();

    this.db = db;
    this.stops = {
      timestamp: this.createTimestamp(),
      data: DummyStopsController.data
    };
  }

  getStops(): TimestampedStops {
    return this.stops;
  }

  async updateStops(): Promise<void> {
    try {
      const dbStops = await this.db.getAllStops();

      // If the response doesn't contain any stops, then leave 'this.stops' without changes:
      // - If every response we got was error then use 'DummyStopsController.data' set in 'constructor'
      // - If at some point we got a valid response then it is still valid
      if (dbStops.data) {
        this.stops = dbStops;
      }
    } catch (error) {
      // Leave 'this.stops' as they are, see comment in try block.
      throw error;
    }
  }
}
