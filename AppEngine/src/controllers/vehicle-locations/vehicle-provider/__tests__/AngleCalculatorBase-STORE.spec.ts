import { VehicleProviderDatabaseMock as DatabaseMock } from "../VehicleProviderDatabase";
import {
  AngleCalculator,
  LastAngleUpdateLocation,
  locationExpirationInMilliseconds,
  storeInDatabaseIntervalInMilliseconds,
} from "../AngleCalculator";
import { VehicleLocationFromApi } from "../../models";

const vehicleId1 = "1";
const vehicleId2 = "2";
const vehicleId3 = "3";

function createAngleCalculator(): [AngleCalculator, DatabaseMock] {
  const database = new DatabaseMock();
  const calculator = new AngleCalculator(database);
  return [calculator, database];
}

async function calculateAngle(calculator: AngleCalculator, vehicleOrId: string | VehicleLocationFromApi, now: number) {
  const date = new Date(now);

  let vehicle: VehicleLocationFromApi;

  if (vehicleOrId instanceof VehicleLocationFromApi) {
    vehicle = vehicleOrId;
  } else {
    vehicle = new VehicleLocationFromApi(vehicleOrId, "A", 5, 7);
  }

  await calculator.calculateAngle(date, vehicle);
}

describe("AngleCalculatorBase-STORE", function () {
  it("Does nothing if there are no locations", async function () {
    const [calculator, database] = createAngleCalculator();

    const date = new Date(0);
    await calculator.saveStateInDatabase(date);
    expect(database.getAngleLocationsCallCount).toEqual(0);
    expect(database.saveAngleLocationsCallCount).toEqual(0);
    expect(database.savedAngleLocations).toBeUndefined();
  });

  it("Does nothing if we recently stored locations", async function () {
    const [calculator, database] = createAngleCalculator();

    const now = storeInDatabaseIntervalInMilliseconds;
    await calculateAngle(calculator, vehicleId1, now);
    await calculateAngle(calculator, vehicleId2, now - locationExpirationInMilliseconds);
    await calculateAngle(calculator, vehicleId3, now - locationExpirationInMilliseconds - 1);

    await calculator.saveStateInDatabase(new Date(now));
    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(0);
    expect(database.savedAngleLocations).toBeUndefined();
  });

  it("Removes vehicles past the expiration date", async function () {
    const [calculator, database] = createAngleCalculator();

    const now = storeInDatabaseIntervalInMilliseconds + 1;

    // Should stay
    const vehicle1 = new VehicleLocationFromApi(vehicleId1, "A", 5, 7);
    await calculateAngle(calculator, vehicle1, now);

    // Should stay
    const vehicle2 = new VehicleLocationFromApi(vehicleId2, "A", 11, 13);
    await calculateAngle(calculator, vehicle2, now - locationExpirationInMilliseconds);

    // Should be removed because of the '-1'.
    const vehicle3 = new VehicleLocationFromApi(vehicleId3, "A", 17, 23);
    await calculateAngle(calculator, vehicle3, now - locationExpirationInMilliseconds - 1);

    const date = new Date(now);
    await calculator.saveStateInDatabase(date);

    expect(database.getAngleLocationsCallCount).toEqual(1);
    expect(database.saveAngleLocationsCallCount).toEqual(1);
    expect(database.savedAngleLocations).toEqual({
      [vehicleId1]: new LastAngleUpdateLocation(5, 7, 0, now),
      [vehicleId2]: new LastAngleUpdateLocation(11, 13, 0, now - locationExpirationInMilliseconds),
    });

    console.log(database.savedAngleLocations);
  });
});
