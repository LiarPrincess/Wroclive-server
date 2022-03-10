import {
  FirestoreAllLinesDocument,
  FirestoreLinesDatabase
} from './FirestoreLinesDatabase';
import {
  FirestoreAllStopsDocument,
  FirestoreStopsDatabase
} from './FirestoreStopsDatabase';
import {
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
import { lines, stops, notifications } from './predefined-data';
import { Logger } from '../util';

export class FakeFirestoreDatabase implements
  FirestoreLinesDatabase,
  FirestoreStopsDatabase,
  FirestoreVehicleLocationsDatabase,
  FirestoreNotificationDatabase,
  FirestorePushNotificationTokenDatabase {

  private readonly logger: Logger;

  public constructor(logger: Logger) {
    this.logger = logger;
    this.logger.info(`[Firestore] Starting fake database.`);
  }

  /* ============= */
  /* === Lines === */
  /* ============= */

  public async getAllLines(): Promise<FirestoreAllLinesDocument | undefined> {
    this.logger.info(`[Firestore] Getting lines.`);
    const timestamp = this.createTimestamp();
    return { timestamp, data: lines };
  }

  /* ============= */
  /* === Stops === */
  /* ============= */

  public async getAllStops(): Promise<FirestoreAllStopsDocument | undefined> {
    this.logger.info(`[Firestore] Getting stops.`);
    const timestamp = this.createTimestamp();
    return { timestamp, data: stops };
  }

  /* ========================= */
  /* === Vehicle locations === */
  /* ========================= */

  public async getOpenDataLastVehicleAngleUpdateLocations(): Promise<FirestoreVehicleLocationsDocument | undefined> {
    this.logger.info(`[Firestore][Open data] Getting last vehicle angle update locations.`);
    return undefined;
  }

  public async saveOpenDataLastVehicleAngleUpdateLocations(document: FirestoreVehicleLocationsDocument) {
    this.logger.info(`[Firestore][Open data] Saving last vehicle angle update locations.`);
  }

  public async getMpkLastVehicleAngleUpdateLocations(): Promise<FirestoreVehicleLocationsDocument | undefined> {
    this.logger.info(`[Firestore][Mpk] Getting last vehicle angle update locations.`);
    return undefined;
  }

  public async saveMpkLastVehicleAngleUpdateLocations(document: FirestoreVehicleLocationsDocument) {
    this.logger.info(`[Firestore][Mpk] Saving last vehicle angle update locations.`);
  }

  /* ===================== */
  /* === Notifications === */
  /* ===================== */

  public async getNotifications(): Promise<FirestoreAllNotificationsDocument | undefined> {
    this.logger.info(`[Firestore] Getting notifications.`);
    const timestamp = this.createTimestamp();
    return { timestamp, data: notifications };
  }

  /* ====================================== */
  /* === Apple push notification tokens === */
  /* ====================================== */

  public async saveApplePushNotificationToken(token: FirestorePushNotificationToken) {
    const deviceId = token.deviceId;
    const value = token.token;
    this.logger.info(`[Firestore] Saving Apple push notification token: { deviceId: '${deviceId}', token: '${value}' }.`);
  }

  /* =============== */
  /* === Helpers === */
  /* =============== */

  private createTimestamp(): string {
    return new Date().toISOString();
  }
}
