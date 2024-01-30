import { UpdateResult } from "../StateType";
import { State, DateProviderResult, removeVehiclesWithoutUpdateAfter } from "../State";
import { AngleCalculatorMock } from "../AngleCalculatorMock";
import { DepotClassifierMock } from "../../vehicle-classification/DepotClassifier";
import { LineScheduleClassifierMock } from "../../vehicle-classification/LineScheduleClassifier";
import { HasMovedInLastFewMinutesClassifierMock } from "../../vehicle-classification/HasMovedInLastFewMinutesClassifier";
import { Line, LineLocation, VehicleLocation, VehicleLocationFromApi } from "../../models";

/* ============= */
/* === Lines === */
/* ============= */

const lineA = new Line("A", "Bus", "Express");
const line4 = new Line("4", "Tram", "Regular");
const line125 = new Line("125", "Bus", "Regular");
const lines = [lineA, line4, line125];

function getLineLocations(result: UpdateResult): LineLocation[] {
  switch (result.kind) {
    case "Success":
      return result.lineLocations.sort((lhs, rhs) => (lhs.line.name < rhs.line.name ? -1 : 1));
    case "ResponseContainsNoVehicles":
    case "NoVehicleHasMovedInLastFewMinutes":
      return [];
  }
}

/* ================ */
/* === Vehicles === */
/* ================ */

class Vehicle {
  public id: string;
  public line: Line;
  public api: VehicleLocationFromApi;
  public location: VehicleLocation;
  public angle: number;

  constructor(id: string, line: Line, lat: number, lng: number, angle: number) {
    this.id = id;
    this.line = line;
    this.api = new VehicleLocationFromApi(id, line.name, lat, lng);
    this.location = new VehicleLocation(id, lat, lng, angle);
    this.angle = angle;
  }

  move(lat: number, lng: number, angle: number): Vehicle {
    return new Vehicle(this.id, this.line, lat, lng, angle);
  }
}

const vehicleA1 = new Vehicle("A1", lineA, 5, 7, 11);
const vehicleA2 = new Vehicle("A2", lineA, 13, 17, 19);
const vehicle41 = new Vehicle("41", line4, 23, 27, 29);

/* ============ */
/* === Date === */
/* ============ */

let now: Date = new Date(0);

function getDate(): DateProviderResult {
  return { now, currentTimeInWroclaw: { hour: 0, minute: 0 } };
}

function createState(deps: {
  angle: AngleCalculatorMock;
  depot?: DepotClassifierMock;
  lineSchedule?: LineScheduleClassifierMock;
  hasMoved?: HasMovedInLastFewMinutesClassifierMock;
}): State {
  return new State(deps.angle, deps.depot, deps.lineSchedule, deps.hasMoved, getDate);
}

/* ============ */
/* === Main === */
/* ============ */

