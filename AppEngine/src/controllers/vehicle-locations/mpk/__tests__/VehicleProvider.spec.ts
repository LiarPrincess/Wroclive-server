import { ApiMock } from "../ApiMock";
import { DatabaseMock } from "../../database";
import { ApiError, ApiResult } from "../ApiType";
import { VehicleProvider } from "../VehicleProvider";
import { ErrorReporterMock } from "../ErrorReporter";
import { StateMock, UpdateResult } from "../../state";
import { VehicleLocation, Line, LineLocationLine, VehicleLocationFromApi } from "../../models";

const lineA = new Line("A", "Bus", "Express");
const line4 = new Line("4", "Tram", "Regular");
const line125 = new Line("125", "Bus", "Regular");
const lines = [lineA, line4, line125];

const lineAData = new LineLocationLine(lineA.name, lineA.type, lineA.subtype);
const line4Data = new LineLocationLine(line4.name, line4.type, line4.subtype);

const vehicle_lineA_1 = new VehicleLocationFromApi("A1", "A", 3, 5);
const vehicle_lineA_2 = new VehicleLocationFromApi("A2", "A", 7, 11);
const vehicle_line4_1 = new VehicleLocationFromApi("41", "4", 13, 17);

const vehicle_lineA_1_with0Angle = new VehicleLocation("A1", 3, 5, 0);
const vehicle_lineA_2_with0Angle = new VehicleLocation("A2", 7, 11, 0);
const vehicle_line4_1_with0Angle = new VehicleLocation("41", 13, 17, 0);

async function createProvider(): Promise<{
  readonly api: ApiMock;
  readonly database: DatabaseMock;
  readonly errorReporter: ErrorReporterMock;
  readonly state: StateMock;
  readonly provider: VehicleProvider;
}> {
  const api = new ApiMock();
  const database = new DatabaseMock();
  const errorReporter = new ErrorReporterMock();
  const state = new StateMock();

  database.getLinesResult = lines;

  const provider = new VehicleProvider(api, database, state, errorReporter);
  return { api, database, state, errorReporter, provider };
}

describe("MpkVehicleProvider", function () {
  it("returns error if api returns no vehicles", async function () {
    const { provider, api, database, state, errorReporter } = await createProvider();

    const apiResult: ApiResult = {
      kind: "Success",
      vehicles: [],
      invalidRecords: [],
    };
    api.results = [apiResult];

    state.updateResult = { kind: "ResponseContainsNoVehicles" };

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "ResponseContainsNoVehicles" });
    expect(state.updateCallArgs).toEqual([{ lines, vehicleLocations: [] }]);
    expect(database.getLinesCallCount).toEqual(1);
    expect(errorReporter.errors).toEqual([{ kind: "ResponseContainsNoVehicles", arg: apiResult }]);
  });

  it("returns locations from api", async function () {
    const { provider, api, database, state, errorReporter } = await createProvider();

    const vehiclesFromApi = [vehicle_lineA_1, vehicle_lineA_2, vehicle_line4_1];
    api.results = [
      {
        kind: "Success",
        vehicles: vehiclesFromApi,
        invalidRecords: [],
      },
    ];

    const lineLocations = [
      { line: lineAData, vehicles: [vehicle_lineA_1_with0Angle, vehicle_lineA_2_with0Angle] },
      { line: line4Data, vehicles: [vehicle_line4_1_with0Angle] },
    ];
    const expectedResult: UpdateResult = { kind: "Success", lineLocations };
    state.updateResult = expectedResult;

    const result = await provider.getVehicleLocations();
    expect(result).toEqual(expectedResult);
    expect(state.updateCallArgs).toEqual([{ lines, vehicleLocations: vehiclesFromApi }]);
    expect(database.getLinesCallCount).toEqual(1);
    expect(errorReporter.errors).toEqual([]);
  });

  it("returns error if no vehicle has moved", async function () {
    const { provider, api, database, state, errorReporter } = await createProvider();

    const vehiclesFromApi = [vehicle_lineA_1, vehicle_line4_1];
    api.results = [
      {
        kind: "Success",
        vehicles: vehiclesFromApi,
        invalidRecords: [],
      },
    ];

    state.updateResult = { kind: "NoVehicleHasMovedInLastFewMinutes" };

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "NoVehicleHasMovedInLastFewMinutes" });
    expect(state.updateCallArgs).toEqual([{ lines, vehicleLocations: vehiclesFromApi }]);
    expect(database.getLinesCallCount).toEqual(1);
    expect(errorReporter.errors).toEqual([{ kind: "NoVehicleHasMovedInLastFewMinutes" }]);
  });

  it("calls api 2 times before returning error", async function () {
    const { provider, api, database, state, errorReporter } = await createProvider();

    const vehiclesFromApi = [vehicle_lineA_1];
    api.results = [
      {
        kind: "Error",
        error: new ApiError("Network error", "MESSAGE", "DATA"),
      },
      {
        kind: "Success",
        vehicles: vehiclesFromApi,
        invalidRecords: [],
      },
    ];

    const lineLocations = [{ line: lineAData, vehicles: [vehicle_lineA_1_with0Angle] }];
    const expectedResult: UpdateResult = { kind: "Success", lineLocations };
    state.updateResult = expectedResult;

    const result = await provider.getVehicleLocations();
    expect(result).toEqual(expectedResult);
    expect(state.updateCallArgs).toEqual([{ lines, vehicleLocations: vehiclesFromApi }]);
    expect(database.getLinesCallCount).toEqual(1);
    expect(errorReporter.errors).toEqual([]);
  });

  it("returns error on api error", async function () {
    const { provider, api, database, state, errorReporter } = await createProvider();

    const error1 = new ApiError("Network error", "MESSAGE_1", "DATA_1");
    const error2 = new ApiError("Invalid response", "MESSAGE_2", "DATA_2");
    api.results = [
      { kind: "Error", error: error1 },
      { kind: "Error", error: error2 },
    ];

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "ApiError" });
    expect(state.updateCallArgs).toEqual([]);
    expect(database.getLinesCallCount).toEqual(1);
    expect(errorReporter.errors).toEqual([{ kind: "ApiError", arg: error2 }]);
  });

  it("reports invalid records from api", async function () {
    const { provider, api, database, state, errorReporter } = await createProvider();

    const vehiclesFromApi = [vehicle_lineA_1];
    const invalidRecord = { invalid: "VALUE" };
    api.results = [
      {
        kind: "Success",
        vehicles: vehiclesFromApi,
        invalidRecords: [invalidRecord],
      },
    ];

    const lineLocations = [{ line: lineAData, vehicles: [vehicle_lineA_1_with0Angle] }];
    const expectedResult: UpdateResult = { kind: "Success", lineLocations };
    state.updateResult = expectedResult;

    const result = await provider.getVehicleLocations();
    expect(result).toEqual({ kind: "Success", lineLocations });
    expect(state.updateCallArgs).toEqual([{ lines, vehicleLocations: vehiclesFromApi }]);
    expect(database.getLinesCallCount).toEqual(1);
    expect(errorReporter.errors).toEqual([
      {
        kind: "ResponseContainsInvalidRecords",
        arg: [invalidRecord],
      },
    ]);
  });
});
