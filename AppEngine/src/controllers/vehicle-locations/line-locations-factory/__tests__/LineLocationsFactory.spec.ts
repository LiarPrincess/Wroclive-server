import { Line, LineCollection } from '../../..';
import { VehicleFilter, AcceptAllVehicles } from '../../vehicle-filters';
import { LineData, LineLocations, Vehicle, VehicleLocation } from '../../models';
import { calculateDistanceInMeters } from '../../math';

import {
  LineLocationsFactory,
  minMovementToUpdateHeading
} from '../LineLocationsFactory';

const timestamp = 'SOME_UNIQUE_VALUE';

/* =============== */
/* === Filters === */
/* =============== */

const acceptAllVehiclesFilter = new AcceptAllVehicles();

/* ============ */
/* === Line === */
/* ============ */

/**
 * Augument 'Line' with 'data: LineData'.
 */
class TestLine extends Line {

  readonly data: LineData;

  constructor(name: string, type: string, subtype: string) {
    super(name, type, subtype, undefined);
    this.data = new LineData(name, type, subtype);
  }
}

const lineA = new TestLine('A', 'Bus', 'Express');
const line124 = new TestLine('124', 'Bus', 'Regular');
const line257 = new TestLine('257', 'Bus', 'Night');

/* ================ */
/* === Vehicles === */
/* ================ */

/**
 * Augument 'Vehicle' to easly create 'VehicleLocation'.
 */
class TestVehicle extends Vehicle {

  constructor(id: string, line: TestLine, coordinate: number) {
    super(id, line.name, coordinate, coordinate);
  }

  withAngle(angle: number): VehicleLocation {
    return new VehicleLocation(this.id, this.lat, this.lng, angle);
  }
}

/* ================ */
/* === Main === */
/* ================ */

