import { FirestoreDatabaseMock, LoggerMock } from './Mocks';
import { FirestoreStoreLimiter, storeInterval } from '../FirestoreStoreLimiter';

let date: Date = new Date();

const initialDate = new Date(0);
const dateBeforeInterval = new Date(storeInterval - 1);
const dateAfterInterval = new Date(storeInterval + 1);

const document1 = {
  timestamp: 'TIMESTAMP1',
  data: {
    'id1': { lat: 3, lng: 5, angle: 7 },
    'id2': { lat: 11, lng: 13, angle: 17 }
  }
};

const document2 = {
  timestamp: 'TIMESTAMP1',
  data: {
    'id3': { lat: 19, lng: 23, angle: 27 },
    'id4': { lat: 29, lng: 31, angle: 37 }
  }
};

function getDateMock(): Date {
  return date;
}

describe('FirestoreStoreLimiter', function () {

  it('Open data', function () {
    const firestore = new FirestoreDatabaseMock();
    const logger = new LoggerMock();
    const limiter = new FirestoreStoreLimiter(firestore, logger, getDateMock);

    date = initialDate;
    limiter.saveOpenDataLastVehicleAngleUpdateLocations(document1);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(1);
    expect(firestore.openDataDocument).toEqual(document1);

    date = dateBeforeInterval;
    limiter.saveOpenDataLastVehicleAngleUpdateLocations(document2);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(1);
    expect(firestore.openDataDocument).toEqual(document1);

    date = dateAfterInterval;
    limiter.saveOpenDataLastVehicleAngleUpdateLocations(document2);
    expect(firestore.saveOpenDataDocumentCallCount).toEqual(2);
    expect(firestore.openDataDocument).toEqual(document2);
  });

  it('Mpk', function () {
    const firestore = new FirestoreDatabaseMock();
    const logger = new LoggerMock();
    const limiter = new FirestoreStoreLimiter(firestore, logger, getDateMock);

    date = initialDate;
    limiter.saveMpkLastVehicleAngleUpdateLocations(document1);
    expect(firestore.saveMpkDocumentCallCount).toEqual(1);
    expect(firestore.mpkDocument).toEqual(document1);

    date = dateBeforeInterval;
    limiter.saveMpkLastVehicleAngleUpdateLocations(document2);
    expect(firestore.saveMpkDocumentCallCount).toEqual(1);
    expect(firestore.mpkDocument).toEqual(document1);

    date = dateAfterInterval;
    limiter.saveMpkLastVehicleAngleUpdateLocations(document2);
    expect(firestore.saveMpkDocumentCallCount).toEqual(2);
    expect(firestore.mpkDocument).toEqual(document2);
  });
});
