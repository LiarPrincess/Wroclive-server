import { LineCollection } from './models';
import { LinesControllerType } from './LinesControllerType';

export class LinesControllerMock extends LinesControllerType {

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
