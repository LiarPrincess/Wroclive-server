import { FirestoreDatabase, storeInterval } from '../FirestoreDatabase';
import { FirestoreDatabaseMock, LoggerMock } from './Mocks';

let date: Date = new Date(0);

const initialDate = new Date(0);
const initialDateTimestamp = '1970-01-01T00:00:00.000Z';

const dateBeforeInterval = new Date(storeInterval - 1);

const dateAfterInterval = new Date(storeInterval + 1);
const dateAfterTimestamp = '1970-01-01T00:00:30.001Z';

function getDateMock(): Date {
  return date;
}

function createDatabase(limitStoreRequests: boolean) {
  const firestore = new FirestoreDatabaseMock();
  const logger = new LoggerMock();
  const database = new FirestoreDatabase(firestore, limitStoreRequests, logger, getDateMock);
  return { firestore, database };
}

const data1 = {
  'id1': { lat: 3, lng: 5, angle: 7 },
  'id2': { lat: 11, lng: 13, angle: 17 }
};

const data2 = {
  'id3': { lat: 19, lng: 23, angle: 27 },
  'id4': { lat: 29, lng: 31, angle: 37 }
};

describe('VehicleLocationsDatabase-Save', function () {

  it('Open data', async function () {
    const { firestore, database } = createDatabase(true);

    date = initialDate;
    await database.saveOpenDataLastVehicleAngleUpdateLocations(data1);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(1);
    expect(firestore.openDataDocument).toEqual({ timestamp: initialDateTimestamp, data: data1 });

    date = dateBeforeInterval;
    await database.saveOpenDataLastVehicleAngleUpdateLocations(data2);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(1);
    expect(firestore.openDataDocument).toEqual({ timestamp: initialDateTimestamp, data: data1 });

    date = dateAfterInterval;
    await database.saveOpenDataLastVehicleAngleUpdateLocations(data2);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(2);
    expect(firestore.openDataDocument).toEqual({ timestamp: dateAfterTimestamp, data: data2 });
  });


  it('Mpk', async function () {
    const { firestore, database } = createDatabase(true);

    date = initialDate;
    await database.saveMpkLastVehicleAngleUpdateLocations(data1);
    expect(firestore.saveMpkDocumentCallCount).toEqual(1);
    expect(firestore.mpkDocument).toEqual({ timestamp: initialDateTimestamp, data: data1 });

    date = dateBeforeInterval;
    await database.saveMpkLastVehicleAngleUpdateLocations(data2);
    expect(firestore.saveMpkDocumentCallCount).toEqual(1);
    expect(firestore.mpkDocument).toEqual({ timestamp: initialDateTimestamp, data: data1 });

    date = dateAfterInterval;
    await database.saveMpkLastVehicleAngleUpdateLocations(data2);
    expect(firestore.saveMpkDocumentCallCount).toEqual(2);
    expect(firestore.mpkDocument).toEqual({ timestamp: dateAfterTimestamp, data: data2 });
  });
});
