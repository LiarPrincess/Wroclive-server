import { VehicleLocationFromApi } from '../../models';
import { isInDepot as isInDepotFn } from '../isInDepot';
import {
  minMovement,
  movementCheckInterval,
  DepotClassifier
} from '../DepotClassifier';
import { calculateDistanceInMeters } from '../../math';
import * as depotTestData from './depot-test-data';

/* ============ */
/* === Date === */
/* ============ */

let currentDate: Date = new Date();

function getCurrentDateMock(): Date {
  return currentDate;
}

function createDate(milliseconds: number): Date {
  return new Date(milliseconds);
}

/* ========================== */
/* === Lines and vehicles === */
/* ========================== */

enum DepotStatus {
  inside,
  outside
}

const lineName = 'LINE_NAME';

function createVehicle(id: string, depotStatus: DepotStatus): VehicleLocationFromApi {
  let desiredIsInDepot: boolean;
  switch (depotStatus) {
    case DepotStatus.inside: desiredIsInDepot = true; break;
    case DepotStatus.outside: desiredIsInDepot = false; break;
  }

  for (const entry of depotTestData.vehicles) {
    const isInDepot = isInDepotFn(entry.lat, entry.lng);
    if (isInDepot == desiredIsInDepot) {
      // We only care about 'lat' and 'lng'
      return new VehicleLocationFromApi(id, lineName, entry.lat, entry.lng);
    }
  }

  throw new Error('Unable to create such vehicle!');
}

/* ============ */
/* === Main === */
/* ============ */

describe('DepotClassifier', function () {

  it('new vehicles is not in depot', function () {
    const c = new DepotClassifier(getCurrentDateMock);
    c.prepareForClassification();

    const vehicle0 = createVehicle('0', DepotStatus.inside);
    expect(c.isInDepot(vehicle0)).toBeFalsy();

    const vehicle1 = createVehicle('1', DepotStatus.outside);
    expect(c.isInDepot(vehicle1)).toBeFalsy();
  });

  it('checks only at a given interval', function () {
    const vehicleId = '1';
    const c = new DepotClassifier(getCurrentDateMock);

    const newVehicle = createVehicle(vehicleId, DepotStatus.inside);
    currentDate = createDate(0);
    c.prepareForClassification();
    expect(c.isInDepot(newVehicle)).toBeFalsy();

    // Go outside
    const midIntervalVehicle = createVehicle(vehicleId, DepotStatus.outside);
    currentDate = createDate(movementCheckInterval - 1);
    c.prepareForClassification();
    expect(c.isInDepot(midIntervalVehicle)).toBeFalsy(); // !

    // Back inside depot (no movement from the 1st one)
    const afterIntervalVehicle = newVehicle;
    currentDate = createDate(movementCheckInterval + 1);
    c.prepareForClassification();
    expect(c.isInDepot(afterIntervalVehicle)).toBeTruthy(); // !
  });

  it('vehicles in depot that moved are not in depot', function () {
    const vehicleId = '1';
    const c = new DepotClassifier(getCurrentDateMock);

    const vehicle0 = createVehicle(vehicleId, DepotStatus.inside);
    currentDate = createDate(0);
    c.prepareForClassification();
    expect(c.isInDepot(vehicle0)).toBeFalsy();

    const vehicle1 = new VehicleLocationFromApi(
      vehicleId,
      lineName,
      vehicle0.lat + 1, // Move it just a tiny bit
      vehicle0.lng + 1
    );

    // Check if this vehicle moved enough
    const distance = calculateDistanceInMeters(vehicle0.lat, vehicle0.lng, vehicle1.lat, vehicle1.lng);
    expect(distance).toBeGreaterThanOrEqual(minMovement);

    currentDate = createDate(movementCheckInterval + 1);
    c.prepareForClassification();
    expect(c.isInDepot(vehicle1)).toBeFalsy();
  });

  it('vehicles outside of depot that have not moved are not in depot (traffic jam)', function () {
    const c = new DepotClassifier(getCurrentDateMock);
    const vehicle = createVehicle('1', DepotStatus.outside);

    currentDate = createDate(0);
    c.prepareForClassification();
    expect(c.isInDepot(vehicle)).toBeFalsy();

    currentDate = createDate(movementCheckInterval + 1);
    c.prepareForClassification();
    expect(c.isInDepot(vehicle)).toBeFalsy();
  });

  it('vehicles in depot that have not moved are in depot (aka. THE TEST)', function () {
    const c = new DepotClassifier(getCurrentDateMock);
    const vehicle = createVehicle('1', DepotStatus.inside);

    currentDate = createDate(0);
    c.prepareForClassification();
    expect(c.isInDepot(vehicle)).toBeFalsy();

    currentDate = createDate(movementCheckInterval + 1);
    c.prepareForClassification();
    expect(c.isInDepot(vehicle)).toBeTruthy();
  });
});
