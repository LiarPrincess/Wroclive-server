import { Logger } from '../../../util';
import { subtractMilliseconds } from '../helpers';
import {
  FirestoreVehicleLocationsDatabase,
  FirestoreVehicleLocationsDocument
} from '../../../cloud-platform';

// For calculating intervals.
export const second = 1000;
export const minute = 60 * second;
export const hour = 60 * minute;

export const storeInterval = 30 * second;

export type DateProvider = () => Date;

/**
 * Will store once per 'storeInterval'.
 */
export class FirestoreStoreLimiter implements FirestoreVehicleLocationsDatabase {

  private readonly inner: FirestoreVehicleLocationsDatabase;
  private readonly logger: Logger;
  private readonly dateProvider: DateProvider;

  private openDataLastStore: Date | undefined;
  private mpkLastStore: Date | undefined;

  public constructor(
    inner: FirestoreVehicleLocationsDatabase,
    logger: Logger,
    dateProvider: DateProvider
  ) {
    this.inner = inner;
    this.logger = logger;
    this.dateProvider = dateProvider;
  }

  public async getOpenDataLastVehicleAngleUpdateLocations(): Promise<FirestoreVehicleLocationsDocument | undefined> {
    return this.inner.getOpenDataLastVehicleAngleUpdateLocations();
  }

  public async saveOpenDataLastVehicleAngleUpdateLocations(document: FirestoreVehicleLocationsDocument): Promise<void> {
    const now = this.dateProvider();

    let shouldStore = true;
    if (this.openDataLastStore !== undefined) {
      const diff = subtractMilliseconds(now, this.openDataLastStore);
      shouldStore = diff > storeInterval;
    }

    if (shouldStore) {
      this.logger.info('[Open data] Storing last vehicle angle update locations.');
      this.inner.saveOpenDataLastVehicleAngleUpdateLocations(document);
      this.openDataLastStore = now;
    }
  }

  public async getMpkLastVehicleAngleUpdateLocations(): Promise<FirestoreVehicleLocationsDocument | undefined> {
    return this.inner.getMpkLastVehicleAngleUpdateLocations();
  }

  public async saveMpkLastVehicleAngleUpdateLocations(document: FirestoreVehicleLocationsDocument): Promise<void> {
    const now = this.dateProvider();

    let shouldStore = true;
    if (this.mpkLastStore !== undefined) {
      const diff = subtractMilliseconds(now, this.mpkLastStore);
      shouldStore = diff > storeInterval;
    }

    if (shouldStore) {
      this.logger.info('[Mpk] Storing last vehicle angle update locations.');
      this.inner.saveMpkLastVehicleAngleUpdateLocations(document);
      this.mpkLastStore = now;
    }
  }
}
