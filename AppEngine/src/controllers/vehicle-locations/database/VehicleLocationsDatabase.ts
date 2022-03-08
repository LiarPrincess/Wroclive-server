import { VehicleLocationsDatabaseType } from './VehicleLocationsDatabaseType';
import { createLineFromName as createLineFromNameFn } from './createLineFromName';
import { LineCollection, Line } from '../models';
import { FirestoreVehicleLocationsDatabase } from '../../../cloud-platform';

interface LineByName {
  [key: string]: Line | undefined;
}

export class VehicleLocationsDatabase implements VehicleLocationsDatabaseType {

  private readonly db: FirestoreVehicleLocationsDatabase;
  private linesByName: LineByName = {};
  private linesByNameTimestamp: string | undefined = undefined;
  private lineNamesLowercase: string[] = [];

  public constructor(db: FirestoreVehicleLocationsDatabase) {
    this.db = db;
  }

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
}
