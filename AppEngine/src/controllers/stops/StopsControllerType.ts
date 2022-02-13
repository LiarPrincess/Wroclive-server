import { StopCollection } from './models';

export abstract class StopsControllerType {

  /**
   * Get all of the available stops.
   */
  abstract getStops(): StopCollection;

  /**
   * Update internal stops definitions.
   */
  abstract updateStops(): Promise<void>;

  /**
   * Get stop schedule for a next few hours.
   */
  // async getStopSchedule(stopCode: string, day: Day, time: number): Promise<Timestamped<StopArrival[]>> {
  //   // query just before user asked, so we also show recent departures
  //   const queryTime = time - 5;
  //   const data = await this.database.getStopSchedule(stopCode, day, queryTime);
  //   return { timestamp: this.createTimestamp(), data };
  // }

  protected createTimestamp(): string {
    return new Date().toISOString();
  }
}
