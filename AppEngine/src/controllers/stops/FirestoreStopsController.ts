import { Stop, StopCollection } from './models';
import { StopsControllerType } from './StopsControllerType';
import { PredefinedStopsController } from './PredefinedStopsController';
import { FirestoreStopsDatabase } from '../../cloud-platform';
import { Logger } from '../../util';

export class FirestoreStopsController extends StopsControllerType {

  private db: FirestoreStopsDatabase;
  private logger: Logger;
  private stops: StopCollection;

  constructor(db: FirestoreStopsDatabase, logger: Logger) {
    super();

    this.db = db;
    this.logger = logger;
    this.stops = {
      timestamp: this.createTimestamp(),
      data: PredefinedStopsController.data
    };
  }

  getStops(): StopCollection {
    return this.stops;
  }

  async updateStops(): Promise<void> {
    const dbStops = await this.db.getAllStops();

    if (dbStops === undefined) {
      this.logger.error('[StopsController] No stops in firestore database?');
      return;
    }

    // If the response doesn't contain any stops, then leave 'this.stops' without changes:
    // - If every response we got was error then use 'DummyStopsController.data' set in 'constructor'
    // - If at some point we got a valid response then it is still valid
    const hasAnyStops = dbStops.data.length != 0;
    // Avoid creating new objects if the timestamp has not changed
    const hasTimestampChanged = dbStops.timestamp != this.stops.timestamp;

    if (hasAnyStops && hasTimestampChanged) {
      const timestamp = dbStops.timestamp;
      const stops = dbStops.data.map(s => new Stop(s.code, s.name, s.lat, s.lng));
      this.stops = new StopCollection(timestamp, stops);
    }
  }
}
