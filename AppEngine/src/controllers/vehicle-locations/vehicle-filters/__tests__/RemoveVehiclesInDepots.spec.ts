import { Line } from '../../..';
import { Vehicle } from '../../models';
import { isInDepot as isInDepotFn } from '../isInDepot';
import {
  RemoveVehiclesInDepots,
  minMovement,
  movementCheckInterval
} from '../RemoveVehiclesInDepots';
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

const line: Line = { name: 'A', type: 'Bus', subtype: 'Express' };

enum DepotStatus {
  inside,
  outside
}

function createVehicle(id: string, depotStatus: DepotStatus): Vehicle {
  let desiredIsInDepot: boolean;
  switch (depotStatus) {
    case DepotStatus.inside: desiredIsInDepot = true; break;
    case DepotStatus.outside: desiredIsInDepot = false; break;
  }

  for (const entry of depotTestData.vehicles) {
    const isInDepot = isInDepotFn(entry.lat, entry.lng);
    if (isInDepot == desiredIsInDepot) {
      // We only care about 'lat' and 'lng'
      return { id, line: line.name, lat: entry.lat, lng: entry.lng };
    }
  }

  throw new Error('Unable to create such vehicle!');
}

/* ============ */
/* === Main === */
/* ============ */

describe('RemoveVehiclesInDepots', function () {

  it('always shows new vehicles', function () {
    const filter = new RemoveVehiclesInDepots(getCurrentDateMock);
    filter.prepareForFiltering();

    const vehicle0 = createVehicle('0', DepotStatus.inside);
    expect(filter.isAccepted(vehicle0, line)).toBeTruthy();

    const vehicle1 = createVehicle('1', DepotStatus.outside);
    expect(filter.isAccepted(vehicle1, line)).toBeTruthy();
  });

  it('checks only at a given interval', function () {
    const vehicleId = '1';
    const filter = new RemoveVehiclesInDepots(getCurrentDateMock);

    const newVehicle = createVehicle(vehicleId, DepotStatus.inside);
    currentDate = createDate(0);
    filter.prepareForFiltering();
    expect(filter.isAccepted(newVehicle, line)).toBeTruthy();

    const midIntervalVehicle = createVehicle(vehicleId, DepotStatus.outside);
    currentDate = createDate(movementCheckInterval - 1);
    filter.prepareForFiltering();
    expect(filter.isAccepted(midIntervalVehicle, line)).toBeTruthy();

    // Back inside depot (no movement)
    const afterIntervalVehicle = newVehicle;
    currentDate = createDate(movementCheckInterval + 1);
    filter.prepareForFiltering();
    expect(filter.isAccepted(afterIntervalVehicle, line)).toBeFalsy();
  });

  it('allows depot vehicles that moved (they are not stale)', function () {
    const vehicleId = '1';
    const filter = new RemoveVehiclesInDepots(getCurrentDateMock);

    const vehicle0 = createVehicle(vehicleId, DepotStatus.inside);
    currentDate = createDate(0);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle0, line)).toBeTruthy();

    const vehicle1: Vehicle = {
      id: vehicle0.id,
      line: vehicle0.line,
      lat: vehicle0.lat + 1, // Move it just a tiny bit
      lng: vehicle0.lng + 1
    };

    // Check if this vehicle moved enough
    const distance = calculateDistanceInMeters(vehicle0.lat, vehicle0.lng, vehicle1.lat, vehicle1.lng);
    expect(distance).toBeGreaterThanOrEqual(minMovement);

    currentDate = createDate(movementCheckInterval + 1);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle1, line)).toBeTruthy();
  });

  it('allows stale vehicles outside of depot (traffic jam)', function () {
    const filter = new RemoveVehiclesInDepots(getCurrentDateMock);

    const vehicleId = '1';
    const vehicle = createVehicle(vehicleId, DepotStatus.outside);

    currentDate = createDate(0);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentDate = createDate(movementCheckInterval + 1);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();
  });

  it('removes stale vehicles in depot (aka. THE TEST)', function () {
    const filter = new RemoveVehiclesInDepots(getCurrentDateMock);

    const vehicleId = '1';
    const vehicle = createVehicle(vehicleId, DepotStatus.inside);

    currentDate = createDate(0);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeTruthy();

    currentDate = createDate(movementCheckInterval + 1);
    filter.prepareForFiltering();
    expect(filter.isAccepted(vehicle, line)).toBeFalsy();
  });
});
