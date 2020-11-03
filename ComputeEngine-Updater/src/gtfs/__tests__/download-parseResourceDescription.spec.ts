import { Logger } from '../../util';
import { parseResourceDescription } from '../download';
import * as testData from './resourceDescription-test-data';

const logger: Logger = {
  info(message?: any, ...optionalParams: any[]): void { },
  error(message?: any, ...optionalParams: any[]): void { }
};

describe('parseResourceDescription', function () {

  it('throws error on description without @graph', function () {
    try {
      const json = '{}';
      const description = JSON.parse(json);
      parseResourceDescription(description, logger);
      fail();
    } catch (error) {
      const errorString = String(error);
      expect(errorString).toEqual(`Error: Unable to parse resource description: '@graph' is not an array`);
    }
  });

  it('does not crash on description with invalid @graph', function () {
    const json = '{ "@graph": [] }';
    const description = JSON.parse(json);
    const result = parseResourceDescription(description, logger);

    expect(result).toStrictEqual({
      title: undefined,
      modified: undefined,
      fileUris: []
    });
  });

  it('parses standard description', function () {
    const json = testData.standard;
    const description = JSON.parse(json);
    const result = parseResourceDescription(description, logger);

    expect(result).toStrictEqual({
      title: 'RozkÅ‚ad jazdy transportu publicznego',
      modified: '2020-10-31T11:19:49.701389',
      fileUris: [
        'https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/OtwartyWroclaw_rozklad_jazdy_GTFS.zip'
      ]
    });
  });

  it('parses description with multiple dataset distributions', function () {
    const json = testData.multipleDatasetDistributions;
    const description = JSON.parse(json);
    const result = parseResourceDescription(description, logger);

    expect(result).toStrictEqual({
      title: 'RozkÅ‚ad jazdy transportu publicznego',
      modified: '2020-10-31T11:19:49.701389',
      fileUris: [
        'https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/OtwartyWroclaw_rozklad_jazdy_GTFS.zip',
        'https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/AAOtwartyWroclaw_rozklad_jazdy_GTFS.zip'
      ]
    });
  });

  // describe end
});
