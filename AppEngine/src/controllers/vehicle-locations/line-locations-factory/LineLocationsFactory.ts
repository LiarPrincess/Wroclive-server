import { VehicleFilter } from '../vehicle-filters';
import { LineLocations, VehicleLocation, Vehicle, LineData } from '../models';
import { Line, LineCollection } from '../..';
import { createLineFromName } from './createLineFromName';
import { calculateDistanceInMeters, calculateHeading } from '../math';

/* ============== */
/* === Config === */
/* ============== */

/**
 * Min distance that vehicle has to move to update its heading (in meters).
 */
export const minMovementToUpdateHeading = 30;

/* ================================ */
/* === Vehicle location updater === */
/* ================================ */

interface LineByName {
  [key: string]: Line | undefined;
}

interface VehicleLocationById {
  [key: string]: VehicleLocation | undefined;
}

/**
 * Class responsible for calculating vehicle updates.
 */
export class LineLocationsFactory {

  /**
   * We will cache 'linesByName' to avoid traversal/object creation.
   * Key is the lowercased (!) line name.
   */
  private linesByName: LineByName = {};
  // Initial cache key.
  // 'undefined' will force 1st 'linesByName' update.
  private linesByNameTimestamp: string | undefined = undefined;

  /**
   * Last place at which we updated vehicle angle/heading.
   */
  private lastVehicleHeadingUpdatesById: VehicleLocationById = {};

  private filter: VehicleFilter;

  constructor(filter: VehicleFilter) {
    this.filter = filter;
  }

  create(
    currentLineDefinitions: LineCollection,
    currentVehicleLocations: Vehicle[]
  ): LineLocations[] {
    this.recalculateLinesByName(currentLineDefinitions);

    const result: LineLocations[] = [];
    const headingUpdateAcc: VehicleLocationById = {};

    this.filter.prepareForFiltering();
    for (const vehicle of currentVehicleLocations) {
      const lineNameLowercase = vehicle.line.toLowerCase();
      let line = this.linesByName[lineNameLowercase];

      if (!line) {
        // Weird case: mpk knows this line (they returned vehicles), but we don't.
        // We will trust mpk and try to create this line from scratch.
        line = createLineFromName(lineNameLowercase);
        this.linesByName[lineNameLowercase] = line;
      }

      const isAccepted = this.filter.isAccepted(vehicle, line);
      if (!isAccepted) {
        continue;
      }

      // Reasons for 'line as Line' cast:
      // 'line' is never undefined because we set it inside 'if (!line) { line = … }'
      let lineLocations = result.find(p => p.line.name === (line as Line).name);
      if (!lineLocations) {
        const lineData = new LineData(line.name, line.type, line.subtype);
        lineLocations = new LineLocations(lineData, []);
        result.push(lineLocations);
      }

      const lastHeadingUpdateLocation = this.lastVehicleHeadingUpdatesById[vehicle.id];
      const angle = this.calculateAngle(vehicle, lastHeadingUpdateLocation);

      const vehicleLocation = new VehicleLocation(vehicle.id, vehicle.lat, vehicle.lng, angle);
      lineLocations.vehicles.push(vehicleLocation);

      // Remembering heading update location:
      // - if this is a new vehicle -> no previous location present -> current location
      // - otherwise: it has previous angle
      //   - if the angle has changed -> current location
      //   - otherwise: angle is the same -> old location
      const isNewVehicleOrAngleHasChanged = !lastHeadingUpdateLocation || lastHeadingUpdateLocation.angle !== angle;
      const headingUpdateLocation = isNewVehicleOrAngleHasChanged ? vehicleLocation : lastHeadingUpdateLocation;
      headingUpdateAcc[vehicle.id] = headingUpdateLocation;
    }

    this.lastVehicleHeadingUpdatesById = headingUpdateAcc;
    return result;
  }

  private recalculateLinesByName(currentLineDefinitions: LineCollection) {
    const timestamp = currentLineDefinitions.timestamp;
    const cachedTimestamp = this.linesByNameTimestamp;
    const isTimestampEqual = cachedTimestamp && cachedTimestamp == timestamp;
    if (isTimestampEqual) {
      return;
    }

    this.linesByName = {};
    this.linesByNameTimestamp = timestamp;

    for (const line of currentLineDefinitions.data) {
      const name = line.name.toLowerCase();
      this.linesByName[name] = line;
    }
  }

  private calculateAngle(vehicle: Vehicle, lastLocation: VehicleLocation | undefined): number {
    if (!lastLocation) {
      return 0.0;
    }

    const movement = calculateDistanceInMeters(lastLocation.lat, lastLocation.lng, vehicle.lat, vehicle.lng);
    if (movement < minMovementToUpdateHeading) {
      return lastLocation.angle;
    }

    return calculateHeading(lastLocation.lat, lastLocation.lng, vehicle.lat, vehicle.lng);
  }
}
