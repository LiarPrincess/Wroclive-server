import { VehicleLocationFromApi } from "../../models";
import { calculateDistanceInMeters } from "../../helpers";
import {
  timeToConsiderAsNotMoved,
  minMovement,
  HasMovedInLastFewMinutesClassifier,
} from "../HasMovedInLastFewMinutesClassifier";
import assert from "assert";

/* ================ */
/* === Vehicles === */
/* ================ */

enum Movement {
  initial,
  small,
  big,
}

const lineName = "LINE_NAME";

function createVehicle(id: string, movement: Movement): VehicleLocationFromApi {
  const initial = new VehicleLocationFromApi(id, lineName, 3, 7);

  switch (movement) {
    case Movement.initial:
      return initial;
    case Movement.small:
      const after = new VehicleLocationFromApi(id, lineName, 3.00005, 7.00005); // 7.86m
      const dist = calculateDistanceInMeters(initial.lat, initial.lng, after.lat, after.lng);
      assert(dist < minMovement);
      return after;
    case Movement.big:
      const after2 = new VehicleLocationFromApi(id, lineName, 5, 11); // 496.845km
      const dist2 = calculateDistanceInMeters(initial.lat, initial.lng, after2.lat, after2.lng);
      assert(dist2 > minMovement);
      return after2;
  }
}

/* ============ */
/* === Main === */
/* ============ */

describe("HasMovedInLastFewMinutesClassifier", () => {
  it("new vehicle have moved", async () => {
    const c = new HasMovedInLastFewMinutesClassifier();

    let now = new Date(0);
    const vehicle = createVehicle("1", Movement.initial);
    expect(c.hasMovedInLastFewMinutes(now, vehicle)).toBeTruthy();
  });

  it("vehicle that moved is recognized as moved", async () => {
    const c = new HasMovedInLastFewMinutesClassifier();

    let now = new Date(0);
    const vehicle0 = createVehicle("1", Movement.initial);
    expect(c.hasMovedInLastFewMinutes(now, vehicle0)).toBeTruthy();

    // Within grace period
    now = new Date(timeToConsiderAsNotMoved - 1);
    const vehicle1 = createVehicle("1", Movement.big); // Big move
    expect(c.hasMovedInLastFewMinutes(now, vehicle1)).toBeTruthy();

    // After grace period
    now = new Date(timeToConsiderAsNotMoved + 1);
    const vehicle2 = createVehicle("1", Movement.initial); // Big move to initial
    expect(c.hasMovedInLastFewMinutes(now, vehicle2)).toBeTruthy();
  });

  it("vehicle that has not moved within grace period is recognized as moved", async () => {
    const c = new HasMovedInLastFewMinutesClassifier();

    let now = new Date(0);
    const vehicle0 = createVehicle("1", Movement.initial);
    expect(c.hasMovedInLastFewMinutes(now, vehicle0)).toBeTruthy();

    // Within grace period
    now = new Date(timeToConsiderAsNotMoved - 1);
    const vehicle1 = createVehicle("1", Movement.small); // Small move
    expect(c.hasMovedInLastFewMinutes(now, vehicle1)).toBeTruthy();
  });

  it("vehicle that has not moved after grace period is recognized as not moved", async () => {
    const c = new HasMovedInLastFewMinutesClassifier();

    let now = new Date(0);
    const vehicle0 = createVehicle("1", Movement.initial);
    expect(c.hasMovedInLastFewMinutes(now, vehicle0)).toBeTruthy();

    // After grace period
    now = new Date(timeToConsiderAsNotMoved + 1);
    const vehicle1 = createVehicle("1", Movement.small); // Small move
    expect(c.hasMovedInLastFewMinutes(now, vehicle1)).toBeFalsy();
  });

  it("different vehicles are not mixed up", async () => {
    const c = new HasMovedInLastFewMinutesClassifier();

    let now = new Date(0);
    const vehicle0 = createVehicle("0", Movement.initial);
    expect(c.hasMovedInLastFewMinutes(now, vehicle0)).toBeTruthy();
    const vehicle1 = createVehicle("1", Movement.small);
    expect(c.hasMovedInLastFewMinutes(now, vehicle1)).toBeTruthy();

    // After grace period
    now = new Date(timeToConsiderAsNotMoved + 1);
    const vehicle0After = createVehicle("0", Movement.small); // Small move
    expect(c.hasMovedInLastFewMinutes(now, vehicle0After)).toBeFalsy();
    const vehicle1After = createVehicle("1", Movement.big); // Big move
    expect(c.hasMovedInLastFewMinutes(now, vehicle1After)).toBeTruthy();
  });
});
