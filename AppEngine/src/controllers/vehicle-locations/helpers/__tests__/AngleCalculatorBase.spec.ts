import {
  AngleCalculatorBase,
  VehicleIdToLastAngleUpdateLocation,
  minMovementToUpdateHeading
} from '../AngleCalculatorBase';
import { VehicleLocationFromApi } from '../../models';
import { calculateDistanceInMeters } from '../../helpers';

const vehicle1Initial = new VehicleLocationFromApi('1', 'LINE', 5.0, 5.0);
const vehicle1BigMove = new VehicleLocationFromApi('1', 'LINE', 6.0, 6.0);
const vehicle1BigMoveThenSmall = new VehicleLocationFromApi('1', 'LINE', 6.0001, 6.0001);

const vehicle2Initial = new VehicleLocationFromApi('2', 'LINE', -5.0, -5.0);
const vehicle2SmallMove = new VehicleLocationFromApi('2', 'LINE', -5.0001, -5.0001);

function calculateDistanceInMetersForVehicles(
  before: VehicleLocationFromApi,
  after: VehicleLocationFromApi
): number {
  return calculateDistanceInMeters(before.lat, before.lng, after.lat, after.lng);
}

class AngleCalculator extends AngleCalculatorBase {

  public databaseVehicleIdToLastAngleUpdateLocation: VehicleIdToLastAngleUpdateLocation = {};

  public async getLastVehicleAngleUpdateLocationsFromDatabase(): Promise<VehicleIdToLastAngleUpdateLocation | undefined> {
    return this.databaseVehicleIdToLastAngleUpdateLocation;
  }
}

describe('AngleCalculatorBase', function () {

  it('has correct test values', function () {
    const big1 = calculateDistanceInMetersForVehicles(vehicle1Initial, vehicle1BigMove);
    expect(big1).toBeGreaterThan(minMovementToUpdateHeading);

    const bigThenSmall1 = calculateDistanceInMetersForVehicles(vehicle1BigMove, vehicle1BigMoveThenSmall);
    expect(bigThenSmall1).toBeLessThan(minMovementToUpdateHeading);

    const small2 = calculateDistanceInMetersForVehicles(vehicle2Initial, vehicle2SmallMove);
    expect(small2).toBeLessThan(minMovementToUpdateHeading);
  });

  it('should point north if no previous location is present', async function () {
    const calculator = new AngleCalculator();
    calculator.databaseVehicleIdToLastAngleUpdateLocation[vehicle1Initial.id] = undefined;
    const result = await calculator.calculateAngle(vehicle1Initial);
    expect(result).toEqual(0.0);
  });

  it('should calculate new heading if vehicle has moved', async function () {
    const calculator = new AngleCalculator();

    const initial = await calculator.calculateAngle(vehicle1Initial);
    expect(initial).toEqual(0.0);

    const bigMove = await calculator.calculateAngle(vehicle1BigMove);
    expect(bigMove).toEqual(44.82097166321205);
  });

  it('should calculate new heading if vehicle has moved according to database', async function () {
    const calculator = new AngleCalculator();

    calculator.databaseVehicleIdToLastAngleUpdateLocation[vehicle1Initial.id] = {
      lat: vehicle1Initial.lat,
      lng: vehicle1Initial.lng,
      angle: 1.0
    };

    const bigMove = await calculator.calculateAngle(vehicle1BigMove);
    expect(bigMove).toEqual(44.82097166321205);
  });

  it('should use previous heading if vehicle has not moved (or moved a little)', async function () {
    const calculator = new AngleCalculator();

    const initial = await calculator.calculateAngle(vehicle1Initial);
    expect(initial).toEqual(0.0);

    // Big move to calculate angle
    const bigMove = await calculator.calculateAngle(vehicle1BigMove);
    expect(bigMove).toEqual(44.82097166321205);

    // Small move that should not change angle << this is the real test!
    const bigMoveThenSmall = await calculator.calculateAngle(vehicle1BigMoveThenSmall);
    expect(bigMoveThenSmall).toEqual(44.82097166321205);
  });

  it('differentiates vehicles', async function () {
    const calculator = new AngleCalculator();

    // Initial
    const initial1 = await calculator.calculateAngle(vehicle1Initial);
    expect(initial1).toEqual(0.0);

    const initial2 = await calculator.calculateAngle(vehicle2Initial);
    expect(initial2).toEqual(0.0);

    // Big move vehicle1 - angle changed
    const bigMove1 = await calculator.calculateAngle(vehicle1BigMove);
    expect(bigMove1).toEqual(44.82097166321205);

    // Small move vehicle2 - angle not changed
    const smallMove2 = await calculator.calculateAngle(vehicle2SmallMove);
    expect(smallMove2).toEqual(0.0);

    // Small move vehicle1 - angle changed
    const bigMoveThenSmall1 = await calculator.calculateAngle(vehicle1BigMoveThenSmall);
    expect(bigMoveThenSmall1).toEqual(44.82097166321205);
  });
});
