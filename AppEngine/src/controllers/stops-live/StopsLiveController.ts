import { StopArrivalCollection } from './models';
import { StopsLiveControllerType } from './StopsLiveControllerType';
import * as api from './api';
import { Logger } from '../../util';

export class StopsLiveController extends StopsLiveControllerType {

  private readonly logger: Logger;

  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }

  public async getNextArrivals(stopId: string): Promise<StopArrivalCollection> {
    const timestamp = this.createTimestamp();
    const result = await api.getNextArrivals(stopId);

    switch (result.kind) {
      case 'Success':
        const arrivals = result.arrivals;
        const invalidRecords = result.invalidRecords;

        if (invalidRecords.length) {
          this.logger.error(`Live stop ${stopId}: invalid records.`, invalidRecords);
        }

        const hasArrivals = arrivals.length !== 0;
        const hasNoInvalidInvalidRecords = invalidRecords.length === 0;

        // No arrivals with no invalid records -> still success.
        if (hasArrivals || hasNoInvalidInvalidRecords) {
          return new StopArrivalCollection(timestamp, true, arrivals);
        }

        break;

      case 'Error':
        const e = result.error;
        this.logger.error(`Live stop ${stopId}: ${e.message}.`, e.data);
        break;
    }

    return new StopArrivalCollection(timestamp, false, []);
  }
}
