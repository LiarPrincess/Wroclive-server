import { Stop } from '../models';
import { FirestoreStopsController } from '../FirestoreStopsController';
import { PredefinedStopsController } from '../PredefinedStopsController';
import { FirestoreStopsDatabase, FirestoreAllStopsDocument } from '../../../cloud-platform';
import { Logger } from '../../../util';

class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void { }
  error(message?: any, ...optionalParams: any[]): void { }
}

const logger = new LoggerMock();

class FirestoreStopsDatabaseMock implements FirestoreStopsDatabase {

  stops: FirestoreAllStopsDocument;

  constructor() {
    this.stops = { timestamp: 'NOT_SET', data: [] };
  }

  getAllStops(): Promise<FirestoreAllStopsDocument> {
    return Promise.resolve(this.stops);
  }
}

describe('FirestoreStopsController', function () {

  it('starts with dummy stops', function () {
    const provider = new FirestoreStopsDatabaseMock();
    const controller = new FirestoreStopsController(provider, logger);

    const stops = controller.getStops();
    expect(stops.data).toEqual(PredefinedStopsController.data);
  });

  it('get stops from provider', async function () {
    const provider = new FirestoreStopsDatabaseMock();
    const controller = new FirestoreStopsController(provider, logger);

    provider.stops = {
      timestamp: 'NEW_TIMESTAMP',
      data: [
        new Stop('Code1', 'Name1', 1, 2),
        new Stop('Code2', 'Name2', 3, 4),
        new Stop('Code3', 'Name3', 5, 6)
      ]
    };

    await controller.updateStops();

    const stops = controller.getStops();
    expect(stops).toEqual(provider.stops);
  });

  it('avoids update if provider returned no stops', async function () {
    const provider = new FirestoreStopsDatabaseMock();
    const controller = new FirestoreStopsController(provider, logger);

    provider.stops = {
      timestamp: 'NEW_TIMESTAMPS',
      data: []
    };

    await controller.updateStops();
    const stops = controller.getStops();
    expect(stops.data).toEqual(PredefinedStopsController.data);
  });
});
