import { VehicleLocationFromApi } from "../../models";
import { isInDepot as isInDepotFn } from "../isInDepot";
import { minMovement, movementCheckInterval, DepotClassifier } from "../DepotClassifier";
import { calculateDistanceInMeters } from "../../helpers";
import * as depotTestData from "./depot-test-data";

/* ========================== */
/* === Lines and vehicles === */
/* ========================== */

enum DepotStatus {
  inside,
  outside,
}

const lineName = "LINE_NAME";

function createVehicle(id: string, depotStatus: DepotStatus): VehicleLocationFromApi {
  let desiredIsInDepot: boolean;

  switch (depotStatus) {
    case DepotStatus.inside:
      desiredIsInDepot = true;
      break;
    case DepotStatus.outside:
      desiredIsInDepot = false;
      break;
  }

  for (const entry of depotTestData.vehicles) {
    const isInDepot = isInDepotFn(entry.lat, entry.lng);

    if (isInDepot == desiredIsInDepot) {
      // We only care about 'lat' and 'lng'
      return new VehicleLocationFromApi(id, lineName, entry.lat, entry.lng);
    }
  }

  throw new Error("Unable to create such vehicle!");
}

/* ============ */
/* === Main === */
/* ============ */

describe("DepotClassifier", function () {
  it("new vehicles is not in depot", function () {
    const c = new DepotClassifier();
    const now = new Date(0);

    const vehicle0 = createVehicle("0", DepotStatus.inside);
    expect(c.isInDepot(now, vehicle0)).toBeFalsy();

    const vehicle1 = createVehicle("1", DepotStatus.outside);
    expect(c.isInDepot(now, vehicle1)).toBeFalsy();
  });

  it("checks only at a given interval", function () {
    const vehicleId = "1";
    const c = new DepotClassifier();

    let now = new Date(0);
    const newVehicle = createVehicle(vehicleId, DepotStatus.inside);
    expect(c.isInDepot(now, newVehicle)).toBeFalsy();

    // Go outside
    now = new Date(movementCheckInterval - 1);
    const midIntervalVehicle = createVehicle(vehicleId, DepotStatus.outside);
    expect(c.isInDepot(now, midIntervalVehicle)).toBeFalsy(); // !

    // Back inside depot (no movement from the 1st one)
    now = new Date(movementCheckInterval + 1);
    const afterIntervalVehicle = newVehicle;
    expect(c.isInDepot(now, afterIntervalVehicle)).toBeTruthy(); // !
  });

  it("vehicles in depot that moved are not in depot", function () {
    const vehicleId = "1";
    const c = new DepotClassifier();

    const vehicle0 = createVehicle(vehicleId, DepotStatus.inside);
    let now = new Date(0);
    expect(c.isInDepot(now, vehicle0)).toBeFalsy();

    const vehicle1 = new VehicleLocationFromApi(
      vehicleId,
      lineName,
      vehicle0.lat + 1, // Move it just a tiny bit
      vehicle0.lng + 1
    );

    // Check if this vehicle moved enough
    const distance = calculateDistanceInMeters(vehicle0.lat, vehicle0.lng, vehicle1.lat, vehicle1.lng);
    expect(distance).toBeGreaterThanOrEqual(minMovement);

    now = new Date(movementCheckInterval + 1);
    expect(c.isInDepot(now, vehicle1)).toBeFalsy();
  });

  it("vehicles outside of depot that have not moved are not in depot (traffic jam)", function () {
    const c = new DepotClassifier();
    const vehicle = createVehicle("1", DepotStatus.outside);

    let now = new Date(0);
    expect(c.isInDepot(now, vehicle)).toBeFalsy();

    now = new Date(movementCheckInterval + 1);
    expect(c.isInDepot(now, vehicle)).toBeFalsy();
  });

  it("vehicles in depot that have not moved are in depot (aka. THE TEST)", function () {
    const c = new DepotClassifier();
    const vehicle = createVehicle("1", DepotStatus.inside);

    let now = new Date(0);
    expect(c.isInDepot(now, vehicle)).toBeFalsy();

    now = new Date(movementCheckInterval + 1);
    expect(c.isInDepot(now, vehicle)).toBeTruthy();
  });
});
