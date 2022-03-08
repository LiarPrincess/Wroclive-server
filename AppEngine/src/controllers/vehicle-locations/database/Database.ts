import { DatabaseType, VehicleIdToLocation } from './DatabaseType';
import { createLineFromName as createLineFromNameFn } from './createLineFromName';
import { FirestoreStoreLimiter } from './FirestoreStoreLimiter';
import { LineCollection, Line } from '../models';
import { Logger } from '../../../util';
import {
  FirestoreVehicleLocationsDatabase,
  FirestoreVehicleLocationsDocument
} from '../../../cloud-platform';

interface LineByName {
  [key: string]: Line | undefined;
}

export type DateProvider = () => Date;

export class Database implements DatabaseType {

  private linesByName: LineByName = {};
  private linesByNameTimestamp: string | undefined = undefined;
  private lineNamesLowercase: string[] = [];

  private readonly database: FirestoreVehicleLocationsDatabase;
  private readonly logger: Logger;
  private readonly dateProvider: DateProvider;

  public constructor(
    database: FirestoreVehicleLocationsDatabase,
    logger: Logger,
    limitStoreRequests: boolean,
    dateProvider?: DateProvider
  ) {
    const dp = dateProvider || (() => new Date());
    this.database = limitStoreRequests ? new FirestoreStoreLimiter(database, logger, dp) : database;
    this.logger = logger;
    this.dateProvider = dp;
  }

  /* ============= */
  /* === Lines === */
  /* ============= */

  public updateLineDefinitions(lines: LineCollection) {
    const timestamp = lines.timestamp;
    const cachedTimestamp = this.linesByNameTimestamp;
    const isTimestampEqual = cachedTimestamp && cachedTimestamp == timestamp;
    if (isTimestampEqual) {
      return;
    }

    this.linesByName = {};
    this.linesByNameTimestamp = timestamp;
    this.lineNamesLowercase = [];

    for (const line of lines.data) {
      const nameLower = line.name.toLowerCase();
      this.linesByName[nameLower] = line;
      this.lineNamesLowercase.push(nameLower);
    }
  }

  public getLineNamesLowercase(): string[] {
    return this.lineNamesLowercase;
  }

  public getLineByName(name: string): Line {
    const lineNameLowercase = name.toLowerCase();

    const line = this.linesByName[lineNameLowercase];
    if (line) {
      return line;
    }

    // Weird case: mpk knows this line (they returned vehicles), but we don't.
    // We will trust mpk and try to create this line from scratch.
    const newLine = createLineFromNameFn(name);
    this.linesByName[lineNameLowercase] = newLine;
    return newLine;
  }

  /* ========================= */
  /* === Vehicle locations === */
  /* ========================= */

  public async getOpenDataLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined> {
    this.logger.info(`[Open data] Getting last vehicle angle update locations.`);
    const document = await this.database.getOpenDataLastVehicleAngleUpdateLocations();
    return document?.data;
  }

  public async saveOpenDataLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation) {
    const document = this.createDocument(locations);
    await this.database.saveOpenDataLastVehicleAngleUpdateLocations(document);
  }

  public async getMpkLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined> {
    this.logger.info(`[Mpk] Getting last vehicle angle update locations.`);
    const result = await this.database.getMpkLastVehicleAngleUpdateLocations();
    return result?.data;
  }

  public async saveMpkLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation) {
    const document = this.createDocument(locations);
    await this.database.saveMpkLastVehicleAngleUpdateLocations(document);
  }

  private createDocument(locations: VehicleIdToLocation): FirestoreVehicleLocationsDocument {
    const now = this.dateProvider();
    const timestamp = now.toISOString();
    return { timestamp, data: locations };
  }
}
