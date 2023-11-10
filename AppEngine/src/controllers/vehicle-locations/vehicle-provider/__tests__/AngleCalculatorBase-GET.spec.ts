import { VehicleProviderDatabaseMock as DatabaseMock } from "../VehicleProviderDatabase";
import { AngleCalculator, minMovementToUpdateHeading, locationExpirationInMilliseconds } from "../AngleCalculator";
import { VehicleLocationFromApi } from "../../models";
import { calculateDistanceInMeters } from "../../helpers";

const vehicle1Initial = new VehicleLocationFromApi("1", "LINE", 5.0, 5.0);
const vehicle1SmallMove = new VehicleLocationFromApi("1", "LINE", 5.0001, 5.0001);
const vehicle1BigMove = new VehicleLocationFromApi("1", "LINE", 6.0, 6.0);
const vehicle1BigMoveThenSmall = new VehicleLocationFromApi("1", "LINE", 6.0001, 6.0001);

const vehicle2Initial = new VehicleLocationFromApi("2", "LINE", -5.0, -5.0);
const vehicle2SmallMove = new VehicleLocationFromApi("2", "LINE", -5.0001, -5.0001);

function calculateDistanceInMetersForVehicles(before: VehicleLocationFromApi, after: VehicleLocationFromApi): number {
  return calculateDistanceInMeters(before.lat, before.lng, after.lat, after.lng);
}

function createAngleCalculator(): [AngleCalculator, DatabaseMock] {
  const database = new DatabaseMock();
  const calculator = new AngleCalculator(database);
  return [calculator, database];
}

describe("AngleCalculatorBase-GET", function () {
  it("has correct test values", function () {
    const small1 = calculateDistanceInMetersForVehicles(vehicle1Initial, vehicle1SmallMove);
    expect(small1).toBeLessThan(minMovementToUpdateHeading);

    const big1 = calculateDistanceInMetersForVehicles(vehicle1Initial, vehicle1BigMove);
    expect(big1).toBeGreaterThan(minMovementToUpdateHeading);

    const bigThenSmall1 = calculateDistanceInMetersForVehicles(vehicle1BigMove, vehicle1BigMoveThenSmall);
    expect(bigThenSmall1).toBeLessThan(minMovementToUpdateHeading);

    const small2 = calculateDistanceInMetersForVehicles(vehicle2Initial, vehicle2SmallMove);
    expect(small2).toBeLessThan(minMovementToUpdateHeading);
  });

  it("[Vehicle not in database] Points north if no previous location is present", async function () {
    const [calculator, database] = createAngleCalculator();

    const date = new Date(0);
    const result = await calculator.calculateAngle(date, vehicle1Initial);
    expect(result).toEqual(0.0);
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);
  });

  it("[Vehicle in database] Takes heading from database if within time-frame", async function () {
    const [calculator, database] = createAngleCalculator();

    database.getAngleLocationsResult[vehicle1Initial.id] = {
      lat: vehicle1Initial.lat,
      lng: vehicle1Initial.lng,
      angle: 27.83,
      millisecondsSince1970: 0,
    };

    // Not enough movement to update heading -> the same as database.
    let date = new Date(locationExpirationInMilliseconds / 2);
    const smallMove = await calculator.calculateAngle(date, vehicle1SmallMove);
    expect(smallMove).toEqual(27.83);
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);

    // Moved -> calculate new.
    date = new Date(locationExpirationInMilliseconds);
    const bigMove = await calculator.calculateAngle(date, vehicle1BigMove);
    expect(bigMove).toEqual(44.82097166321205);
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);
  });

  it("[Vehicle in database] Points north if data from database is after time-frame", async function () {
    const [calculator, database] = createAngleCalculator();

    database.getAngleLocationsResult[vehicle1Initial.id] = {
      lat: vehicle1Initial.lat,
      lng: vehicle1Initial.lng,
      angle: 1.0,
      millisecondsSince1970: 0,
    };

    // After time frame -> start from scratch.
    const date = new Date(locationExpirationInMilliseconds + 1);
    const bigMove = await calculator.calculateAngle(date, vehicle1BigMove);
    expect(bigMove).toEqual(0.0);
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);
  });

  it("[Vehicle not in database] Initial -> move within time-frame [UPDATE] -> move after time-frame [NO UPDATE]", async function () {
    const [calculator, database] = createAngleCalculator();
    database.getAngleLocationsResult[vehicle1Initial.id] = undefined;

    // Initial, angle: 0
    let date = new Date(0);
    const initial = await calculator.calculateAngle(date, vehicle1Initial);
    expect(initial).toEqual(0.0);
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);

    // Move WITHIN time frame, angle: CALCULATED
    date = new Date(locationExpirationInMilliseconds);
    const bigMove = await calculator.calculateAngle(date, vehicle1BigMove);
    expect(bigMove).toEqual(44.82097166321205);
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);

    // Move AFTER time frame, angle: 0.0
    date = new Date(2 * locationExpirationInMilliseconds + 1);
    const backToInitial = await calculator.calculateAngle(date, vehicle1Initial);
    expect(backToInitial).toEqual(0.0);
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);
  });

  it("[Vehicle not in database] Initial -> small move within time-frame [NO UPDATE] -> move within time-frame [UPDATE]", async function () {
    const [calculator, database] = createAngleCalculator();

    database.getAngleLocationsResult[vehicle1Initial.id] = undefined;

    // Initial, angle: 0
    let date = new Date(0);
    const initial = await calculator.calculateAngle(date, vehicle1Initial);
    expect(initial).toEqual(0.0);
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);

    // Move WITHIN time frame, but less than required, angle: 0.0
    date = new Date(locationExpirationInMilliseconds / 2);
    const smallMove = await calculator.calculateAngle(date, vehicle1SmallMove);
    expect(smallMove).toEqual(0.0);
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);

    // Move WITHIN time frame, angle: CALCULATED
    date = new Date(locationExpirationInMilliseconds);
    const backToInitial = await calculator.calculateAngle(date, vehicle1BigMove);
    expect(backToInitial).toEqual(44.82097166321205);
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);
  });

  it("differentiates vehicles", async function () {
    const [calculator, database] = createAngleCalculator();

    database.getAngleLocationsResult[vehicle1Initial.id] = undefined;
    database.getAngleLocationsResult[vehicle2Initial.id] = undefined;

    // Initial
    let date = new Date(0);
    const initial1 = await calculator.calculateAngle(date, vehicle1Initial);
    expect(initial1).toEqual(0.0);
    const initial2 = await calculator.calculateAngle(date, vehicle2Initial);
    expect(initial2).toEqual(0.0);

    // Vehicle1: Big move - angle changed
    // Vehicle2: Small move - angle not changed
    date = new Date(locationExpirationInMilliseconds / 2);
    const bigMove1 = await calculator.calculateAngle(date, vehicle1BigMove);
    expect(bigMove1).toEqual(44.82097166321205);
    const smallMove2 = await calculator.calculateAngle(date, vehicle2SmallMove);
    expect(smallMove2).toEqual(0.0);

    // Vehicle1: Small move - angle changed
    date = new Date(locationExpirationInMilliseconds);
    const bigMoveThenSmall1 = await calculator.calculateAngle(date, vehicle1BigMoveThenSmall);
    expect(bigMoveThenSmall1).toEqual(44.82097166321205);
  });
});
