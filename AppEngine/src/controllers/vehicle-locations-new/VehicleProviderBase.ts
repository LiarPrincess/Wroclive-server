import { LineLocationsCollection } from './models';
import { LineLocationsAggregator } from './helpers';

export type DateProvider = () => Date;

export class VehicleProviderBase {

  private readonly dateProvider: DateProvider;

  constructor(dateProvider: DateProvider | undefined) {
    this.dateProvider = dateProvider || (() => new Date());
  }

  protected createLineLocationsCollection(
    aggregator: LineLocationsAggregator
  ): LineLocationsCollection {
    const now = this.dateProvider();
    const timestamp = now.toISOString();
    const lineLocations = aggregator.getLineLocations();
    return new LineLocationsCollection(timestamp, lineLocations);
  }
}
