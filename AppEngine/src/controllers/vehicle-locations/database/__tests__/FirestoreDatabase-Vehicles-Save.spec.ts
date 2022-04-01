import { FirestoreDatabase } from '../FirestoreDatabase';
import { FirestoreDatabaseMock, LoggerMock } from './Mocks';

let date: Date = new Date(0);

const date1 = new Date(0);
const date1Timestamp = '1970-01-01T00:00:00.000Z';

const date2 = new Date(30001);
const date2Timestamp = '1970-01-01T00:00:30.001Z';

function getDateMock(): Date {
  return date;
}

function createDatabase() {
  const firestore = new FirestoreDatabaseMock();
  const logger = new LoggerMock();
  const database = new FirestoreDatabase(firestore, logger, getDateMock);
  return { firestore, database };
}

const data1 = {
  'id1': { lat: 3, lng: 5, angle: 7, millisecondsSince1970: 1971 },
  'id2': { lat: 11, lng: 13, angle: 17, millisecondsSince1970: 1973 }
};

const data2 = {
  'id3': { lat: 19, lng: 23, angle: 27, millisecondsSince1970: 1975 },
  'id4': { lat: 29, lng: 31, angle: 37, millisecondsSince1970: 1977 }
};

describe('VehicleLocationsDatabase-Save', function () {

  it('Open data', async function () {
    const { firestore, database } = createDatabase();

    date = date1;
    await database.saveOpenDataLastVehicleAngleUpdateLocations(data1);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(1);
    expect(firestore.openDataDocument).toEqual({ timestamp: date1Timestamp, data: data1 });

    date = date2;
    await database.saveOpenDataLastVehicleAngleUpdateLocations(data2);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(2);
    expect(firestore.openDataDocument).toEqual({ timestamp: date2Timestamp, data: data2 });
  });

  it('Mpk', async function () {
    const { firestore, database } = createDatabase();

    date = date1;
    await database.saveMpkLastVehicleAngleUpdateLocations(data1);
    expect(firestore.saveMpkDocumentCallCount).toEqual(1);
    expect(firestore.mpkDocument).toEqual({ timestamp: date1Timestamp, data: data1 });

    date = date2;
    await database.saveMpkLastVehicleAngleUpdateLocations(data2);
    expect(firestore.saveMpkDocumentCallCount).toEqual(2);
    expect(firestore.mpkDocument).toEqual({ timestamp: date2Timestamp, data: data2 });
  });
});
