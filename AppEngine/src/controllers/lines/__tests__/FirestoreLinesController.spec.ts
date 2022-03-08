import { Line } from '../models';
import { FirestoreLinesController } from '../FirestoreLinesController';
import { FirestoreLinesDatabase, FirestoreAllLinesDocument } from '../../../cloud-platform';
import { LoggerMock } from '../../../util';

const logger = new LoggerMock();

class FirestoreLinesDatabaseMock implements FirestoreLinesDatabase {

  lines: FirestoreAllLinesDocument;

  constructor() {
    this.lines = { timestamp: 'NOT_SET', data: [] };
  }

  getAllLines(): Promise<FirestoreAllLinesDocument> {
    return Promise.resolve(this.lines);
  }
}

describe('FirestoreLinesController', function () {

  it('starts with no lines', function () {
    const provider = new FirestoreLinesDatabaseMock();
    const controller = new FirestoreLinesController(provider, logger);

    const result = controller.getLines();
    expect(result.data).toEqual([]);
  });

  it('get lines from provider', async function () {
    const provider = new FirestoreLinesDatabaseMock();
    const controller = new FirestoreLinesController(provider, logger);

    provider.lines = {
      timestamp: 'NEW_TIMESTAMP',
      data: [
        new Line('Name1', 'Type1', 'Subtype1', undefined),
        new Line('Name2', 'Type2', 'Subtype2', { min: 30, max: 45 }),
        new Line('Name3', 'Type3', 'Subtype3', undefined),
      ]
    };

    await controller.updateLines();
    const result = controller.getLines();
    expect(result).toEqual(provider.lines);
  });

  it('avoids update if provider returned no lines', async function () {
    const provider = new FirestoreLinesDatabaseMock();
    const controller = new FirestoreLinesController(provider, logger);

    const linesOk = [
      new Line('Name1', 'Type1', 'Subtype1', undefined),
      new Line('Name2', 'Type2', 'Subtype2', { min: 30, max: 45 }),
      new Line('Name3', 'Type3', 'Subtype3', undefined),
    ];

    provider.lines = { timestamp: 'NEW_TIMESTAMP', data: linesOk };

    await controller.updateLines();
    const resultOk = controller.getLines();
    expect(resultOk).toEqual(provider.lines);

    provider.lines = { timestamp: 'NEW_TIMESTAMPS', data: [] };

    await controller.updateLines();
    const resultFailed = controller.getLines();
    expect(resultFailed.data).toEqual(linesOk);
  });
});
