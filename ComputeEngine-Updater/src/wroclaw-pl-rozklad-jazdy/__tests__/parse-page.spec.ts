import { html } from './example-page';
import { getAvailableLinesFromHtml } from '../parse-page';
import { Line } from '../../local-database';


function createLines(type: string, subtype: string, names: string[]): Line[] {
  return names.map(name => ({ name, type, subtype }));
}

describe('getAvailableLines', function () {
  it('should parse example page', function () {
    const result = getAvailableLinesFromHtml(html);

    const trams = createLines('Tram', 'Regular', [
      'E1', '0L', '0P',
      '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '10', '11', '14', '15', '16', '17',
      '20', '23', '24',
      '31', '32', '33',
    ]);

    const busRegular = createLines('Bus', 'Regular', [
      '100', '101', '102', '103', '104', '105', '106', '107', '108', '109',
      '110', '111', '112', '113', '114', '115', '116', '117', '118', '119',
      '120', '121', '122', '123', '124', '125', '126', '127', '128', '129',
      '130', '131', '132', '133', '134', '136', '137', '138',
      '140', '141', '142', '143', '144', '145', '146', '147', '148', '149',
      '150', '151'
    ]);

    const busExpress = createLines('Bus', 'Express', ['A', 'C', 'D', 'K', 'N']);
    const busPeak = createLines('Bus', 'Regular', ['319', '325']);
    const busSuburban = createLines('Bus', 'Suburban', ['602', '607', '609', '612']);
    const busTemporary = createLines('Bus', 'Temporary', ['701', '715', '744']);

    const busNight = createLines('Bus', 'Night', [
      '206', '240', '241', '242', '243', '245', '246', '247', '248', '249',
      '250', '251', '253', '255', '257', '259'
    ]);

    const expectedLines: Line[] = [
      ...trams,
      ...busRegular,
      ...busExpress,
      ...busPeak,
      ...busSuburban,
      ...busTemporary,
      ...busNight
    ];

    expect(result).toEqual(expectedLines);
  });
});
