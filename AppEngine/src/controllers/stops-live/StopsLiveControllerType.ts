import { StopArrivalCollection } from './models';

export abstract class StopsLiveControllerType {

  /**
   * Get all of the available lines.
   */
  abstract getNextArrivals(stopId: string): Promise<StopArrivalCollection>;

  protected createTimestamp(): string {
    return new Date().toISOString();
  }
}
