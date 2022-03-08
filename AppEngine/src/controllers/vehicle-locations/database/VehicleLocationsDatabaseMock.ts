import { VehicleLocationsDatabaseType } from './VehicleLocationsDatabaseType';
import { LineCollection, Line } from '../models';

interface LineByName {
  [key: string]: Line;
}

export class VehicleLocationsDatabaseMock implements VehicleLocationsDatabaseType {

  public getLineByNameCallCount = 0;
  private linesByNameLowercase: LineByName = {};

  public getLineByName(name: string): Line {
    this.getLineByNameCallCount++;

    const nameLower = name.toLowerCase();
    const result = this.linesByNameLowercase[nameLower];
    return result || new Line(name, 'NO_MOCK', 'NO_MOCK');
  }

  public getLineNamesLowercaseCallCount = 0;
  private lineNamesLowercase: string[] = [];

  public getLineNamesLowercase(): string[] {
    this.getLineNamesLowercaseCallCount++;
    return this.lineNamesLowercase;
  }

  public updateLineDefinitionsCallCount = 0;

  public updateLineDefinitions(lines: LineCollection): void {
    this.updateLineDefinitionsCallCount++;

    this.lineNamesLowercase = [];
    for (const line of lines.data) {
      const lineNameLower = line.name.toLowerCase();
      this.lineNamesLowercase.push(lineNameLower);
      this.linesByNameLowercase[lineNameLower] = line;
    }
  }
}
