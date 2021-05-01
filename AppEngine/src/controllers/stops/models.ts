import { Line } from '..';

export interface Stop {
  readonly code: string;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
}

export interface TimestampedStops {
  readonly timestamp: string;
  readonly data: Stop[];
}

export interface StopArrival {
  readonly line: Line;
  readonly headsign: String;
  readonly time: number;
}
