/** Location of a single vehicle. */
export class VehicleLocation {
  constructor(
    public readonly id: string,
    public readonly lat: number,
    public readonly lng: number,
    public readonly angle: number
  ) { }
}

export { Line, LineCollection } from '../lines';

/** Information about a single line. */
export class LineLocationLine {
  constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly subtype: string
  ) { }
}

/** All of the vehicle locations for given line */
export class LineLocations {
  constructor(
    public readonly line: LineLocationLine,
    public readonly vehicles: VehicleLocation[]
  ) { }
}

export class LineLocationsCollection {
  constructor(
    public readonly timestamp: string,
    public readonly data: LineLocations[]
  ) { }
}

/* ================ */
/* === Internal === */
/* ================ */

// This is an implementation detail, and it should not be exposed to the outside.
export class VehicleLocationFromApi {
  constructor(
    public readonly id: string,
    public readonly line: string,
    public readonly lat: number,
    public readonly lng: number
  ) { }
}

export interface Logger {
  error(message?: any, ...optionalParams: any[]): void;
}
