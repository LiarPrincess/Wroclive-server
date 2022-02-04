import {
  VehicleLocation,
  Line,
  LineData,
  LineLocations
} from '../models';

interface LineNameToIndex {
  [key: string]: number | undefined;
}

export class LineLocationsAggregator {

  private readonly lineLocations: LineLocations[];
  private readonly lineNameToIndex: LineNameToIndex;

  constructor() {
    this.lineLocations = [];
    this.lineNameToIndex = {};
  }

  addVehicle(line: Line, vehicle: VehicleLocation) {
    const lineNameLower = line.name.toLowerCase();
    let lineIndex = this.lineNameToIndex[lineNameLower];

    if (lineIndex === undefined) {
      const lineData = new LineData(line.name, line.type, line.subtype);
      const lineLocations = new LineLocations(lineData, []);

      lineIndex = this.lineLocations.length;
      this.lineLocations.push(lineLocations);
      this.lineNameToIndex[lineNameLower] = lineIndex;
    }

    const lineLocations = this.lineLocations[lineIndex];
    lineLocations.vehicles.push(vehicle);
  }

  getLineLocations(): LineLocations[] {
    return this.lineLocations;
  }
}
