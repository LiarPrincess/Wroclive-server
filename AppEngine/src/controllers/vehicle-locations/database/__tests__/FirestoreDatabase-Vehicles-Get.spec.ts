import { FirestoreDatabase } from '../FirestoreDatabase';
import { FirestoreDatabaseMock, LoggerMock } from './Mocks';

const date: Date = new Date(0);

function getDateMock(): Date {
  return date;
}

function createDatabase() {
  const firestore = new FirestoreDatabaseMock();
  const logger = new LoggerMock();
  const database = new FirestoreDatabase(firestore, logger, getDateMock);
  return { firestore, database };
}

describe('VehicleLocationsDatabase-Vehicles-Get', function () {

  /* ================= */
  /* === Open data === */
  /* ================= */

  it('[Open data] returns data from database', async function () {
    const { firestore, database } = createDatabase();

    const data = {
      'id1': { lat: 3, lng: 5, angle: 7, millisecondsSince1970: 1971 },
      'id2': { lat: 11, lng: 13, angle: 17, millisecondsSince1970: 1973 }
    };

    firestore.openDataDocument = { timestamp: 'TIMESTAMP', data };

    const result = await database.getOpenDataLastVehicleAngleUpdateLocations();
    expect(firestore.getOpenDataDocumentCallCount).toEqual(1);
    expect(result).toEqual(data);
  });

  it('[Open data] returns no data if no data is in database', async function () {
    const { firestore, database } = createDatabase();

    firestore.openDataDocument = undefined;

    const result = await database.getOpenDataLastVehicleAngleUpdateLocations();
    expect(firestore.getOpenDataDocumentCallCount).toEqual(1);
    expect(result).toBeUndefined();
  });

  /* =========== */
  /* === Mpk === */
  /* =========== */

  it('[Mpk] returns data from database', async function () {
    const { firestore, database } = createDatabase();

    const data = {
      'id1': { lat: 3, lng: 5, angle: 7, millisecondsSince1970: 1971 },
      'id2': { lat: 11, lng: 13, angle: 17, millisecondsSince1970: 1973 }
    };

    firestore.mpkDocument = { timestamp: 'TIMESTAMP', data };

    const result = await database.getMpkLastVehicleAngleUpdateLocations();
    expect(firestore.getMpkDocumentCallCount).toEqual(1);
    expect(result).toEqual(data);
  });

  it('[Mpk] returns no data if no data is in database', async function () {
    const { firestore, database } = createDatabase();

    firestore.mpkDocument = undefined;

    const result = await database.getMpkLastVehicleAngleUpdateLocations();
    expect(firestore.getMpkDocumentCallCount).toEqual(1);
    expect(result).toBeUndefined();
  });
});
