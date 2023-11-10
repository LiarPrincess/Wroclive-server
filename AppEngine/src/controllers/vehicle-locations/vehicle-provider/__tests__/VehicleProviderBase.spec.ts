import { VehicleProviderDatabaseMock as DatabaseMock } from "../VehicleProviderDatabase";
import { AngleCalculatorMock } from "../AngleCalculator";
import { DepotClassifierMock } from "../DepotClassifier";
import { LineScheduleClassifierMock } from "../LineScheduleClassifier";
import { HasMovedInLastFewMinutesClassifierMock } from "../HasMovedInLastFewMinutesClassifier";
import { State, DateProviderResult, UpdateResult, removeVehiclesWithoutUpdateAfter } from "../State";
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

/* ============ */
/* === Main === */
/* ============ */

class Provider extends State<DatabaseMock> {
  public constructor(dependencies: {
    database: DatabaseMock;
    angle: AngleCalculatorMock;
    depot?: DepotClassifierMock;
    lineSchedule?: LineScheduleClassifierMock;
    hasMoved?: HasMovedInLastFewMinutesClassifierMock;
  }) {
    super(
      dependencies.database,
      dependencies.angle,
      dependencies.depot,
      dependencies.lineSchedule,
      dependencies.hasMoved,
      getDate
    );
  }

  public run(nowArg: Date, vehicleLocations: VehicleLocationFromApi[]): Promise<UpdateResult> {
    now = nowArg;
    return this.updateState(vehicleLocations);
  }
}

