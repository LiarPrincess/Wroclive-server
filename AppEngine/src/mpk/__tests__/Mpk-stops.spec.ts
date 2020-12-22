import { Mpk } from '../index';
import { FakeLinesProvider, FakeStopsProvider, FakeVehicleLocationProvider } from './fakes';
import { createConsoleLogger } from '../../util/index';

const logger = createConsoleLogger();

describe('getStops', () => {

  it('should return data from provider', async () => {
    const linesProvider = new FakeLinesProvider();
    const stopsProvider = new FakeStopsProvider();
    const vehicleLocationProvider = new FakeVehicleLocationProvider();
    const mpk = new Mpk(linesProvider, stopsProvider, [vehicleLocationProvider], logger);

    stopsProvider.data = {
      timestamp: 'TIMESTAMP',
      data: [
        { name: 'A', code: 'A_code', lat: 1, lon: 2 },
        { name: '124', code: '124_code', lat: 3, lon: 4 },
        { name: '257', code: '257_code', lat: 5, lon: 6 },
      ]
    };

    await mpk.updateStops();
    expect(stopsProvider.callCount).toEqual(1);

    const result = mpk.getStops();
    expect(result).toEqual(stopsProvider.data);
  });
});
