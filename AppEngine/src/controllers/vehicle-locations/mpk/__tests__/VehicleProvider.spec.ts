import * as mocks from "./Mocks";
import { ApiError, ApiResult } from "../ApiType";
import { VehicleProvider } from "../VehicleProvider";
import { DatabaseMock } from "../../database";
import {
  VehicleLocation,
  Line,
  LineCollection,
  LineLocationLine,
  VehicleLocationFromApi,
  LineLocation,
} from "../../models";

const lineA = new Line("A", "Bus", "Express");
const line4 = new Line("4", "Tram", "Regular");
const line125 = new Line("125", "Bus", "Regular");

const lineAData = new LineLocationLine(lineA.name, lineA.type, lineA.subtype);
const line4Data = new LineLocationLine(line4.name, line4.type, line4.subtype);

const vehicle_lineA_1 = new VehicleLocationFromApi("A1", "A", 3, 5);
const vehicle_lineA_2 = new VehicleLocationFromApi("A2", "A", 7, 11);
const vehicle_line4_1 = new VehicleLocationFromApi("41", "4", 13, 17);

const vehicle_lineA_1_with0Angle = new VehicleLocation("A1", 3, 5, 0);
const vehicle_lineA_2_with0Angle = new VehicleLocation("A2", 7, 11, 0);
const vehicle_line4_1_with0Angle = new VehicleLocation("41", 13, 17, 0);

async function createProvider() {
  const api = new mocks.Api();
  const database = new DatabaseMock();
  const errorReporter = new mocks.ErrorReporter();
  const hasMovedInLastFewMinutes = new mocks.HasMovedInLastFewMinutesClassifier();

  const allLines = new LineCollection("TIMESTAMP", [lineA, line4, line125]);
  await database.setLines(allLines);

  const provider = new VehicleProvider(api, database, errorReporter, hasMovedInLastFewMinutes);

  return { provider, api, database, errorReporter, hasMovedInLastFewMinutes };
}

function vehiclesFrom(lineLocations: LineLocation[]) {
  const result: any[] = [];
  for (const line of lineLocations) {
    result.push(...line.vehicles);
  }
  return result.sort((lhs, rhs) => (lhs.id < rhs.id ? -1 : 1));
}