describe("State", function () {
  it("no vehicles", async function () {
    const angle = new AngleCalculatorMock();
    const state = createState({ angle });

    now = new Date(0);
    const result = await state.update(lines, []);
    expect(result).toEqual({ kind: "ResponseContainsNoVehicles" });
    expect(angle.calculateAngleCallCount).toEqual(0);
    expect(angle.saveStateInDatabaseCallCount).toEqual(0);
  });

  it("no vehicles moved", async function () {
    const angle = new AngleCalculatorMock([vehicleA1, vehicle41]);
    const hasMoved = new HasMovedInLastFewMinutesClassifierMock();
    const state = createState({ angle, hasMoved });

    now = new Date(0);
    const result = await state.update(lines, [vehicleA1.api, vehicle41.api]);

    expect(result).toEqual({ kind: "NoVehicleHasMovedInLastFewMinutes" });
    expect(angle.saveStateInDatabaseCallCount).toEqual(1);
  });

  it("line not in database is artificially created", async function () {
    const angle = new AngleCalculatorMock([vehicleA1, vehicle41]);
    const hasMoved = new HasMovedInLastFewMinutesClassifierMock([vehicleA1, vehicle41]);
    const state = createState({ angle, hasMoved });

    const vehicleUndefinedLine = new VehicleLocationFromApi("IdU", "LineU", 123, 456);
    angle.vehicleIdToAngle.set(vehicleUndefinedLine.id, 789);
    hasMoved.movedVehicleIds.add(vehicleUndefinedLine.id);

    now = new Date(0);
    const result = await state.update(lines, [vehicleA1.api, vehicleUndefinedLine, vehicle41.api]);
    const resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      { line: line4, vehicles: [vehicle41.location] },
      { line: lineA, vehicles: [vehicleA1.location] },
      {
        line: new Line("LineU", "Bus", "Regular"),
        vehicles: [new VehicleLocation("IdU", 123, 456, 789)],
      },
    ]);

    expect(angle.saveStateInDatabaseCallCount).toEqual(1);
  });

  it("lines are compared with casefold", async function () {
    expect(lineA.name).toEqual("A");
    const newLine = new Line("a", "Bus", "Express");
    const vehicleNewLine = new Vehicle("xxx", newLine, 123, 456, 789);

    const angle = new AngleCalculatorMock([vehicleA1, vehicleNewLine, vehicle41]);
    const hasMoved = new HasMovedInLastFewMinutesClassifierMock([vehicleA1, vehicleNewLine, vehicle41]);
    const state = createState({ angle, hasMoved });

    now = new Date(0);
    const result = await state.update(lines, [vehicleA1.api, vehicleNewLine.api, vehicle41.api]);
    const resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      { line: line4, vehicles: [vehicle41.location] },
      { line: lineA, vehicles: [vehicleA1.location, vehicleNewLine.location] },
    ]);

    expect(angle.saveStateInDatabaseCallCount).toEqual(1);
  });

  it("depot", async function () {
    const angle = new AngleCalculatorMock([vehicleA1, vehicleA2, vehicle41]);
    const depot = new DepotClassifierMock();
    const state = createState({ angle, depot });

    depot.inDepotVehicleIds.add(vehicleA2.id);

    now = new Date(0);
    const result = await state.update(lines, [vehicleA1.api, vehicleA2.api, vehicle41.api]);
    const resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      { line: line4, vehicles: [vehicle41.location] },
      { line: lineA, vehicles: [vehicleA1.location] },
    ]);

    expect(angle.saveStateInDatabaseCallCount).toEqual(1);
  });

  it("line schedule", async function () {
    const angle = new AngleCalculatorMock([vehicleA1, vehicle41, vehicleA2]);
    const lineSchedule = new LineScheduleClassifierMock();
    const state = createState({ angle, lineSchedule });

    lineSchedule.withinScheduleLineNames.add(lineA.name);

    now = new Date(0);
    const result = await state.update(lines, [vehicleA1.api, vehicle41.api, vehicleA2.api]);
    const resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      {
        line: lineA,
        vehicles: [vehicleA1.location, vehicleA2.location],
      },
    ]);

    expect(angle.saveStateInDatabaseCallCount).toEqual(1);
  });

  it("removes inactive vehicles", async function () {
    const angle = new AngleCalculatorMock([vehicleA1, vehicle41, vehicleA2]);
    const state = createState({ angle });

    now = new Date(0);
    let result = await state.update(lines, [vehicleA1.api, vehicle41.api, vehicleA2.api]);
    let resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      { line: line4, vehicles: [vehicle41.location] },
      { line: lineA, vehicles: [vehicleA1.location, vehicleA2.location] },
    ]);

    // Moved at expiration time
    const a1Moved = vehicleA1.move(101, 103, 107);
    angle.add(a1Moved);

    now = new Date(removeVehiclesWithoutUpdateAfter);
    result = await state.update(lines, [a1Moved.api, vehicleA2.api]);
    resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      { line: line4, vehicles: [vehicle41.location] },
      { line: lineA, vehicles: [a1Moved.location, vehicleA2.location] },
    ]);

    // Moved after expiration time
    const a2Moved = vehicleA2.move(111, 117, 123);
    angle.add(a2Moved);

    now = new Date(removeVehiclesWithoutUpdateAfter + 1);
    result = await state.update(lines, [a1Moved.api, a2Moved.api]);
    resultLocations = getLineLocations(result);

    // Vehicle 4 is removed
    expect(resultLocations).toEqual([
      {
        line: lineA,
        vehicles: [a1Moved.location, a2Moved.location],
      },
    ]);

    expect(angle.saveStateInDatabaseCallCount).toEqual(3);
  });
});
