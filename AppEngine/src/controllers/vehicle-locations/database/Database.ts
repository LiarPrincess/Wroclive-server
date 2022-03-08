import { createLineFromName as createLineFromNameFn } from './createLineFromName';
import { DatabaseType, VehicleIdToLocation } from './DatabaseType';
import { LineCollection, Line } from '../models';
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
  private readonly dateProvider: DateProvider;

  public constructor(
    database: FirestoreVehicleLocationsDatabase,
    limitStoreRequests: boolean,
    dateProvider?: DateProvider
  ) {
    this.database = database;
    this.dateProvider = dateProvider || (() => new Date());
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
    const result = await this.database.getOpenDataLastVehicleAngleUpdateLocations();
    return result?.data;
  }

  public async saveOpenDataLastVehicleAngleUpdateLocations(locations: VehicleIdToLocation) {
    const document = this.createDocument(locations);
    await this.database.saveOpenDataLastVehicleAngleUpdateLocations(document);
  }

  public async getMpkLastVehicleAngleUpdateLocations(): Promise<VehicleIdToLocation | undefined> {
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
