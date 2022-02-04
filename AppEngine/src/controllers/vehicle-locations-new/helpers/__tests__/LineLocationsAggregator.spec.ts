import { LineLocationsAggregator } from '../LineLocationsAggregator';
import { Line, VehicleLocation } from '../../models';

const lineA = new Line('A', 'Bus', 'Express');
const line4 = new Line('4', 'Tram', 'Regular');
const line125 = new Line('125', 'Bus', 'Regular');

const vehicle1 = new VehicleLocation('1', 3, 5, 7);
const vehicle2 = new VehicleLocation('2', 11, 13, 17);
const vehicle3 = new VehicleLocation('3', 19, 23, 29);

describe('LineLocationsAggregator', function () {

  it('return empty lines when no vehicle was added', function () {
    const aggregator = new LineLocationsAggregator();
    const result = aggregator.getLineLocations();
    expect(result).toEqual([]);
  });

  it('different lines are differentiated', function () {
    const aggregator = new LineLocationsAggregator();

    aggregator.addVehicle(lineA, vehicle1);
    aggregator.addVehicle(line4, vehicle2);
    aggregator.addVehicle(line125, vehicle3);

    const result = aggregator.getLineLocations();
    expect(result).toEqual([
      { line: lineA, vehicles: [vehicle1] },
      { line: line4, vehicles: [vehicle2] },
      { line: line125, vehicles: [vehicle3] },
    ]);
  });

  it('same lines are merged', function () {
    const aggregator = new LineLocationsAggregator();

    aggregator.addVehicle(lineA, vehicle1);
    aggregator.addVehicle(line125, vehicle2);
    aggregator.addVehicle(lineA, vehicle3);

    const result = aggregator.getLineLocations();
    expect(result).toEqual([
      { line: lineA, vehicles: [vehicle1, vehicle3] },
      { line: line125, vehicles: [vehicle2] }
    ]);
  });
});
