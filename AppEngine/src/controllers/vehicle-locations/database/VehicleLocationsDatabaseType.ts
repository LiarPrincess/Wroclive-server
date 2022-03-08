import { LineCollection, Line } from '../models';

export interface VehicleLocationsDatabaseType {
  /** Get a single line by its name. */
  getLineByName(name: string): Line;
  /** Get names of all of the lines. */
  getLineNamesLowercase(): string[];
  updateLineDefinitions(lines: LineCollection): void;
}
