import { Mpk } from '../index';
import { FakeLinesProvider, FakeStopsProvider, FakeVehicleLocationProvider } from './fakes';
import { createConsoleLogger } from '../../util/index';

const logger = createConsoleLogger();

describe('getLines', () => {

  it('should return data from provider', async () => {
    const linesProvider = new FakeLinesProvider();
    const stopsProvider = new FakeStopsProvider();
    const vehicleLocationProvider = new FakeVehicleLocationProvider();
    const mpk = new Mpk(linesProvider, stopsProvider, [vehicleLocationProvider], logger);

    linesProvider.data = {
      timestamp: 'TIMESTAMP',
      data: [
        { name: 'A', type: 'Bus', subtype: 'Express', stopArrivalTimes: undefined },
        { name: '124', type: 'Bus', subtype: 'Regular', stopArrivalTimes: undefined },
        { name: '257', type: 'Bus', subtype: 'Night', stopArrivalTimes: undefined }
      ]
    };

    await mpk.updateLines();
    expect(linesProvider.callCount).toEqual(1);

    const result = mpk.getLines();
    expect(result).toEqual(linesProvider.data);
  });
});
