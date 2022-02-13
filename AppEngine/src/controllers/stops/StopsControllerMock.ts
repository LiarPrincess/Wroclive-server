import { StopCollection } from './models';
import { StopsControllerType } from './StopsControllerType';

export class StopsControllerMock extends StopsControllerType {

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
