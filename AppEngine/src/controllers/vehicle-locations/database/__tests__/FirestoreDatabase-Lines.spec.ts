import { Line } from "../../models";
import { FirestoreDatabase } from "../FirestoreDatabase";
import { FirestoreDatabaseMock, LoggerMock } from "./Mocks";

const lineA = new Line("A", "Bus", "Express");
const line4 = new Line("4", "Tram", "Regular");
const line125 = new Line("125", "Bus", "Regular");

function createDatabase() {
  const firestore = new FirestoreDatabaseMock();
  const logger = new LoggerMock();
  return new FirestoreDatabase(firestore, logger);
}

describe("VehicleLocationsDatabase-Lines", function () {
  it("no lines", async function () {
    const db = createDatabase();
    const lines = await db.getLines();
    expect(lines).toEqual([]);
  });

  it("add lines", async function () {
    const db = createDatabase();

    await db.setLines({ timestamp: "TIMESTAMP_1", data: [lineA, line125] });
    const lines1 = await db.getLines();
    expect(lines1).toEqual([lineA, line125]);

    await db.setLines({ timestamp: "TIMESTAMP_2", data: [line125, line4] });
    const lines2 = await db.getLines();
    expect(lines2).toEqual([line125, line4]);
  });
});
