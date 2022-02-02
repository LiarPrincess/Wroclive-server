import { LineCollection, Line } from '../../lines';
import { createLineFromName as createLineFromNameFn } from './createLineFromName';

interface LineByName {
  [key: string]: Line | undefined;
}

export class LineDatabase {

  private linesByName: LineByName = {};
  private linesByNameTimestamp: string | undefined = undefined;
  private lineNamesLowercase: string[] = [];

  updateLineDefinitions(lines: LineCollection) {
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

  /**
   * Get names of all of the lines.
   */
  getLineNamesLowercase(): string[] {
    return this.lineNamesLowercase;
  }

  /**
   * Get as single line by its name.
   */
  getLineByName(name: string): Line {
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
