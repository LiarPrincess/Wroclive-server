export class Stop {

  readonly code: string;
  readonly name: string;
  readonly lat: number;
  readonly lng: number;

  constructor(code: string, name: string, lat: number, lng: number) {
    this.code = code;
    this.name = name;
    this.lat = lat;
    this.lng = lng;
  }
}

export class StopCollection {

  readonly timestamp: string;
  readonly data: Stop[];

  constructor(timestamp: string, data: Stop[]) {
    this.timestamp = timestamp;
    this.data = data;
  }
}

// This is lor later:
// export interface StopArrival {
//   readonly line: Line;
//   readonly headsign: String;
//   readonly time: number;
// }
