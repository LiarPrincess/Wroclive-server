import { calculateDistanceInMeters, calculateHeading } from '../math';
import { Line, LineLocations, VehicleLocation, MPKVehicle } from '../models';

export interface VehicleUpdatesInput {
  readonly lines: Line[];
  readonly currentVehicleLocations: MPKVehicle[];
  readonly lastHeadingUpdates: VehicleLocation[];
  readonly minMovementToUpdateHeading: number; // meters
}

export interface VehicleUpdatesResult {

/**
 * Current vehicle location.
 */
  readonly lineLocations: LineLocations[];

/**
 * Last location at which heading was updated.
 */
  readonly headingUpdates: VehicleLocation[];
}

export function calculateVehicleLocationUpdates(input: VehicleUpdatesInput): VehicleUpdatesResult {
  const lineLocationAcc: LineLocations[] = [];
  const headingUpdateAcc: VehicleLocation[] = [];

  for (const vehicle of input.currentVehicleLocations) {
    const lineName = vehicle.line.toLowerCase();
    const line = input.lines.find(l => l.name.toLowerCase() === lineName);

    if (!line)
      continue;

    let lineLocations = lineLocationAcc.find(p => p.line === line);
    if (!lineLocations) {
      lineLocations = { line, vehicles: [] };
      lineLocationAcc.push(lineLocations);
    }

    const previousLocation = input.lastHeadingUpdates.find(u => u.id === vehicle.id);
    const angle = calculateAngle(input.minMovementToUpdateHeading, vehicle, previousLocation);

    const vehicleLocation = { id: vehicle.id, lat: vehicle.lat, lng: vehicle.lng, angle };
    lineLocations.vehicles.push(vehicleLocation);

    const hasAngleChanged = !previousLocation || previousLocation.angle !== angle;
    const headingUpdateLocation = hasAngleChanged ? vehicleLocation : (previousLocation as VehicleLocation);
    headingUpdateAcc.push(headingUpdateLocation);
  }

  return { lineLocations: lineLocationAcc, headingUpdates: headingUpdateAcc };
}

function calculateAngle(minDistanceToUpdate: number, vehicle: MPKVehicle, lastLocation?: VehicleLocation): number {
  if (!lastLocation) {
    return 0.0;
  }

  const movement = calculateDistanceInMeters(lastLocation.lat, lastLocation.lng, vehicle.lat, vehicle.lng);
  if (movement < minDistanceToUpdate) {
    return lastLocation.angle;
  }

  return calculateHeading(lastLocation.lat, lastLocation.lng, vehicle.lat, vehicle.lng);
}
