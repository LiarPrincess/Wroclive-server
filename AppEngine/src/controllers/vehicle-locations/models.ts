export class VehicleLocation {

  readonly id: string;
  readonly lat: number;
  readonly lng: number;
  readonly angle: number;

  constructor(id: string, lat: number, lng: number, angle: number) {
    this.id = id;
    this.lat = lat;
    this.lng = lng;
    this.angle = angle;
  }
}

export class LineData {

  readonly name: string;
  readonly type: string;
  readonly subtype: string;

  constructor(name: string, type: string, subtype: string) {
    this.name = name;
    this.type = type;
    this.subtype = subtype;
  }
}

export class LineLocations {

  readonly line: LineData;
  readonly vehicles: VehicleLocation[];

  constructor(line: LineData, vehicles: VehicleLocation[]) {
    this.line = line;
    this.vehicles = vehicles;
  }
}

export class LineLocationsCollection {

  readonly timestamp: string;
  readonly data: LineLocations[];

  constructor(timestamp: string, data: LineLocations[]) {
    this.timestamp = timestamp;
    this.data = data;
  }
}

/* ================ */
/* === Internal === */
/* ================ */

// Vehicle is an implementation detail, and it should not be exposed to the outside
export class Vehicle {

  readonly id: string;
  readonly line: string;
  readonly lat: number;
  readonly lng: number;

  constructor(id: string, line: string, lat: number, lng: number) {
    this.id = id;
    this.line = line;
    this.lat = lat;
    this.lng = lng;
  }
}
