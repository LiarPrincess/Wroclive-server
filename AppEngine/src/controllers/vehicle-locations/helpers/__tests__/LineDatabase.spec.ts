import { Line } from '../../models';
import { LineDatabase } from '../LineDatabase';

const lineA = new Line('A', 'Bus', 'Express');
const line4 = new Line('4', 'Tram', 'Regular');
const line125 = new Line('125', 'Bus', 'Regular');

describe('LineDatabase', function () {

  describe('getLineNamesLowercase', function () {

    it('starts with no lines', function () {
      const db = new LineDatabase();
      expect(db.getLineNamesLowercase()).toEqual([]);
    });

    it('adding lines adds names', function () {
      const db = new LineDatabase();

      db.updateLineDefinitions({ timestamp: 'TIMESTAMP', data: [lineA, line125] });
      expect(db.getLineNamesLowercase()).toEqual(['a', '125']);
    });

    it('updating lines changes names', function () {
      const db = new LineDatabase();

      db.updateLineDefinitions({ timestamp: 'TIMESTAMP_1', data: [lineA, line125] });
      expect(db.getLineNamesLowercase()).toEqual(['a', '125']);

      db.updateLineDefinitions({ timestamp: 'TIMESTAMP_2', data: [line125, line4] });
      expect(db.getLineNamesLowercase()).toEqual(['125', '4']);
    });
  });

  describe('getLineByName', function () {
    it('without lines creates one', function () {
      const db = new LineDatabase();
      const lineA = new Line('A', 'Bus', 'Express');
      expect(db.getLineByName('A')).toEqual(lineA);
      expect(db.getLineByName('a')).toEqual(lineA);
    });

    it('with lines returns existing line ignoring case', function () {
      const db = new LineDatabase();
      db.updateLineDefinitions({ timestamp: 'TIMESTAMP_1', data: [lineA, line125] });
      expect(db.getLineByName('A')).toEqual(lineA);
      expect(db.getLineByName('a')).toEqual(lineA);
    });

    it('with lines returns existing line ignoring case', function () {
      const db = new LineDatabase();
      db.updateLineDefinitions({ timestamp: 'TIMESTAMP_1', data: [lineA, line125] });

      const lineD = new Line('D', 'Bus', 'Express');
      expect(db.getLineByName('D')).toEqual(lineD);
      expect(db.getLineByName('d')).toEqual(lineD);
    });
  });
});
