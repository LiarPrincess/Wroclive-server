import { Stop, StopCollection } from './models';
import { StopsControllerType } from './StopsControllerType';
import { PredefinedStopsController } from './PredefinedStopsController';
import { FirestoreStopsDatabase, FirestoreAllStopsDocument } from '../../cloud-platform';

export class FirestoreStopsController extends StopsControllerType {

  private db: FirestoreStopsDatabase;
  private stops: StopCollection;

  constructor(db: FirestoreStopsDatabase) {
    super();

    this.db = db;
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
