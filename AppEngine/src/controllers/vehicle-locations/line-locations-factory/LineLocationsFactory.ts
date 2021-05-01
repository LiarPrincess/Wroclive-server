import { Line } from '../..';
import { Vehicle } from '../vehicle-providers';
import { VehicleFilter } from '../vehicle-filters';
import { LineLocations, VehicleLocation } from '../models';
import { createLineFromName } from './createLineFromName';
import { calculateDistanceInMeters, calculateHeading } from '../math';
import { TimestampedLines } from 'controllers/lines';

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
  [key: string]: Line;
}

interface VehicleLocationById {
  [key: string]: VehicleLocation;
}

/**
 * Class responsible for calculating vehicle updates.
 */
export class LineLocationsFactory {

  // We will cache 'linesByName' to avoid traversal/object creation.
  private linesByName: LineByName = {};
  private linesByNameTimestamp = '';

  /**
   * Last place at which we updated vehicle angle/heading.
   */
  private lastVehicleHeadingUpdatesById: VehicleLocationById = {};

  private filter: VehicleFilter;

  constructor(filter: VehicleFilter) {
    this.filter = filter;
  }

  create(
    currentLineDefinitions: TimestampedLines,
    currentVehicleLocations: Vehicle[]
  ): LineLocations[] {
    this.recalculateLinesByName(currentLineDefinitions);

    const result: LineLocations[] = [];
    const headingUpdateAcc: VehicleLocationById = {};

    this.filter.prepareForFiltering();
    for (const vehicle of currentVehicleLocations) {
      const lineName = vehicle.line.toLowerCase();
      let line = this.linesByName[lineName];

      if (!line) {
        // Weird case:
        // - user requested line
        // - mpk knows about this line (they returned vehicles)
        // - updater does not know about this line
        // We will trust mpk and try to create this line from scratch.
        line = createLineFromName(lineName);
        this.linesByName[lineName] = line;
      }

      const isAccepted = this.filter.isAccepted(vehicle, line);
      if (!isAccepted) {
        continue;
      }

      let lineLocations = result.find(p => p.line.name === line.name);
      if (!lineLocations) {
        lineLocations = { line, vehicles: [] };
        result.push(lineLocations);
      }

      const previousLocation = this.lastVehicleHeadingUpdatesById[vehicle.id];
      const angle = this.calculateAngle(vehicle, previousLocation);

      const vehicleLocation = { id: vehicle.id, lat: vehicle.lat, lng: vehicle.lng, angle };
      lineLocations.vehicles.push(vehicleLocation);

      const hasAngleChanged = !previousLocation || previousLocation.angle !== angle;
      const headingUpdateLocation = hasAngleChanged ? vehicleLocation : (previousLocation as VehicleLocation);
      headingUpdateAcc[vehicle.id] = headingUpdateLocation;
    }

    this.lastVehicleHeadingUpdatesById = headingUpdateAcc;
    return result;
  }

  private recalculateLinesByName(currentLineDefinitions: TimestampedLines) {
    const timestamp = currentLineDefinitions.timestamp;
    const isTimestampEqual = this.linesByNameTimestamp == timestamp;
    if (isTimestampEqual) {
      return;
    }

    this.linesByName = {};

    for (const line of currentLineDefinitions.data) {
      const name = line.name.toLowerCase();
      this.linesByName[name] = line;
    }
  }

  private calculateAngle(vehicle: Vehicle, lastLocation?: VehicleLocation): number {
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