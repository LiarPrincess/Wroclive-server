import {
  VehicleLocation,
  Line,
  LineLocationLine,
  LineLocation
} from '../models';

interface LineNameToIndex {
  [key: string]: number | undefined;
}

export class LineLocationsAggregator {

  private readonly lineLocations: LineLocation[];
  private readonly lineNameToIndex: LineNameToIndex;

  constructor() {
    this.lineLocations = [];
    this.lineNameToIndex = {};
  }

  addVehicle(line: Line, vehicle: VehicleLocation) {
    const lineNameLower = line.name.toLowerCase();
    let lineIndex = this.lineNameToIndex[lineNameLower];

    if (lineIndex === undefined) {
      const lineData = new LineLocationLine(line.name, line.type, line.subtype);
      const lineLocations = new LineLocation(lineData, []);

      lineIndex = this.lineLocations.length;
      this.lineLocations.push(lineLocations);
      this.lineNameToIndex[lineNameLower] = lineIndex;
    }

    const lineLocations = this.lineLocations[lineIndex];
    lineLocations.vehicles.push(vehicle);
  }

  getLineLocations(): LineLocation[] {
    return this.lineLocations;
  }
}
