import { StopCollection } from './models';
import { StopsController } from './StopsController';

export class FakeStopsController extends StopsController {

  data = new StopCollection('', []);
  getStopsCallCount = 0;
  updateStopsCallCount = 0;

  getStops(): StopCollection {
    this.getStopsCallCount++;
    return this.data;
  }

  updateStops(): Promise<void> {
    this.updateStopsCallCount++;
    return Promise.resolve();
  }
}