describe("VehicleProviderBase", function () {
  it("no vehicles", async function () {
    const database = new DatabaseMock(lines);
    const angle = new AngleCalculatorMock();
    const provider = new Provider({ database, angle });

    const now = new Date(0);
    const result = await provider.run(now, []);
    expect(result).toEqual({ kind: "ResponseContainsNoVehicles" });
    expect(database.getLinesCallCount).toEqual(0);
    expect(angle.calculateAngleCallCount).toEqual(0);
    expect(angle.saveStateInDatabaseCallCount).toEqual(0);
  });

  it("no vehicles moved", async function () {
    const database = new DatabaseMock(lines);
    const angle = new AngleCalculatorMock([vehicleA1, vehicle41]);
    const hasMoved = new HasMovedInLastFewMinutesClassifierMock();
    const provider = new Provider({ database, angle, hasMoved });

    const now = new Date(0);
    const result = await provider.run(now, [vehicleA1.api, vehicle41.api]);

    expect(result).toEqual({ kind: "NoVehicleHasMovedInLastFewMinutes" });
    expect(database.getLinesCallCount).toEqual(1);
    expect(angle.saveStateInDatabaseCallCount).toEqual(1);
  });

  it("line not in database is artificially created", async function () {
    const database = new DatabaseMock(lines);
    const angle = new AngleCalculatorMock([vehicleA1, vehicle41]);
    const hasMoved = new HasMovedInLastFewMinutesClassifierMock([vehicleA1, vehicle41]);
    const provider = new Provider({ database, angle, hasMoved });

    const vehicleUndefinedLine = new VehicleLocationFromApi("IdU", "LineU", 123, 456);
    angle.vehicleIdToAngle.set(vehicleUndefinedLine.id, 789);
    hasMoved.movedVehicleIds.add(vehicleUndefinedLine.id);

    const now = new Date(0);
    const result = await provider.run(now, [vehicleA1.api, vehicleUndefinedLine, vehicle41.api]);
    const resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      { line: line4, vehicles: [vehicle41.location] },
      { line: lineA, vehicles: [vehicleA1.location] },
      {
        line: new Line("LineU", "Bus", "Regular"),
        vehicles: [new VehicleLocation("IdU", 123, 456, 789)],
      },
    ]);

    expect(database.getLinesCallCount).toEqual(1);
    expect(angle.saveStateInDatabaseCallCount).toEqual(1);
  });

  it("lines are compared with casefold", async function () {
    expect(lineA.name).toEqual("A");
    const newLine = new Line("a", "Bus", "Express");
    const vehicleNewLine = new Vehicle("xxx", newLine, 123, 456, 789);

    const database = new DatabaseMock(lines);
    const angle = new AngleCalculatorMock([vehicleA1, vehicleNewLine, vehicle41]);
    const hasMoved = new HasMovedInLastFewMinutesClassifierMock([vehicleA1, vehicleNewLine, vehicle41]);
    const provider = new Provider({ database, angle, hasMoved });

    const now = new Date(0);
    const result = await provider.run(now, [vehicleA1.api, vehicleNewLine.api, vehicle41.api]);
    const resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      { line: line4, vehicles: [vehicle41.location] },
      { line: lineA, vehicles: [vehicleA1.location, vehicleNewLine.location] },
    ]);

    expect(database.getLinesCallCount).toEqual(1);
    expect(angle.saveStateInDatabaseCallCount).toEqual(1);
  });

  it("depot", async function () {
    const database = new DatabaseMock(lines);
    const angle = new AngleCalculatorMock([vehicleA1, vehicleA2, vehicle41]);
    const depot = new DepotClassifierMock();
    const provider = new Provider({ database, angle, depot });

    depot.inDepotVehicleIds.add(vehicleA2.id);

    const now = new Date(0);
    const result = await provider.run(now, [vehicleA1.api, vehicleA2.api, vehicle41.api]);
    const resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      { line: line4, vehicles: [vehicle41.location] },
      { line: lineA, vehicles: [vehicleA1.location] },
    ]);

    expect(database.getLinesCallCount).toEqual(1);
    expect(angle.saveStateInDatabaseCallCount).toEqual(1);
  });

  it("line schedule", async function () {
    const database = new DatabaseMock(lines);
    const angle = new AngleCalculatorMock([vehicleA1, vehicle41, vehicleA2]);
    const lineSchedule = new LineScheduleClassifierMock();
    const provider = new Provider({ database, angle, lineSchedule });

    lineSchedule.withinScheduleLineNames.add(lineA.name);

    const now = new Date(0);
    const result = await provider.run(now, [vehicleA1.api, vehicle41.api, vehicleA2.api]);
    const resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      {
        line: lineA,
        vehicles: [vehicleA1.location, vehicleA2.location],
      },
    ]);

    expect(database.getLinesCallCount).toEqual(1);
    expect(angle.saveStateInDatabaseCallCount).toEqual(1);
  });

  it("removes inactive vehicles", async function () {
    const database = new DatabaseMock(lines);
    const angle = new AngleCalculatorMock([vehicleA1, vehicle41, vehicleA2]);
    const provider = new Provider({ database, angle });

    let now = new Date(0);
    let result = await provider.run(now, [vehicleA1.api, vehicle41.api, vehicleA2.api]);
    let resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      { line: line4, vehicles: [vehicle41.location] },
      { line: lineA, vehicles: [vehicleA1.location, vehicleA2.location] },
    ]);

    // Moved at expiration time
    const a1Moved = vehicleA1.move(101, 103, 107);
    angle.add(a1Moved);

    now = new Date(removeVehiclesWithoutUpdateAfter);
    result = await provider.run(now, [a1Moved.api, vehicleA2.api]);
    resultLocations = getLineLocations(result);

    expect(resultLocations).toEqual([
      { line: line4, vehicles: [vehicle41.location] },
      { line: lineA, vehicles: [a1Moved.location, vehicleA2.location] },
    ]);

    // Moved after expiration time
    const a2Moved = vehicleA2.move(111, 117, 123);
    angle.add(a2Moved);

    now = new Date(removeVehiclesWithoutUpdateAfter + 1);
    result = await provider.run(now, [a1Moved.api, a2Moved.api]);
    resultLocations = getLineLocations(result);

    // Vehicle 4 is removed
    expect(resultLocations).toEqual([
      {
        line: lineA,
        vehicles: [a1Moved.location, a2Moved.location],
      },
    ]);

    expect(database.getLinesCallCount).toEqual(3);
    expect(angle.saveStateInDatabaseCallCount).toEqual(3);
  });
});
