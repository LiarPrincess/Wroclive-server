import {
  isInBorekDepot,
  isInMichalczewskiDepot,
  isInGajDepot,
  isInOlbinDepot,
  isInObornickaDepot
} from '../isInDepot';

import {
  vehicles,
  borekVehicleIds,
  michalczewskiVehicleIds,
  gajVehicleIds,
  olbinVehicleIds,
  obornickaVehicleIds
} from './depot-test-data';

type locationFilter = (lat: number, lng: number) => boolean;

function filterVehicles(filter: locationFilter): Set<string> {
  const ids = vehicles
    .filter(entry => filter(entry.lat, entry.lng))
    .map(entry => entry.sideNumber);

  return new Set(ids);
}

describe('isInBorekDepot', () => {
  it('should find correct vehicles', function () {
    const fn = isInBorekDepot;
    const expected = borekVehicleIds;

    const result = filterVehicles(fn);
    expect(result).toEqual(expected);
  });
});

describe('isInMichalczewskiDepot', () => {
  it('should find correct vehicles', function () {
    const fn = isInMichalczewskiDepot;
    const expected = michalczewskiVehicleIds;

    const result = filterVehicles(fn);
    expect(result).toEqual(expected);
  });
});

describe('isInGajDepot', () => {
  it('should find correct vehicles', function () {
    const fn = isInGajDepot;
    const expected = gajVehicleIds;

    const result = filterVehicles(fn);
    expect(result).toEqual(expected);
  });
});

describe('isInOlbinDepot', () => {
  it('should find correct vehicles', function () {
    const fn = isInOlbinDepot;
    const expected = olbinVehicleIds;

    const result = filterVehicles(fn);
    expect(result).toEqual(expected);
  });
});

describe('isInObornickaDepot', () => {
  it('should find correct vehicles', function () {
    const fn = isInObornickaDepot;
    const expected = obornickaVehicleIds;

    const result = filterVehicles(fn);
    expect(result).toEqual(expected);
  });
});
