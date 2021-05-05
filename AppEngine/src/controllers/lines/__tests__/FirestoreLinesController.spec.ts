import { Line } from '../models';
import { DummyLinesController } from '../DummyLinesController';
import { FirestoreAllLinesDocument } from '../../../cloud-platform';
import {
  FirestoreLinesController,
  FirestoreLinesProvider
} from '../FirestoreLinesController';

class FakeFirestoreLinesProvider implements FirestoreLinesProvider {

  lines: FirestoreAllLinesDocument;

  constructor() {
    this.lines = { timestamp: 'NOT_SET', data: [] };
  }

  getAllLines(): Promise<FirestoreAllLinesDocument> {
    return Promise.resolve(this.lines);
  }
}

describe('FirestoreLinesController', function () {

  it('starts with dummy lines', function () {
    const provider = new FakeFirestoreLinesProvider();
    const controller = new FirestoreLinesController(provider);

    const lines = controller.getLines();
    expect(lines.data).toEqual(DummyLinesController.data);
  });

  it('get lines from provider', async function () {
    const provider = new FakeFirestoreLinesProvider();
    const controller = new FirestoreLinesController(provider);

    provider.lines = {
      timestamp: 'NEW_TIMESTAMP',
      data: [
        new Line('Name1', 'Type1', 'Subtype1', undefined),
        new Line('Name2', 'Type2', 'Subtype2', { min: 30, max: 45 }),
        new Line('Name3', 'Type3', 'Subtype3', undefined),
      ]
    };

    await controller.updateLines();

    const lines = controller.getLines();
    expect(lines).toEqual(provider.lines);
  });

  it('avoids update if provider returned no lines', async function () {
    const provider = new FakeFirestoreLinesProvider();
    const controller = new FirestoreLinesController(provider);

    provider.lines = {
      timestamp: 'NEW_TIMESTAMPS',
      data: []
    };

    await controller.updateLines();
    const lines = controller.getLines();
    expect(lines.data).toEqual(DummyLinesController.data);
  });
});
