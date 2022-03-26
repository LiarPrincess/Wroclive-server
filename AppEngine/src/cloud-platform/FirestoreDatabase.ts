import * as fs from '@google-cloud/firestore';

import { CloudPlatform } from './CloudPlatform';
import {
  FirestoreAllLinesDocument,
  FirestoreLinesDatabase
} from './FirestoreLinesDatabase';
import {
  FirestoreAllStopsDocument,
  FirestoreStopsDatabase
} from './FirestoreStopsDatabase';
import {
  FirestoreVehicleLocation,
  FirestoreVehicleLocationsDocument,
  FirestoreVehicleLocationsDatabase
} from './FirestoreVehicleLocationsDatabase';
import {
  FirestorePushNotificationToken,
  FirestorePushNotificationTokenDatabase
} from './FirestorePushNotificationTokenDatabase';
import {
  FirestoreAllNotificationsDocument,
  FirestoreNotificationDatabase
} from './FirestoreNotificationDatabase';

export class FirestoreDatabase implements
  FirestoreLinesDatabase,
  FirestoreStopsDatabase,
  FirestoreVehicleLocationsDatabase,
  FirestoreNotificationDatabase,
  FirestorePushNotificationTokenDatabase {

  private db: fs.Firestore;

  public constructor() {
    this.db = new fs.Firestore({
      projectId: CloudPlatform.projectId(),
      keyFilename: CloudPlatform.credentialsFile()
    });

    // We need 'ignoreUndefinedProperties' to allow lines without 'stopArrivalTimes'.
    this.db.settings({
      ignoreUndefinedProperties: true
    });
  }

  /* ============= */
  /* === Lines === */
  /* ============= */

  private get linesCollectionRef(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('Lines');
  }

  private get allLinesDocumentRef(): fs.DocumentReference<any> {
    return this.linesCollectionRef.doc('all');
  }

  public async getAllLines(): Promise<FirestoreAllLinesDocument | undefined> {
    const doc = await this.allLinesDocumentRef.get();
    const data = doc.data() as FirestoreAllLinesDocument | undefined;
    return data;
  }

  public async saveAllLines(document: FirestoreAllLinesDocument) {
    await this.allLinesDocumentRef.set(document);
  }

  /* ============= */
  /* === Stops === */
  /* ============= */

  private get stopsCollectionRef(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('Stops');
  }

  private get allStopsDocumentRef(): fs.DocumentReference<any> {
    return this.stopsCollectionRef.doc('all');
  }

  public async getAllStops(): Promise<FirestoreAllStopsDocument | undefined> {
    const doc = await this.allStopsDocumentRef.get();
    const data = doc.data() as FirestoreAllStopsDocument | undefined;
    return data;
  }

  public async saveAllStops(document: FirestoreAllStopsDocument) {
    await this.allStopsDocumentRef.set(document);
  }

  /* ========================= */
  /* === Vehicle locations === */
  /* ========================= */

  private get vehicleLocationsCollectionRef(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('LastVehicleAngleUpdateLocations');
  }

  private get openDataVehicleLocationsDocumentRef(): fs.DocumentReference<any> {
    return this.vehicleLocationsCollectionRef.doc('OpenData');
  }

  private get mpkVehicleLocationsDocumentRef(): fs.DocumentReference<any> {
    return this.vehicleLocationsCollectionRef.doc('MPK');
  }

  public async getOpenDataLastVehicleAngleUpdateLocations(): Promise<FirestoreVehicleLocationsDocument | undefined> {
    return this.getVehicleLocations(this.openDataVehicleLocationsDocumentRef);
  }

  public async saveOpenDataLastVehicleAngleUpdateLocations(document: FirestoreVehicleLocationsDocument) {
    await this.saveVehicleLocations(this.openDataVehicleLocationsDocumentRef, document);
  }

  public async getMpkLastVehicleAngleUpdateLocations(): Promise<FirestoreVehicleLocationsDocument | undefined> {
    return this.getVehicleLocations(this.mpkVehicleLocationsDocumentRef);
  }

  public async saveMpkLastVehicleAngleUpdateLocations(document: FirestoreVehicleLocationsDocument) {
    await this.saveVehicleLocations(this.mpkVehicleLocationsDocumentRef, document);
  }

  private async getVehicleLocations(ref: fs.DocumentReference<any>): Promise<FirestoreVehicleLocationsDocument | undefined> {
    const doc = await ref.get();
    const data = doc.data() as FirestoreVehicleLocationsDocument | undefined;
    return data;
  }

  private async saveVehicleLocations(ref: fs.DocumentReference<any>, document: FirestoreVehicleLocationsDocument) {
    // Firestore doesn't support JavaScript objects with custom prototypes
    // (i.e. objects that were created via the "new" operator).
    //
    // Solution: we have to create a new object.

    const data: any = {};
    for (const vehicleId in document.data) {
      if (Object.prototype.hasOwnProperty.call(document.data, vehicleId)) {
        const loc = document.data[vehicleId];
        if (loc !== undefined) {
          const location: FirestoreVehicleLocation = {
            lat: loc.lat,
            lng: loc.lng,
            angle: loc.angle,
            millisecondsSince1970: loc.millisecondsSince1970
          };
          data[vehicleId] = location;
        }
      }
    }

    const timestamp = document.timestamp;
    const firestoreDocument: FirestoreVehicleLocationsDocument = { timestamp, data };
    await ref.set(firestoreDocument);
  }

  /* ===================== */
  /* === Notifications === */
  /* ===================== */

  private get notificationsCollectionRef(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('Notifications');
  }

  private get allNotificationsDocumentRef(): fs.DocumentReference<any> {
    return this.notificationsCollectionRef.doc('all');
  }

  public async getNotifications(): Promise<FirestoreAllNotificationsDocument | undefined> {
    const doc = await this.allNotificationsDocumentRef.get();
    const data = doc.data() as FirestoreAllNotificationsDocument | undefined;
    return data;
  }

  /* ====================================== */
  /* === Apple push notification tokens === */
  /* ====================================== */

  private get applePushNotificationTokensCollectionRef(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('PushNotificationTokensApple');
  }

  public async saveApplePushNotificationToken(token: FirestorePushNotificationToken) {
    // Firestore doesn't support JavaScript objects with custom prototypes
    // (i.e. objects that were created via the "new" operator).
    //
    // Solution: we have to create a new object.
    const firestoreToken: FirestorePushNotificationToken = {
      deviceId: token.deviceId,
      token: token.token,
      createdAt: token.createdAt
    };

    const deviceId = firestoreToken.deviceId;
    const documentRef = this.applePushNotificationTokensCollectionRef.doc(deviceId);
    await documentRef.set(firestoreToken);
  }
}
