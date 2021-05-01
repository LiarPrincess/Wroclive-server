import { Line, TimestampedLines } from './models';
import { LinesController } from './LinesController';

export class DummyLinesController extends LinesController {

  getLines(): TimestampedLines {
    const timestamp = this.createTimestamp();
    const data = DummyLinesController.data;
    return { timestamp, data };
  }

  updateLines(): Promise<void> {
    return Promise.resolve();
  }

  static data: Line[] = [
    DummyLinesController.createLine('A', 'Bus', 'Express'),
    DummyLinesController.createLine('C', 'Bus', 'Express'),
    DummyLinesController.createLine('D', 'Bus', 'Express'),
    DummyLinesController.createLine('K', 'Bus', 'Express'),
    DummyLinesController.createLine('N', 'Bus', 'Express'),
    DummyLinesController.createLine('0P', 'Tram', 'Regular'),
    DummyLinesController.createLine('0L', 'Tram', 'Regular'),
    DummyLinesController.createLine('1', 'Tram', 'Regular'),
    DummyLinesController.createLine('2', 'Tram', 'Regular'),
    DummyLinesController.createLine('3', 'Tram', 'Regular'),
    DummyLinesController.createLine('4', 'Tram', 'Regular'),
    DummyLinesController.createLine('5', 'Tram', 'Regular'),
    DummyLinesController.createLine('6', 'Tram', 'Regular'),
    DummyLinesController.createLine('7', 'Tram', 'Regular'),
    DummyLinesController.createLine('8', 'Tram', 'Regular'),
    DummyLinesController.createLine('9', 'Tram', 'Regular'),
    DummyLinesController.createLine('10', 'Tram', 'Regular'),
    DummyLinesController.createLine('11', 'Tram', 'Regular'),
    DummyLinesController.createLine('15', 'Tram', 'Regular'),
    DummyLinesController.createLine('16', 'Tram', 'Regular'),
    DummyLinesController.createLine('17', 'Tram', 'Regular'),
    DummyLinesController.createLine('20', 'Tram', 'Regular'),
    DummyLinesController.createLine('23', 'Tram', 'Regular'),
    DummyLinesController.createLine('31', 'Tram', 'Regular'),
    DummyLinesController.createLine('32', 'Tram', 'Regular'),
    DummyLinesController.createLine('33', 'Tram', 'Regular'),
    DummyLinesController.createLine('100', 'Bus', 'Regular'),
    DummyLinesController.createLine('101', 'Bus', 'Regular'),
    DummyLinesController.createLine('102', 'Bus', 'Regular'),
    DummyLinesController.createLine('103', 'Bus', 'Regular'),
    DummyLinesController.createLine('104', 'Bus', 'Regular'),
    DummyLinesController.createLine('105', 'Bus', 'Regular'),
    DummyLinesController.createLine('106', 'Bus', 'Regular'),
    DummyLinesController.createLine('107', 'Bus', 'Regular'),
    DummyLinesController.createLine('108', 'Bus', 'Regular'),
    DummyLinesController.createLine('109', 'Bus', 'Regular'),
    DummyLinesController.createLine('110', 'Bus', 'Regular'),
    DummyLinesController.createLine('111', 'Bus', 'Regular'),
    DummyLinesController.createLine('112', 'Bus', 'Regular'),
    DummyLinesController.createLine('113', 'Bus', 'Regular'),
    DummyLinesController.createLine('114', 'Bus', 'Regular'),
    DummyLinesController.createLine('115', 'Bus', 'Regular'),
    DummyLinesController.createLine('116', 'Bus', 'Regular'),
    DummyLinesController.createLine('118', 'Bus', 'Regular'),
    DummyLinesController.createLine('119', 'Bus', 'Regular'),
    DummyLinesController.createLine('120', 'Bus', 'Regular'),
    DummyLinesController.createLine('121', 'Bus', 'Regular'),
    DummyLinesController.createLine('122', 'Bus', 'Regular'),
    DummyLinesController.createLine('124', 'Bus', 'Regular'),
    DummyLinesController.createLine('125', 'Bus', 'Regular'),
    DummyLinesController.createLine('126', 'Bus', 'Regular'),
    DummyLinesController.createLine('127', 'Bus', 'Regular'),
    DummyLinesController.createLine('128', 'Bus', 'Regular'),
    DummyLinesController.createLine('129', 'Bus', 'Regular'),
    DummyLinesController.createLine('130', 'Bus', 'Regular'),
    DummyLinesController.createLine('131', 'Bus', 'Regular'),
    DummyLinesController.createLine('132', 'Bus', 'Regular'),
    DummyLinesController.createLine('133', 'Bus', 'Regular'),
    DummyLinesController.createLine('134', 'Bus', 'Regular'),
    DummyLinesController.createLine('136', 'Bus', 'Regular'),
    DummyLinesController.createLine('140', 'Bus', 'Regular'),
    DummyLinesController.createLine('141', 'Bus', 'Regular'),
    DummyLinesController.createLine('142', 'Bus', 'Regular'),
    DummyLinesController.createLine('143', 'Bus', 'Regular'),
    DummyLinesController.createLine('144', 'Bus', 'Regular'),
    DummyLinesController.createLine('145', 'Bus', 'Regular'),
    DummyLinesController.createLine('146', 'Bus', 'Regular'),
    DummyLinesController.createLine('147', 'Bus', 'Regular'),
    DummyLinesController.createLine('148', 'Bus', 'Regular'),
    DummyLinesController.createLine('149', 'Bus', 'Regular'),
    DummyLinesController.createLine('150', 'Bus', 'Regular'),
    DummyLinesController.createLine('151', 'Bus', 'Regular'),
    DummyLinesController.createLine('206', 'Bus', 'Night'),
    DummyLinesController.createLine('240', 'Bus', 'Night'),
    DummyLinesController.createLine('241', 'Bus', 'Night'),
    DummyLinesController.createLine('242', 'Bus', 'Night'),
    DummyLinesController.createLine('243', 'Bus', 'Night'),
    DummyLinesController.createLine('245', 'Bus', 'Night'),
    DummyLinesController.createLine('246', 'Bus', 'Night'),
    DummyLinesController.createLine('247', 'Bus', 'Night'),
    DummyLinesController.createLine('248', 'Bus', 'Night'),
    DummyLinesController.createLine('249', 'Bus', 'Night'),
    DummyLinesController.createLine('250', 'Bus', 'Night'),
    DummyLinesController.createLine('251', 'Bus', 'Night'),
    DummyLinesController.createLine('253', 'Bus', 'Night'),
    DummyLinesController.createLine('255', 'Bus', 'Night'),
    DummyLinesController.createLine('257', 'Bus', 'Night'),
    DummyLinesController.createLine('259', 'Bus', 'Night'),
    DummyLinesController.createLine('319', 'Bus', 'Regular'),
    DummyLinesController.createLine('325', 'Bus', 'Regular'),
    DummyLinesController.createLine('602', 'Bus', 'Suburban'),
    DummyLinesController.createLine('607', 'Bus', 'Suburban'),
    DummyLinesController.createLine('609', 'Bus', 'Suburban'),
    DummyLinesController.createLine('612', 'Bus', 'Suburban')
  ];

  static createLine(name: string, type: string, subtype: string): Line {
    return {
      name,
      type,
      subtype,
      stopArrivalTimes: undefined
    };
  }
}
