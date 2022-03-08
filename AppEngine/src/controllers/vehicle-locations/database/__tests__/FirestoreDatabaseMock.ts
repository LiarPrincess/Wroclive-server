import {
  FirestoreVehicleLocationsDatabase,
  FirestoreVehicleLocationsDocument
} from '../../../../cloud-platform';

export class FirestoreDatabaseMock implements FirestoreVehicleLocationsDatabase {

  public getOpenDataDocumentCallCount = 0;
  public saveOpenDataDocumentCallCount = 0;
  public openDataDocument: FirestoreVehicleLocationsDocument | undefined;

  public async getOpenDataLastVehicleAngleUpdateLocations(): Promise<FirestoreVehicleLocationsDocument | undefined> {
    this.getOpenDataDocumentCallCount++;
    return this.openDataDocument;
  }

  public async saveOpenDataLastVehicleAngleUpdateLocations(document: FirestoreVehicleLocationsDocument): Promise<void> {
    this.saveOpenDataDocumentCallCount++;
    this.openDataDocument = document;
  }

  public getMpkDocumentCallCount = 0;
  public saveMpkDocumentCallCount = 0;
  public mpkDocument: FirestoreVehicleLocationsDocument | undefined;

  public async getMpkLastVehicleAngleUpdateLocations(): Promise<FirestoreVehicleLocationsDocument | undefined> {
    this.getMpkDocumentCallCount++;
    return this.mpkDocument;
  }

  public async saveMpkLastVehicleAngleUpdateLocations(document: FirestoreVehicleLocationsDocument): Promise<void> {
    this.saveMpkDocumentCallCount++;
    this.mpkDocument = document;
  }
}
