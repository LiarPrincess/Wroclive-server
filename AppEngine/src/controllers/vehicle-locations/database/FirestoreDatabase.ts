import { DatabaseType, VehicleIdToLocation } from "./DatabaseType";
import { LineCollection, Line } from "../models";
import { Logger } from "../../../util";
import { FirestoreVehicleLocationsDatabase, FirestoreVehicleLocationsDocument } from "../../../cloud-platform";

export type DateProvider = () => Date;

export class FirestoreDatabase implements DatabaseType {
  private readonly database: FirestoreVehicleLocationsDatabase;
  private readonly logger: Logger;
  private readonly dateProvider: DateProvider;

  private lines: Line[] = [];

  public constructor(database: FirestoreVehicleLocationsDatabase, logger: Logger, dateProvider?: DateProvider) {
    this.database = database;
    this.logger = logger;
    this.dateProvider = dateProvider || (() => new Date());
  }

  /* ============= */
  /* === Lines === */
  /* ============= */

  public async getLines(): Promise<Line[]> {
    return this.lines;
  }

  public async setLines(lines: LineCollection) {
    this.lines = lines.data;
  }

  /* ========================= */
  /* === Vehicle locations === */
  /* ========================= */

  public async getOpenDataLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined> {
    try {
      this.logger.info(`[Open data] Getting last vehicle angle update locations.`);
      const document = await this.database.getOpenDataLastVehicleAngleUpdateLocations();
      return document?.data;
    } catch (error) {
      this.logger.error(`[Open data] Failed to get last vehicle angle update locations.`, error);
      return undefined;
    }
  }

  public async saveOpenDataLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation) {
    try {
      const now = this.dateProvider();
      const document = this.createDocument(now, locations);
      await this.database.saveOpenDataLastVehicleAngleUpdateLocations(document);
    } catch (error) {
      this.logger.error("[Open data] Failed to store last vehicle angle update locations.", error);
    }
  }

  public async getMpkLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined> {
    try {
      this.logger.info(`[Mpk] Getting last vehicle angle update locations.`);
      const result = await this.database.getMpkLastVehicleAngleUpdateLocations();
      return result?.data;
    } catch (error) {
      this.logger.error(`[Mpk] Failed to get last vehicle angle update locations.`, error);
      return undefined;
    }
  }

  public async saveMpkLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation) {
    try {
      const now = this.dateProvider();
      const document = this.createDocument(now, locations);
      await this.database.saveMpkLastVehicleAngleUpdateLocations(document);
    } catch (error) {
      this.logger.error("[Mpk] Failed to store last vehicle angle update locations.", error);
    }
  }

  private createDocument(date: Date, locations: VehicleIdToLocation): FirestoreVehicleLocationsDocument {
    const timestamp = date.toISOString();
    return { timestamp, data: locations };
  }
}
