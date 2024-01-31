import { Line } from "../../models";
import { Database } from "../Database";
import { FirestoreVehicleLocationsDatabaseMock, LoggerMock } from "../../state/FirestoreVehicleLocationsDatabaseMock";

const lineA = new Line("A", "Bus", "Express");
const line4 = new Line("4", "Tram", "Regular");
const line125 = new Line("125", "Bus", "Regular");

let date: Date = new Date(0);

const date1 = new Date(0);
const date1Timestamp = "1970-01-01T00:00:00.000Z";

const date2 = new Date(30001);
const date2Timestamp = "1970-01-01T00:00:30.001Z";

const data1 = {
  id1: { lat: 3, lng: 5, angle: 7, millisecondsSince1970: 1971 },
  id2: { lat: 11, lng: 13, angle: 17, millisecondsSince1970: 1973 },
};

const data2 = {
  id3: { lat: 19, lng: 23, angle: 27, millisecondsSince1970: 1975 },
  id4: { lat: 29, lng: 31, angle: 37, millisecondsSince1970: 1977 },
};

function getDateMock(): Date {
  return date;
}

function createDatabase(): {
  firestore: FirestoreVehicleLocationsDatabaseMock;
  logger: LoggerMock;
  database: Database;
} {
  const firestore = new FirestoreVehicleLocationsDatabaseMock();
  const logger = new LoggerMock();
  const database = new Database(firestore, logger, getDateMock);
  return { database, firestore, logger };
}

describe("OpenDataDatabase", function () {
  /* ============= */
  /* === Lines === */
  /* ============= */

  it("lines - empty", async function () {
    const { database } = createDatabase();
    const lines = await database.getLines();
    expect(lines).toEqual([]);
  });

  it("lines - modify", async function () {
    const { database } = createDatabase();

    await database.setLines({ timestamp: "TIMESTAMP_1", data: [lineA, line125] });
    const lines1 = await database.getLines();
    expect(lines1).toEqual([lineA, line125]);

    await database.setLines({ timestamp: "TIMESTAMP_2", data: [line125, line4] });
    const lines2 = await database.getLines();
    expect(lines2).toEqual([line125, line4]);
  });

  /* ==================== */
  /* === GET vehicles === */
  /* ==================== */

  it("GET Vehicles - empty", async function () {
    const { firestore, database } = createDatabase();
    firestore.mpkDocument = undefined;

    const result = await database.getLastVehicleAngleUpdateLocations();
    expect(firestore.getMpkDocumentCallCount).toEqual(0);
    expect(firestore.getOpenDataDocumentCallCount).toEqual(1);
    expect(result).toBeUndefined();
  });

  it("GET Vehicles - data", async function () {
    const { firestore, database } = createDatabase();
    firestore.openDataDocument = { timestamp: "TIMESTAMP", data: data1 };

    const result = await database.getLastVehicleAngleUpdateLocations();
    expect(firestore.getMpkDocumentCallCount).toEqual(0);
    expect(firestore.getOpenDataDocumentCallCount).toEqual(1);
    expect(result).toEqual(data1);
  });

  /* ==================== */
  /* === SET vehicles === */
  /* ==================== */

  it("SET Vehicles", async function () {
    const { firestore, database } = createDatabase();

    date = date1;
    await database.saveLastVehicleAngleUpdateLocations(data1);
    expect(firestore.saveMpkDocumentCallCount).toEqual(0);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(1);
    expect(firestore.openDataDocument).toEqual({ timestamp: date1Timestamp, data: data1 });

    date = date2;
    await database.saveLastVehicleAngleUpdateLocations(data2);
    expect(firestore.saveMpkDocumentCallCount).toEqual(0);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(2);
    expect(firestore.openDataDocument).toEqual({ timestamp: date2Timestamp, data: data2 });
  });
});
