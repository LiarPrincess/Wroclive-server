import { Stop } from '../models';
import { FirestoreStopsController } from '../FirestoreStopsController';
import { FirestoreStopsDatabase, FirestoreAllStopsDocument } from '../../../cloud-platform';
import { LoggerMock } from '../../../util';

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

  it('starts with no stops', function () {
    const provider = new FirestoreStopsDatabaseMock();
    const controller = new FirestoreStopsController(provider, logger);

    const result = controller.getStops();
    expect(result.data).toEqual([]);
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
    const result = controller.getStops();
    expect(result).toEqual(provider.stops);
  });

  it('avoids update if provider returned no stops', async function () {
    const provider = new FirestoreStopsDatabaseMock();
    const controller = new FirestoreStopsController(provider, logger);

    const stopsOk = [
      new Stop('Code1', 'Name1', 1, 2),
      new Stop('Code2', 'Name2', 3, 4),
      new Stop('Code3', 'Name3', 5, 6)
    ];

    provider.stops = { timestamp: 'NEW_TIMESTAMP', data: stopsOk };

    await controller.updateStops();
    const resultOk = controller.getStops();
    expect(resultOk).toEqual(provider.stops);

    // Empty data -> failed.
    provider.stops = { timestamp: 'NEW_TIMESTAMPS', data: [] };

    await controller.updateStops();
    const resultFailed = controller.getStops();
    expect(resultFailed.data).toEqual(stopsOk);
  });
});
