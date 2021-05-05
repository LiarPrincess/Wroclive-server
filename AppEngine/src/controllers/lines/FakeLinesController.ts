import { LineCollection } from './models';
import { LinesController } from './LinesController';

export class FakeLinesController extends LinesController {

  data = new LineCollection('', []);
  getLinesCallCount = 0;
  updateLinesCallCount = 0;

  getLines(): LineCollection {
    this.getLinesCallCount++;
    return this.data;
  }

  updateLines(): Promise<void> {
    this.updateLinesCallCount++;
    return Promise.resolve();
  }
}
