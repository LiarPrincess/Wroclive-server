import { Vehicle } from '../../models';
import { VehicleProvider, } from '../VehicleProvider';
import {
  PreventStaleDataFromVehicleProvider,
  returnEmptyIfWeGetTheSameResultFor
} from '../PreventStaleDataFromVehicleProvider';

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

const lines = ['A', '4', '125'];

const vehicles0: Vehicle[] = [
  { id: '4_1', line: '4', lat: 1, lng: 2 },
  { id: 'A_1', line: 'a', lat: 3, lng: 4 },
  { id: '125_1', line: '125', lat: 5, lng: 6 }
];

const vehicles1: Vehicle[] = [
  { id: '4_1', line: '4', lat: 11, lng: 12 },
  { id: 'A_1', line: 'a', lat: 13, lng: 14 },
  { id: '125_1', line: '125', lat: 15, lng: 16 }
];

class FakeVehicleProvider implements VehicleProvider {

  vehicles: Vehicle[] = [];

  getVehicles(lineNames: string[]): Promise<Vehicle[]> {
    return Promise.resolve(this.vehicles);
  }
}

/* ============ */
/* === Main === */
/* ============ */

describe('PreventStaleDataFromVehicleProvider', () => {

  it('returns initial vehicles', async () => {
    const inner = new FakeVehicleProvider();
    const provider = new PreventStaleDataFromVehicleProvider(inner);

    inner.vehicles = vehicles0;
    const result = await provider.getVehicles(lines);
    expect(result).toEqual(vehicles0);
  });

  it('returns new vehicles if vehicles changed', async () => {
    const inner = new FakeVehicleProvider();
    const provider = new PreventStaleDataFromVehicleProvider(inner);

    inner.vehicles = vehicles0;
    const result0 = await provider.getVehicles(lines);
    expect(result0).toEqual(vehicles0);

    inner.vehicles = vehicles1;
    const result1 = await provider.getVehicles(lines);
    expect(result1).toEqual(vehicles1);
  });

  it('returns stale vehicles within grace period', async () => {
    const inner = new FakeVehicleProvider();
    const provider = new PreventStaleDataFromVehicleProvider(inner, getCurrentDateMock);

    currentDate = createDate(0);
    inner.vehicles = vehicles0;
    const result0 = await provider.getVehicles(lines);
    expect(result0).toEqual(vehicles0);

    currentDate = createDate(returnEmptyIfWeGetTheSameResultFor);
    const result1 = await provider.getVehicles(lines);
    expect(result1).toEqual(vehicles0);
  });

  it('returns no vehicles after grace period', async () => {
    const inner = new FakeVehicleProvider();
    const provider = new PreventStaleDataFromVehicleProvider(inner, getCurrentDateMock);

    currentDate = createDate(0);
    inner.vehicles = vehicles0;
    const result0 = await provider.getVehicles(lines);
    expect(result0).toEqual(vehicles0);

    currentDate = createDate(returnEmptyIfWeGetTheSameResultFor + 1);
    const result1 = await provider.getVehicles(lines);
    expect(result1).toEqual([]);
  });
});