describe('LineLocationsFactory', function () {

  it('should point north if no previous location is present', function () {
    const factory = new LineLocationsFactory(acceptAllVehiclesFilter);

    const lines = new LineCollection(timestamp, [lineA, line124, line257]);
    const vehicle124 = new TestVehicle('1', line124, 1.0);
    const vehicleA = new TestVehicle('2', lineA, 2.0);
    const vehicles: Vehicle[] = [vehicle124, vehicleA];

    const result = factory.create(lines, vehicles);
    expect(result).toStrictEqual([
      new LineLocations(line124.data, [vehicle124.withAngle(0)]),
      new LineLocations(lineA.data, [vehicleA.withAngle(0)])
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
    const lines = new LineCollection(timestamp, [lineA, line124, line257]);

    const vehicleMovedBefore = new TestVehicle('1', line124, coordinateBefore);
    const vehicleMovedAfter = new TestVehicle('1', line124, coordinateAfter);
    const vehicleNotMoved = new TestVehicle('2', lineA, 10);

    const vehiclesBefore = [vehicleMovedBefore, vehicleNotMoved];
    const resultBefore = factory.create(lines, vehiclesBefore);
    expect(resultBefore).toStrictEqual([
      new LineLocations(line124.data, [vehicleMovedBefore.withAngle(0)]),
      new LineLocations(lineA.data, [vehicleNotMoved.withAngle(0)])
    ]);

    const vehiclesAfter = [vehicleMovedAfter, vehicleNotMoved];
    const resultAfter = factory.create(lines, vehiclesAfter);
    expect(resultAfter).toStrictEqual([
      new LineLocations(line124.data, [vehicleMovedAfter.withAngle(44.82097166321205)]),
      new LineLocations(lineA.data, [vehicleNotMoved.withAngle(0)])
    ]);
  });

  it('should use previous heading if vehicle has not moved (or moved a little)', function () {
    // 1. move big -> calculate angle
    // 2. move small -> angle should stay the same << THIS is the actuall test
    const coordinateInitial = 0.0;
    const coordinateAfterBigMove = 5.0;
    const coordinateAfterSmallMove = 5.0001;

    // Check if values in this test are correct:
    const movement = calculateDistanceInMeters(coordinateAfterBigMove, coordinateAfterBigMove, coordinateAfterSmallMove, coordinateAfterSmallMove);
    expect(movement).toBeLessThan(minMovementToUpdateHeading);

    // Start of a real test:
    const factory = new LineLocationsFactory(acceptAllVehiclesFilter);
    const lines = new LineCollection(timestamp, [lineA, line124, line257]);

    const vehicleMovedInitial = new TestVehicle('1', line124, coordinateInitial);
    const vehicleMovedBig = new TestVehicle('1', line124, coordinateAfterBigMove);
    const vehicleMovedSmall = new TestVehicle('1', line124, coordinateAfterSmallMove);
    const vehicleNotMoved = new TestVehicle('2', lineA, 10);

    // Initial position
    const vehiclesInitial = [vehicleMovedInitial, vehicleNotMoved];
    const resultInitial = factory.create(lines, vehiclesInitial);
    expect(resultInitial).toStrictEqual([
      new LineLocations(line124.data, [vehicleMovedInitial.withAngle(0)]),
      new LineLocations(lineA.data, [vehicleNotMoved.withAngle(0)])
    ]);

    // Big move to calculate angle
    const vehiclesAfterBigMove = [vehicleMovedBig, vehicleNotMoved];
    const resultAfterBigMove = factory.create(lines, vehiclesAfterBigMove);
    expect(resultAfterBigMove).toStrictEqual([
      new LineLocations(line124.data, [vehicleMovedBig.withAngle(44.89077845200745)]),
      new LineLocations(lineA.data, [vehicleNotMoved.withAngle(0)])
    ]);

    // Small move that should not change angle
    const vehiclesAfterSmallMove = [vehicleMovedSmall, vehicleNotMoved];
    const resultAfterSmallMove = factory.create(lines, vehiclesAfterSmallMove);
    expect(resultAfterSmallMove).toStrictEqual([
      new LineLocations(line124.data, [vehicleMovedSmall.withAngle(44.89077845200745)]), // No change
      new LineLocations(lineA.data, [vehicleNotMoved.withAngle(0)])
    ]);
  });

  it('should group vehicles for the same line', function () {
    const factory = new LineLocationsFactory(acceptAllVehiclesFilter);
    const lines = new LineCollection(timestamp, [lineA, line124, line257]);

    const vehicle124_1 = new TestVehicle('1', line124, 1);
    const vehicleA = new TestVehicle('2', lineA, 3);
    const vehicle124_2 = new TestVehicle('3', line124, 5);
    const vehicle257 = new TestVehicle('4', line257, 7);
    const vehicles: Vehicle[] = [vehicle124_1, vehicleA, vehicle124_2, vehicle257];

    const result = factory.create(lines, vehicles);
    expect(result).toStrictEqual([
      new LineLocations(line124.data, [vehicle124_1.withAngle(0), vehicle124_2.withAngle(0)]),
      new LineLocations(lineA.data, [vehicleA.withAngle(0)]),
      new LineLocations(line257.data, [vehicle257.withAngle(0)])
    ]);
  });

  it('should create artificial line if line was not found', function () {
    const factory = new LineLocationsFactory(acceptAllVehiclesFilter);
    const lines = new LineCollection(timestamp, [lineA]);

    const vehicle124 = new TestVehicle('1', line124, 1);
    const vehicleA = new TestVehicle('2', lineA, 3); // We only have this line
    const vehicle257 = new TestVehicle('3', line257, 5);
    const vehicles = [vehicle124, vehicleA, vehicle257];

    const result = factory.create(lines, vehicles);
    expect(result).toStrictEqual([
      new LineLocations(line124.data, [vehicle124.withAngle(0)]),
      new LineLocations(lineA.data, [vehicleA.withAngle(0)]),
      new LineLocations(line257.data, [vehicle257.withAngle(0)])
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
    const lines = new LineCollection(timestamp, [lineA, line124, line257]);

    const vehicle124 = new TestVehicle('1', line124, 1);
    const vehicleA = new TestVehicle('2', lineA, 3);
    const vehicle257 = new TestVehicle('4', line257, 5);
    const vehicles: Vehicle[] = [vehicle124, vehicleA, vehicle257];

    const result = factory.create(lines, vehicles);
    expect(result).toStrictEqual([
      new LineLocations(lineA.data, [vehicleA.withAngle(0)])
    ]);

    expect(filter.prepareForFilteringCallCount).toEqual(1);
    expect(filter.isAcceptedCallCount).toEqual(vehicles.length);
  });
});
