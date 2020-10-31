import { VehicleFilter, DefaultVehicleFilter } from './VehicleFilters';
import { calculateDistanceInMeters, calculateHeading } from '../math';
import { Line, LineLocations, VehicleLocation, MPKVehicle } from '../models';

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
export class VehicleLocationUpdater {

  private linesByName: LineByName = {};

  /**
   * Last place at which we updated vehicle angle/heading.
   */
  private lastVehicleHeadingUpdatesById: VehicleLocationById = {};

  private filter: VehicleFilter;

  constructor(filter?: VehicleFilter) {
    this.filter = filter || (new DefaultVehicleFilter());
  }

  /* ============== */
  /* === Lines === */
  /* ============== */

  setLines(lines: Line[]) {
    this.linesByName = {};

    for (const line of lines) {
      const name = line.name.toLowerCase();
      this.linesByName[name] = line;
    }
  }

  /* ========================= */
  /* === Vehicle locations === */
  /* ========================= */

  calculateVehicleLocations(currentVehicleLocations: MPKVehicle[]): LineLocations[] {
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
        line = this.createArtificialLine(lineName);
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

  // 'public' so that we can unit test it
  createArtificialLine(name: string): Line {
    function createLine(type: string, subtype: string): Line {
      return { name, type, subtype };
    }

    // 'Bus - Regular' is most probable
    const defaultLineWhenNothingMatches = createLine('Bus', 'Regular');

    // Does it start with a number?
    const number = Number.parseInt(name);
    if (!Number.isNaN(number)) {
      // Examples: 4, 5, 31, 33, 70, 71
      if (number < 100) {
        return createLine('Tram', 'Regular');
      }

      // Examples: 126, 134, 143
      if (number < 200) {
        return createLine('Bus', 'Regular');
      }

      // Examples: 242, 251
      if (number < 300) {
        return createLine('Bus', 'Night');
      }

      // Examples: 319, 325
      if (number < 400) {
        return createLine('Bus', 'Regular');
      }

      // Examples: 602, 607, 609
      if (600 <= number && number < 700) {
        return createLine('Bus', 'Suburban');
      }

      // Examples: 701, 714
      if (700 <= number && number < 800) {
        return createLine('Bus', 'Temporary');
      }

      return defaultLineWhenNothingMatches;
    }

    // Now we know that 'name' start with letter

    // Special lines: E1, E2
    const isHoliday = (name.startsWith('e') || name.startsWith('E')) && name.length > 1;
    if (isHoliday) {
      return createLine('Tram', 'Regular');
    }

    // Examples: A, C, D, K, N
    if (name.length == 1) {
      return createLine('Bus', 'Express');
    }

    return defaultLineWhenNothingMatches;
  }

  private calculateAngle(vehicle: MPKVehicle, lastLocation?: VehicleLocation): number {
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
