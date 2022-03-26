import { AngleCalculatorMock } from './Mocks';
import {
  minMovementToUpdateHeading,
  locationExpirationInMilliseconds
} from '../AngleCalculatorBase';
import { VehicleLocationFromApi } from '../../models';
import { calculateDistanceInMeters } from '../../helpers';

const vehicle1Initial = new VehicleLocationFromApi('1', 'LINE', 5.0, 5.0);
const vehicle1SmallMove = new VehicleLocationFromApi('1', 'LINE', 5.0001, 5.0001);
const vehicle1BigMove = new VehicleLocationFromApi('1', 'LINE', 6.0, 6.0);
const vehicle1BigMoveThenSmall = new VehicleLocationFromApi('1', 'LINE', 6.0001, 6.0001);

const vehicle2Initial = new VehicleLocationFromApi('2', 'LINE', -5.0, -5.0);
const vehicle2SmallMove = new VehicleLocationFromApi('2', 'LINE', -5.0001, -5.0001);

let date: Date = new Date(0);

function getDate(): Date {
  return date;
}

function calculateDistanceInMetersForVehicles(
  before: VehicleLocationFromApi,
  after: VehicleLocationFromApi
): number {
  return calculateDistanceInMeters(before.lat, before.lng, after.lat, after.lng);
}

