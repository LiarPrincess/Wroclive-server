import { AngleCalculatorMock } from './Mocks';
import {
  LastAngleUpdateLocation,
  locationExpirationInMilliseconds,
  storeInDatabaseIntervalInMilliseconds
} from '../AngleCalculatorBase';

let date: Date = new Date(0);

function getDate(): Date {
  return date;
}

const vehicleId1 = '1';
const vehicleId2 = '2';
const vehicleId3 = '3';
function createUpdateLocation(time: number): LastAngleUpdateLocation {
  return new LastAngleUpdateLocation(3, 5, 7, time);
}

describe('AngleCalculatorBase-STORE', function () {

  it('Does nothing if there are no locations', async function () {
    const calculator = new AngleCalculatorMock(getDate);

    date = new Date(0);
    await calculator.storeLastVehicleAngleUpdateLocationInDatabase();
    expect(calculator.getFromDatabaseCallCount).toEqual(0);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);
    expect(calculator.storedInDatabase).toBeUndefined();
  });

  it('Does nothing if we recently stored locations', async function () {
    const calculator = new AngleCalculatorMock(getDate);

    const now = storeInDatabaseIntervalInMilliseconds;
    calculator.setLocations({
      vehicleId1: createUpdateLocation(now), // Should stay
      vehicleId2: createUpdateLocation(now - locationExpirationInMilliseconds), // Should stay
      vehicleId3: createUpdateLocation(now - locationExpirationInMilliseconds - 1), // Should be removed
    });

    // The last store was at 0, so nothing should be done.
    date = new Date(now);
    await calculator.storeLastVehicleAngleUpdateLocationInDatabase();
    expect(calculator.getFromDatabaseCallCount).toEqual(0);
    expect(calculator.storeInDatabaseCallCount).toEqual(0);
    expect(calculator.storedInDatabase).toBeUndefined();
  });

  it('Removes vehicles past the expiration date', async function () {
    const calculator = new AngleCalculatorMock(getDate);

    const now = storeInDatabaseIntervalInMilliseconds + 1;
    const vehicle1Location = createUpdateLocation(now); // Should stay
    const vehicle2Location = createUpdateLocation(now - locationExpirationInMilliseconds);// Should stay
    calculator.setLocations({
      vehicleId1: vehicle1Location,
      vehicleId2: vehicle2Location,
      vehicleId3: createUpdateLocation(now - locationExpirationInMilliseconds - 1), // Should be removed
    });

    // The last store was at 0, so we should store in database.
    date = new Date(now);
    await calculator.storeLastVehicleAngleUpdateLocationInDatabase();
    expect(calculator.getFromDatabaseCallCount).toEqual(0);
    expect(calculator.storeInDatabaseCallCount).toEqual(1);
    expect(calculator.storedInDatabase).toEqual({
      vehicleId1: vehicle1Location,
      vehicleId2: vehicle2Location,
    });
  });
});
