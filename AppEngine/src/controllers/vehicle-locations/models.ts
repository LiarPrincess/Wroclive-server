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
export class LineLocation {
  constructor(
    public readonly line: LineLocationLine,
    public readonly vehicles: VehicleLocation[]
  ) { }
}

export class LineLocationCollection {
  constructor(
    public readonly timestamp: string,
    public readonly data: LineLocation[]
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