describe('AngleCalculatorBase-GET', function () {

  it('has correct test values', function () {
    const small1 = calculateDistanceInMetersForVehicles(vehicle1Initial, vehicle1SmallMove);
    expect(small1).toBeLessThan(minMovementToUpdateHeading);

    const big1 = calculateDistanceInMetersForVehicles(vehicle1Initial, vehicle1BigMove);
    expect(big1).toBeGreaterThan(minMovementToUpdateHeading);

    const bigThenSmall1 = calculateDistanceInMetersForVehicles(vehicle1BigMove, vehicle1BigMoveThenSmall);
    expect(bigThenSmall1).toBeLessThan(minMovementToUpdateHeading);

    const small2 = calculateDistanceInMetersForVehicles(vehicle2Initial, vehicle2SmallMove);
    expect(small2).toBeLessThan(minMovementToUpdateHeading);
  });

  it('[Vehicle not in database] Points north if no previous location is present', async function () {
    const calculator = new AngleCalculatorMock(getDate);
    calculator.getFromDatabaseResult[vehicle1Initial.id] = undefined;

    date = new Date(0);
    calculator.prepareForAngleCalculation();

    const result = await calculator.calculateAngle(vehicle1Initial);
    expect(result).toEqual(0.0);
    expect(calculator.getFromDatabaseCallCount).toEqual(1);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);
  });

  it('[Vehicle in database] Takes heading from database if within time-frame', async function () {
    const calculator = new AngleCalculatorMock(getDate);
    calculator.getFromDatabaseResult[vehicle1Initial.id] = {
      lat: vehicle1Initial.lat,
      lng: vehicle1Initial.lng,
      angle: 27.83,
      millisecondsSince1970: 0
    };

    // Not enough movement to update heading -> the same as database.
    date = new Date(locationExpirationInMilliseconds / 2);
    calculator.prepareForAngleCalculation();
    const smallMove = await calculator.calculateAngle(vehicle1SmallMove);
    expect(smallMove).toEqual(27.83);
    expect(calculator.getFromDatabaseCallCount).toEqual(1);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);

    // Moved -> calculate new.
    date = new Date(locationExpirationInMilliseconds);
    calculator.prepareForAngleCalculation();
    const bigMove = await calculator.calculateAngle(vehicle1BigMove);
    expect(bigMove).toEqual(44.82097166321205);
    expect(calculator.getFromDatabaseCallCount).toEqual(1);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);
  });

  it('[Vehicle in database] Points north if data from database is after time-frame', async function () {
    const calculator = new AngleCalculatorMock(getDate);
    calculator.getFromDatabaseResult[vehicle1Initial.id] = {
      lat: vehicle1Initial.lat,
      lng: vehicle1Initial.lng,
      angle: 1.0,
      millisecondsSince1970: 0
    };

    // After time frame -> start from scratch.
    date = new Date(locationExpirationInMilliseconds + 1);
    calculator.prepareForAngleCalculation();
    const bigMove = await calculator.calculateAngle(vehicle1BigMove);
    expect(bigMove).toEqual(0.0);
    expect(calculator.getFromDatabaseCallCount).toEqual(1);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);
  });

  it('[Vehicle not in database] Initial -> move within time-frame [UPDATE] -> move after time-frame [NO UPDATE]', async function () {
    const calculator = new AngleCalculatorMock(getDate);
    calculator.getFromDatabaseResult[vehicle1Initial.id] = undefined;

    // Initial, angle: 0
    date = new Date(0);
    calculator.prepareForAngleCalculation();
    const initial = await calculator.calculateAngle(vehicle1Initial);
    expect(initial).toEqual(0.0);
    expect(calculator.getFromDatabaseCallCount).toEqual(1);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);

    // Move WITHIN time frame, angle: CALCULATED
    date = new Date(locationExpirationInMilliseconds);
    calculator.prepareForAngleCalculation();
    const bigMove = await calculator.calculateAngle(vehicle1BigMove);
    expect(bigMove).toEqual(44.82097166321205);
    expect(calculator.getFromDatabaseCallCount).toEqual(1);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);

    // Move AFTER time frame, angle: 0.0
    date = new Date(2 * locationExpirationInMilliseconds + 1);
    calculator.prepareForAngleCalculation();
    const backToInitial = await calculator.calculateAngle(vehicle1Initial);
    expect(backToInitial).toEqual(0.0);
    expect(calculator.getFromDatabaseCallCount).toEqual(1);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);
  });

  it('[Vehicle not in database] Initial -> small move within time-frame [NO UPDATE] -> move within time-frame [UPDATE]', async function () {
    const calculator = new AngleCalculatorMock(getDate);
    calculator.getFromDatabaseResult[vehicle1Initial.id] = undefined;

    // Initial, angle: 0
    date = new Date(0);
    calculator.prepareForAngleCalculation();
    const initial = await calculator.calculateAngle(vehicle1Initial);
    expect(initial).toEqual(0.0);
    expect(calculator.getFromDatabaseCallCount).toEqual(1);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);

    // Move WITHIN time frame, but less than required, angle: 0.0
    date = new Date(locationExpirationInMilliseconds / 2);
    calculator.prepareForAngleCalculation();
    const smallMove = await calculator.calculateAngle(vehicle1SmallMove);
    expect(smallMove).toEqual(0.0);
    expect(calculator.getFromDatabaseCallCount).toEqual(1);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);

    // Move WITHIN time frame, angle: CALCULATED
    date = new Date(locationExpirationInMilliseconds);
    calculator.prepareForAngleCalculation();
    const backToInitial = await calculator.calculateAngle(vehicle1BigMove);
    expect(backToInitial).toEqual(44.82097166321205);
    expect(calculator.getFromDatabaseCallCount).toEqual(1);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);
  });

  it('differentiates vehicles', async function () {
    const calculator = new AngleCalculatorMock(getDate);
    calculator.getFromDatabaseResult[vehicle1Initial.id] = undefined;
    calculator.getFromDatabaseResult[vehicle2Initial.id] = undefined;

    // Initial
    date = new Date(0);
    calculator.prepareForAngleCalculation();
    const initial1 = await calculator.calculateAngle(vehicle1Initial);
    expect(initial1).toEqual(0.0);
    const initial2 = await calculator.calculateAngle(vehicle2Initial);
    expect(initial2).toEqual(0.0);

    // Vehicle1: Big move - angle changed
    // Vehicle2: Small move - angle not changed
    date = new Date(locationExpirationInMilliseconds / 2);
    calculator.prepareForAngleCalculation();
    const bigMove1 = await calculator.calculateAngle(vehicle1BigMove);
    expect(bigMove1).toEqual(44.82097166321205);
    const smallMove2 = await calculator.calculateAngle(vehicle2SmallMove);
    expect(smallMove2).toEqual(0.0);

    // Vehicle1: Small move - angle changed
    date = new Date(locationExpirationInMilliseconds);
    calculator.prepareForAngleCalculation();
    const bigMoveThenSmall1 = await calculator.calculateAngle(vehicle1BigMoveThenSmall);
    expect(bigMoveThenSmall1).toEqual(44.82097166321205);
  });
});
