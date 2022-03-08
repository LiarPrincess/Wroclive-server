import { Line } from '../../models';
import { Database } from '../Database';
import { FirestoreDatabaseMock } from './FirestoreDatabaseMock';

const lineA = new Line('A', 'Bus', 'Express');
const line4 = new Line('4', 'Tram', 'Regular');
const line125 = new Line('125', 'Bus', 'Regular');

let date: Date = new Date(0);

function getDateMock(): Date {
  return date;
}

function createDatabase() {
  const firestore = new FirestoreDatabaseMock();
  const database = new Database(firestore, false, getDateMock);
  return { firestore, database };
}

describe('VehicleLocationsDatabase-Vehicles', function () {

  /* ================= */
  /* === Open data === */
  /* ================= */

  it('[Open data] returns data from database', async function () {
    const { firestore, database } = createDatabase();

    const data = {
      'id1': { lat: 3, lng: 5, angle: 7 },
      'id2': { lat: 11, lng: 13, angle: 17 }
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

  it('[Open data] stores data in database', async function () {
    const { firestore, database } = createDatabase();

    date = new Date(12345679012345);
    const data = {
      'id1': { lat: 3, lng: 5, angle: 7 },
      'id2': { lat: 11, lng: 13, angle: 17 }
    };

    await database.saveOpenDataLastVehicleAngleUpdateLocations(data);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(1);
    expect(firestore.openDataDocument).toEqual({
      timestamp: '2361-03-21T19:16:52.345Z',
      data
    });
  });

  /* =========== */
  /* === Mpk === */
  /* =========== */

  it('[Mpk] returns data from database', async function () {
    const { firestore, database } = createDatabase();

    const data = {
      'id1': { lat: 3, lng: 5, angle: 7 },
      'id2': { lat: 11, lng: 13, angle: 17 }
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

  it('[Mpk] stores data in database', async function () {
    const { firestore, database } = createDatabase();

    date = new Date(12345679012345);
    const data = {
      'id1': { lat: 3, lng: 5, angle: 7 },
      'id2': { lat: 11, lng: 13, angle: 17 }
    };

    await database.saveMpkLastVehicleAngleUpdateLocations(data);
    expect(firestore.saveMpkDocumentCallCount).toEqual(1);
    expect(firestore.mpkDocument).toEqual({
      timestamp: '2361-03-21T19:16:52.345Z',
      data
    });
  });
});
