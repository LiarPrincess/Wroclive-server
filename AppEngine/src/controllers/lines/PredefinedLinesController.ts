import { Line, LineCollection } from './models';
import { LinesControllerType } from './LinesControllerType';

export class PredefinedLinesController extends LinesControllerType {

  getLines(): LineCollection {
    const timestamp = this.createTimestamp();
    const data = PredefinedLinesController.data;
    return { timestamp, data };
  }

  updateLines(): Promise<void> {
    return Promise.resolve();
  }

  static data: Line[] = [
    createLine('A', 'Bus', 'Express'),
    createLine('C', 'Bus', 'Express'),
    createLine('D', 'Bus', 'Express'),
    createLine('K', 'Bus', 'Express'),
    createLine('N', 'Bus', 'Express'),
    createLine('0P', 'Tram', 'Regular'),
    createLine('0L', 'Tram', 'Regular'),
    createLine('1', 'Tram', 'Regular'),
    createLine('2', 'Tram', 'Regular'),
    createLine('3', 'Tram', 'Regular'),
    createLine('4', 'Tram', 'Regular'),
    createLine('5', 'Tram', 'Regular'),
    createLine('6', 'Tram', 'Regular'),
    createLine('7', 'Tram', 'Regular'),
    createLine('8', 'Tram', 'Regular'),
    createLine('9', 'Tram', 'Regular'),
    createLine('10', 'Tram', 'Regular'),
    createLine('11', 'Tram', 'Regular'),
    createLine('15', 'Tram', 'Regular'),
    createLine('16', 'Tram', 'Regular'),
    createLine('17', 'Tram', 'Regular'),
    createLine('20', 'Tram', 'Regular'),
    createLine('23', 'Tram', 'Regular'),
    createLine('31', 'Tram', 'Regular'),
    createLine('32', 'Tram', 'Regular'),
    createLine('33', 'Tram', 'Regular'),
    createLine('100', 'Bus', 'Regular'),
    createLine('101', 'Bus', 'Regular'),
    createLine('102', 'Bus', 'Regular'),
    createLine('103', 'Bus', 'Regular'),
    createLine('104', 'Bus', 'Regular'),
    createLine('105', 'Bus', 'Regular'),
    createLine('106', 'Bus', 'Regular'),
    createLine('107', 'Bus', 'Regular'),
    createLine('108', 'Bus', 'Regular'),
    createLine('109', 'Bus', 'Regular'),
    createLine('110', 'Bus', 'Regular'),
    createLine('111', 'Bus', 'Regular'),
    createLine('112', 'Bus', 'Regular'),
    createLine('113', 'Bus', 'Regular'),
    createLine('114', 'Bus', 'Regular'),
    createLine('115', 'Bus', 'Regular'),
    createLine('116', 'Bus', 'Regular'),
    createLine('118', 'Bus', 'Regular'),
    createLine('119', 'Bus', 'Regular'),
    createLine('120', 'Bus', 'Regular'),
    createLine('121', 'Bus', 'Regular'),
    createLine('122', 'Bus', 'Regular'),
    createLine('124', 'Bus', 'Regular'),
    createLine('125', 'Bus', 'Regular'),
    createLine('126', 'Bus', 'Regular'),
    createLine('127', 'Bus', 'Regular'),
    createLine('128', 'Bus', 'Regular'),
    createLine('129', 'Bus', 'Regular'),
    createLine('130', 'Bus', 'Regular'),
    createLine('131', 'Bus', 'Regular'),
    createLine('132', 'Bus', 'Regular'),
    createLine('133', 'Bus', 'Regular'),
    createLine('134', 'Bus', 'Regular'),
    createLine('136', 'Bus', 'Regular'),
    createLine('140', 'Bus', 'Regular'),
    createLine('141', 'Bus', 'Regular'),
    createLine('142', 'Bus', 'Regular'),
    createLine('143', 'Bus', 'Regular'),
    createLine('144', 'Bus', 'Regular'),
    createLine('145', 'Bus', 'Regular'),
    createLine('146', 'Bus', 'Regular'),
    createLine('147', 'Bus', 'Regular'),
    createLine('148', 'Bus', 'Regular'),
    createLine('149', 'Bus', 'Regular'),
    createLine('150', 'Bus', 'Regular'),
    createLine('151', 'Bus', 'Regular'),
    createLine('206', 'Bus', 'Night'),
    createLine('240', 'Bus', 'Night'),
    createLine('241', 'Bus', 'Night'),
    createLine('242', 'Bus', 'Night'),
    createLine('243', 'Bus', 'Night'),
    createLine('245', 'Bus', 'Night'),
    createLine('246', 'Bus', 'Night'),
    createLine('247', 'Bus', 'Night'),
    createLine('248', 'Bus', 'Night'),
    createLine('249', 'Bus', 'Night'),
    createLine('250', 'Bus', 'Night'),
    createLine('251', 'Bus', 'Night'),
    createLine('253', 'Bus', 'Night'),
    createLine('255', 'Bus', 'Night'),
    createLine('257', 'Bus', 'Night'),
    createLine('259', 'Bus', 'Night'),
    createLine('319', 'Bus', 'Regular'),
    createLine('325', 'Bus', 'Regular'),
    createLine('602', 'Bus', 'Suburban'),
    createLine('607', 'Bus', 'Suburban'),
    createLine('609', 'Bus', 'Suburban'),
    createLine('612', 'Bus', 'Suburban')
  ];
}

function createLine(name: string, type: string, subtype: string): Line {
  const stopArrivalTimes = undefined;
  return new Line(name, type, subtype, stopArrivalTimes);
}
