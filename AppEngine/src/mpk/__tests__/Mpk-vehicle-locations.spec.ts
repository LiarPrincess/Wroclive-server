import { Mpk } from '../index';
import { FakeLinesProvider, FakeStopsProvider, FakeVehicleLocationProvider } from './fakes';
import { createConsoleLogger } from '../../util/index';

const logger = createConsoleLogger();

describe('getVehicleLocations', () => {

  it('should return data from provider', async () => {
    const linesProvider = new FakeLinesProvider();
    const stopsProvider = new FakeStopsProvider();
    const vehicleLocationProvider = new FakeVehicleLocationProvider();
    const mpk = new Mpk(linesProvider, stopsProvider, [vehicleLocationProvider], logger);

    // We need lines.
    linesProvider.data = {
      timestamp: 'TIMESTAMP_LINES',
      data: [
        { name: 'A', type: 'Bus', subtype: 'Express', stopArrivalTimes: undefined },
        { name: '124', type: 'Bus', subtype: 'Regular', stopArrivalTimes: undefined },
        { name: '257', type: 'Bus', subtype: 'Night', stopArrivalTimes: undefined }
      ]
    };

    await mpk.updateLines();
    expect(linesProvider.callCount).toEqual(1);

    vehicleLocationProvider.data = [
      { id: '123', line: 'A', lat: 1, lng: 2 },
      { id: '456', line: '124', lat: 3, lng: 4 },
      { id: '789', line: '257', lat: 5, lng: 6 },
      { id: '012', line: '257', lat: 7, lng: 8 }
    ];

    const timestamp = 'TIMESTAMP';
    await mpk.updateVehicleLocations(timestamp);
    expect(vehicleLocationProvider.callCount).toEqual(1);

    const lineNamesLowerCase = new Set(['a', '257']);
    const result = mpk.getVehicleLocations(lineNamesLowerCase);
    expect(result).toEqual(
      {
        timestamp,
        data: [
          {
            line: { name: 'A', type: 'Bus', subtype: 'Express' },
            vehicles: [
              { id: '123', lat: 1, lng: 2, angle: 0 }
            ]
          },
          {
            line: { name: '257', type: 'Bus', subtype: 'Night' },
            vehicles: [
              { id: '789', lat: 5, lng: 6, angle: 0 },
              { id: '012', lat: 7, lng: 8, angle: 0 }
            ]
          }
        ]
      }
    );
  });
});