describe("MpkVehicleProvider", async function () {
  it("returns error if api returns no vehicles", async function () {
    const { provider, api, database, hasMovedInLastFewMinutes, errorReporter } = await createProvider();

    const apiResult: ApiResult = { kind: "Success", vehicles: [], invalidRecords: [] };
    api.results = [apiResult];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "ResponseContainsNoVehicles" });
    expect(errorReporter.errors).toEqual([{ kind: "ResponseContainsNoVehicles", arg: apiResult }]);
    expect(hasMovedInLastFewMinutes.prepareCallCount).toEqual(0);
    expect(database.saveMpkVehicleLocationsCallCount).toEqual(0);
  });

  it("returns line location for each different vehicle line", async function () {
    const { provider, api, database, hasMovedInLastFewMinutes, errorReporter } = await createProvider();

    api.results = [
      {
        kind: "Success",
        vehicles: [vehicle_lineA_1, vehicle_line4_1],
        invalidRecords: [],
      },
    ];

    const lineLocations = [
      { line: lineAData, vehicles: [vehicle_lineA_1_with0Angle] },
      { line: line4Data, vehicles: [vehicle_line4_1_with0Angle] },
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "Success", lineLocations });
    expect(errorReporter.errors).toEqual([]);
    expect(hasMovedInLastFewMinutes.prepareCallCount).toEqual(1);
    expect(database.saveMpkVehicleLocationsCallCount).toEqual(1);
    expect(database.savedMpkVehicleLocations).toEqual(vehiclesFrom(lineLocations));
  });

  it("returns the same line location for vehicles from the same line", async function () {
    const { provider, api, database, hasMovedInLastFewMinutes, errorReporter } = await createProvider();

    api.results = [
      {
        kind: "Success",
        vehicles: [vehicle_lineA_1, vehicle_lineA_2],
        invalidRecords: [],
      },
    ];

    const lineLocations = [
      {
        line: lineAData,
        vehicles: [vehicle_lineA_1_with0Angle, vehicle_lineA_2_with0Angle],
      },
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "Success", lineLocations });
    expect(errorReporter.errors).toEqual([]);
    expect(hasMovedInLastFewMinutes.prepareCallCount).toEqual(1);
    expect(database.saveMpkVehicleLocationsCallCount).toEqual(1);
    expect(database.savedMpkVehicleLocations).toEqual(vehiclesFrom(lineLocations));
  });

  it("returns result even if one of the vehicles has not moved", async function () {
    const { provider, api, database, hasMovedInLastFewMinutes, errorReporter } = await createProvider();

    hasMovedInLastFewMinutes.vehicleIdThatHaveNotMoved.push(vehicle_lineA_1.id);
    api.results = [
      {
        kind: "Success",
        vehicles: [vehicle_lineA_1, vehicle_line4_1],
        invalidRecords: [],
      },
    ];

    const lineLocations = [
      { line: lineAData, vehicles: [vehicle_lineA_1_with0Angle] },
      { line: line4Data, vehicles: [vehicle_line4_1_with0Angle] },
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "Success", lineLocations });
    expect(errorReporter.errors).toEqual([]);
    expect(hasMovedInLastFewMinutes.prepareCallCount).toEqual(1);
    expect(database.saveMpkVehicleLocationsCallCount).toEqual(1);
    expect(database.savedMpkVehicleLocations).toEqual(vehiclesFrom(lineLocations));
  });

  it("returns error if all of the vehicles have not moved", async function () {
    const { provider, api, database, hasMovedInLastFewMinutes, errorReporter } = await createProvider();

    hasMovedInLastFewMinutes.vehicleIdThatHaveNotMoved.push(vehicle_lineA_1.id);
    hasMovedInLastFewMinutes.vehicleIdThatHaveNotMoved.push(vehicle_line4_1.id);
    api.results = [
      {
        kind: "Success",
        vehicles: [vehicle_lineA_1, vehicle_line4_1],
        invalidRecords: [],
      },
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "NoVehicleHasMovedInLastFewMinutes" });
    expect(errorReporter.errors).toEqual([{ kind: "NoVehicleHasMovedInLastFewMinutes" }]);
    expect(hasMovedInLastFewMinutes.prepareCallCount).toEqual(1);
    expect(database.saveMpkVehicleLocationsCallCount).toEqual(0);
  });

  it("should call api 2 times before returning error", async function () {
    const { provider, api, database, hasMovedInLastFewMinutes, errorReporter } = await createProvider();

    api.results = [
      {
        kind: "Error",
        error: new ApiError("Network error", "MESSAGE", "DATA"),
      },
      {
        kind: "Success",
        vehicles: [vehicle_lineA_1],
        invalidRecords: [],
      },
    ];

    const lineLocations = [{ line: lineAData, vehicles: [vehicle_lineA_1_with0Angle] }];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "Success", lineLocations });
    expect(errorReporter.errors).toEqual([]);
    expect(hasMovedInLastFewMinutes.prepareCallCount).toEqual(1);
    expect(database.saveMpkVehicleLocationsCallCount).toEqual(1);
    expect(database.savedMpkVehicleLocations).toEqual(vehiclesFrom(lineLocations));
  });

  it("invalid records from api are reported", async function () {
    const { provider, api, database, hasMovedInLastFewMinutes, errorReporter } = await createProvider();

    const invalidRecord = { invalid: "VALUE" };
    api.results = [
      {
        kind: "Success",
        vehicles: [vehicle_lineA_1],
        invalidRecords: [invalidRecord],
      },
    ];

    const lineLocations = [{ line: lineAData, vehicles: [vehicle_lineA_1_with0Angle] }];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "Success", lineLocations });
    expect(errorReporter.errors).toEqual([{ kind: "ResponseContainsInvalidRecords", arg: [invalidRecord] }]);
    expect(hasMovedInLastFewMinutes.prepareCallCount).toEqual(1);
    expect(database.saveMpkVehicleLocationsCallCount).toEqual(1);
    expect(database.savedMpkVehicleLocations).toEqual(vehiclesFrom(lineLocations));
  });

  it("returns error on api error", async function () {
    const { provider, api, database, hasMovedInLastFewMinutes, errorReporter } = await createProvider();

    const error1 = new ApiError("Network error", "MESSAGE_1", "DATA_1");
    const error2 = new ApiError("Invalid response", "MESSAGE_2", "DATA_2");
    api.results = [
      { kind: "Error", error: error1 },
      { kind: "Error", error: error2 },
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "ApiError" });
    expect(errorReporter.errors).toEqual([{ kind: "ApiError", arg: error2 }]);
    expect(hasMovedInLastFewMinutes.prepareCallCount).toEqual(0);
    expect(database.saveMpkVehicleLocationsCallCount).toEqual(0);
  });
});
