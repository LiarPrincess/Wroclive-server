import { Line } from './lines';

export interface Stop {
  readonly code: string;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
}

export interface StopArrival {
  readonly line: Line;
  readonly headsign: String;
  readonly time: number;
}
