import { StopArrivalCollection } from './models';
import { StopsLiveControllerType } from './StopsLiveControllerType';

export class StopsLiveControllerMock extends StopsLiveControllerType {

  data = new StopArrivalCollection('', true, []);
  getNextArrivalsCallCount = 0;

  public async getNextArrivals(stopId: string): Promise<StopArrivalCollection> {
    this.getNextArrivalsCallCount++;
    return this.data;
  }
}
