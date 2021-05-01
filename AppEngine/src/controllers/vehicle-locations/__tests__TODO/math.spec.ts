/*
import {
  degToRad,
  radToDeg,
  calculateDistanceInMeters,
  calculateHeading
} from '../math';

describe('degToRad', () => {
  const pi = Math.PI;
  const precision = 2;

  it('should convert positive values', function () {
    expect(degToRad(0.0)).toBeCloseTo(0.0 * pi, precision);
    expect(degToRad(90.0)).toBeCloseTo(0.5 * pi, precision);
    expect(degToRad(180.0)).toBeCloseTo(1.0 * pi, precision);
    expect(degToRad(45.0)).toBeCloseTo(0.25 * pi, precision);
  });

  it('should convert negative values', function () {
    expect(degToRad(-0.0)).toBeCloseTo(-0.0 * pi, precision);
    expect(degToRad(-90.0)).toBeCloseTo(-0.5 * pi, precision);
    expect(degToRad(-180.0)).toBeCloseTo(-1.0 * pi, precision);
    expect(degToRad(-45.0)).toBeCloseTo(-0.25 * pi, precision);
  });
});

describe('radToDeg', () => {
  const pi = Math.PI;
  const precision = 2;

  it('should convert positive values', function () {
    expect(radToDeg(0.0 * pi)).toBeCloseTo(0.0, precision);
    expect(radToDeg(0.5 * pi)).toBeCloseTo(90.0, precision);
    expect(radToDeg(1.0 * pi)).toBeCloseTo(180.0, precision);
    expect(radToDeg(2.0 * pi)).toBeCloseTo(0.0, precision);
    expect(radToDeg(2.25 * pi)).toBeCloseTo(45.0, precision);
  });

  it('should convert negative values', function () {
    expect(radToDeg(-0.0 * pi)).toBeCloseTo(-0.0, precision);
    expect(radToDeg(-0.5 * pi)).toBeCloseTo(-90.0, precision);
    expect(radToDeg(-1.0 * pi)).toBeCloseTo(-180.0, precision);
    expect(radToDeg(-2.0 * pi)).toBeCloseTo(-0.0, precision);
    expect(radToDeg(-2.25 * pi)).toBeCloseTo(-45.0, precision);
  });
});

describe('calculateDistance', () => {
  const cityLat = 51.10;
  const cityLng = 17.05;
  const precision = 5;

  it('should return 0 for the same location', function () {
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat, cityLng)).toBeCloseTo(0.0, precision);
  });

  it('should work for long distances', function () {
    const d = 0.1;
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat + d, cityLng)).toBeCloseTo(11131.949079327373, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat + d, cityLng + d)).toBeCloseTo(13140.812938294554, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat, cityLng + d)).toBeCloseTo(6990.452244075236, precision);
  });

  it('should work for mid distances', function () {
    const d = 0.01;
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat + d, cityLng)).toBeCloseTo(1113.1949079326664, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat + d, cityLng + d)).toBeCloseTo(1314.4434181967610, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat, cityLng + d)).toBeCloseTo(699.0452776070259, precision);
  });

  it('should work for short distances', function () {
    const d = 0.001;
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat + d, cityLng)).toBeCloseTo(111.31949079298340, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat + d, cityLng + d)).toBeCloseTo(131.44796057758487, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat, cityLng + d)).toBeCloseTo(69.90452781245780, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat - d, cityLng + d)).toBeCloseTo(131.44876468489514, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat - d, cityLng)).toBeCloseTo(111.31949079298340, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat - d, cityLng - d)).toBeCloseTo(131.44876468477688, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat, cityLng - d)).toBeCloseTo(69.90452781223546, precision);
    expect(calculateDistanceInMeters(cityLat, cityLng, cityLat + d, cityLng - d)).toBeCloseTo(131.44796057746663, precision);
  });
});

describe('calculateHeading', () => {
  const cityLat = 51.10;
  const cityLng = 17.05;
  const precision = 5;

  it('should return 0 for the same location', () => {
    expect(calculateHeading(cityLat, cityLng, cityLat, cityLng)).toBeCloseTo(0.0, precision);
  });

  it('should work for long distances', function () {
    const d = 0.1;
    expect(calculateHeading(cityLat, cityLng, cityLat + d, cityLng)).toBeCloseTo(0.0, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat + d, cityLng + d)).toBeCloseTo(32.060447585640986, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat, cityLng + d)).toBeCloseTo(89.961087838679420, precision);
  });

  it('should work for mid distances', function () {
    const d = 0.01;
    expect(calculateHeading(cityLat, cityLng, cityLat + d, cityLng)).toBeCloseTo(0.0, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat + d, cityLng + d)).toBeCloseTo(32.120620659172914, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat, cityLng + d)).toBeCloseTo(89.996108784274160, precision);
  });

  it('should work for short distances', function () {
    const d = 0.001;
    expect(calculateHeading(cityLat, cityLng, cityLat + d, cityLng)).toBeCloseTo(0.0, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat + d, cityLng + d)).toBeCloseTo(32.126634762998720, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat, cityLng + d)).toBeCloseTo(89.999610878521710, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat - d, cityLng + d)).toBeCloseTo(147.87202884840326, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat - d, cityLng)).toBeCloseTo(-180.0, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat - d, cityLng - d)).toBeCloseTo(-147.87202884848534, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat, cityLng - d)).toBeCloseTo(-89.99961087852165, precision);
    expect(calculateHeading(cityLat, cityLng, cityLat + d, cityLng - d)).toBeCloseTo(-32.126634762916694, precision);
  });
});
*/
