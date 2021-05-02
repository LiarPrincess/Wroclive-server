import { Line } from '../../..';
import { Vehicle } from '../../models';
import { calculateDistanceInMeters } from '../../math';

import {
  LineLocationsFactory,
  minMovementToUpdateHeading
} from '../LineLocationsFactory';
import {
  VehicleFilter,
  AcceptAllVehicles
} from '../../vehicle-filters';

const timestamp = 'SOME_UNIQUE_VALUE';
const lineA: Line = { name: 'A', type: 'Bus', subtype: 'Express' };
const line124: Line = { name: '124', type: 'Bus', subtype: 'Regular' };
const line257: Line = { name: '257', type: 'Bus', subtype: 'Night' };

const acceptAllVehiclesFilter = new AcceptAllVehicles();

describe('calculateVehicleLocationUpdates', function () {

  it('should point north if no previous location is present', function () {
    const factory = new LineLocationsFactory(acceptAllVehiclesFilter);

    const lines = { timestamp, data: [lineA, line124, line257] };
    const vehicles: Vehicle[] = [
      { id: '1', line: '124', lat: 1, lng: 2 },
      { id: '2', line: 'A', lat: 3, lng: 4 }
    ];

    const result = factory.create(lines, vehicles);
    expect(result).toStrictEqual([
      { line: line124, vehicles: [{ id: '1', lat: 1, lng: 2, angle: 0 }] },
      { line: lineA, vehicles: [{ id: '2', lat: 3, lng: 4, angle: 0 }] }
    ]);
  });

  it('should calculate new heading if vehicle has moved', function () {
    // Check if values in this test are correct:
    const coordinateBefore = 5.0;
    const coordinateAfter = 6.0;
    const movement = calculateDistanceInMeters(coordinateBefore, coordinateBefore, coordinateAfter, coordinateAfter);
    expect(movement).toBeGreaterThan(minMovementToUpdateHeading);

    // Start real test:
    const factory = new LineLocationsFactory(acceptAllVehiclesFilter);
    const lines = { timestamp, data: [lineA, line124, line257] };

    const vehicles1: Vehicle[] = [
      { id: '1', line: '124', lat: coordinateBefore, lng: coordinateBefore },
      { id: '2', line: 'A', lat: 10, lng: 15 }
    ];

    const result1 = factory.create(lines, vehicles1);
    expect(result1).toStrictEqual([
      { line: line124, vehicles: [{ id: '1', lat: coordinateBefore, lng: coordinateBefore, angle: 0 }] },
      { line: lineA, vehicles: [{ id: '2', lat: 10, lng: 15, angle: 0 }] }
    ]);

    const vehicles2: Vehicle[] = [
      { id: '1', line: '124', lat: coordinateAfter, lng: coordinateAfter }, // this one has moved
      { id: '2', line: 'A', lat: 10, lng: 15 } // this one is the same
    ];

    const result2 = factory.create(lines, vehicles2);
    expect(result2).toStrictEqual([
      { line: line124, vehicles: [{ id: '1', lat: coordinateAfter, lng: coordinateAfter, angle: 44.82097166321205 }] },
      { line: lineA, vehicles: [{ id: '2', lat: 10, lng: 15, angle: 0 }] }
    ]);
  });

  it('should use previous heading if vehicle has not moved (or moved a little)', function () {
    // Check if values in this test are correct:
    const coordinateBefore = 5.0;
    const coordinateAfter = 5.0001;
    const movement = calculateDistanceInMeters(coordinateBefore, coordinateBefore, coordinateAfter, coordinateAfter);
    expect(movement).toBeLessThan(minMovementToUpdateHeading);

    // Start real test:
    const factory = new LineLocationsFactory(acceptAllVehiclesFilter);
    const lines = { timestamp, data: [lineA, line124, line257] };

    const vehicles1: Vehicle[] = [
      { id: '1', line: '124', lat: coordinateBefore, lng: coordinateBefore },
      { id: '2', line: 'A', lat: 10, lng: 15 }
    ];

    const result1 = factory.create(lines, vehicles1);
    expect(result1).toStrictEqual([
      { line: line124, vehicles: [{ id: '1', lat: coordinateBefore, lng: coordinateBefore, angle: 0 }] },
      { line: lineA, vehicles: [{ id: '2', lat: 10, lng: 15, angle: 0 }] }
    ]);

    const vehicles2: Vehicle[] = [
      { id: '1', line: '124', lat: coordinateAfter, lng: coordinateAfter },
      { id: '2', line: 'A', lat: 10, lng: 15 } // this one is the same
    ];

    const result2 = factory.create(lines, vehicles2);
    expect(result2).toStrictEqual([
      { line: line124, vehicles: [{ id: '1', lat: coordinateAfter, lng: coordinateAfter, angle: 0 }] },
      { line: lineA, vehicles: [{ id: '2', lat: 10, lng: 15, angle: 0 }] }
    ]);
  });

  it('should group vehicles for the same line', function () {
    const factory = new LineLocationsFactory(acceptAllVehiclesFilter);
    const lines = { timestamp, data: [lineA, line124, line257] };

    const vehicles: Vehicle[] = [
      { id: '1', line: '124', lat: 1, lng: 2 },
      { id: '2', line: 'A', lat: 3, lng: 4 },
      { id: '3', line: '124', lat: 5, lng: 6 },
      { id: '4', line: '257', lat: 7, lng: 8 }
    ];

    const result = factory.create(lines, vehicles);
    expect(result).toStrictEqual([
      {
        line: line124,
        vehicles: [
          { id: '1', lat: 1, lng: 2, angle: 0 },
          { id: '3', lat: 5, lng: 6, angle: 0 }
        ]
      },
      {
        line: lineA,
        vehicles: [{ id: '2', lat: 3, lng: 4, angle: 0 }]
      },
      {
        line: line257,
        vehicles: [{ id: '4', lat: 7, lng: 8, angle: 0 }]
      },
    ]);
  });

  it('should create artificial line if line was not found', function () {
    const factory = new LineLocationsFactory(acceptAllVehiclesFilter);
    const lines = { timestamp, data: [lineA] };

    const vehicles: Vehicle[] = [
      { id: '1', line: '124', lat: 1, lng: 2 },
      { id: '2', line: 'A', lat: 3, lng: 4 },
      { id: '3', line: '257', lat: 5, lng: 6 }
    ];

    const result = factory.create(lines, vehicles);
    expect(result).toStrictEqual([
      { line: line124, vehicles: [{ id: '1', lat: 1, lng: 2, angle: 0 }] },
      { line: lineA, vehicles: [{ id: '2', lat: 3, lng: 4, angle: 0 }] },
      { line: line257, vehicles: [{ id: '3', lat: 5, lng: 6, angle: 0 }] }
    ]);
  });

  it('should use provided vehicle filter', function () {
    class AcceptOnlyA implements VehicleFilter {
      prepareForFilteringCallCount = 0;
      isAcceptedCallCount = 0;

      prepareForFiltering(): void {
        this.prepareForFilteringCallCount += 1;
      }

      isAccepted(vehicle: Vehicle, line: Line): boolean {
        this.isAcceptedCallCount += 1;
        return line.name == lineA.name;
      }
    }

    const filter = new AcceptOnlyA();
    const factory = new LineLocationsFactory(filter);
    const lines = { timestamp, data: [lineA, line124, line257] };

    const vehicles: Vehicle[] = [
      { id: '1', line: '124', lat: 1, lng: 2 },
      { id: '2', line: 'A', lat: 3, lng: 4 },
      { id: '4', line: '257', lat: 5, lng: 6 }
    ];

    const result = factory.create(lines, vehicles);
    expect(result).toStrictEqual([
      { line: lineA, vehicles: [{ id: '2', lat: 3, lng: 4, angle: 0 }] }
    ]);

    expect(filter.prepareForFilteringCallCount).toEqual(1);
    expect(filter.isAcceptedCallCount).toEqual(3);
  });
});
