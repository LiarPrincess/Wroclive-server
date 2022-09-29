export interface ResponseModel {
  [key: string]: StopData;
}

export interface StopData {
  id: string;
  name: string;
  board: Board[];
  direction: string;
}

export interface Board {
  /** "line": "A", */
  line: string;
  /** "direction": "KRZYKI", */
  direction: string;
  /** "floor": "l", */
  floor: string;
  /** "ac": true, */
  ac: boolean;

  /** "minuteCount": 11 */
  minuteCount: number;
  /** "delay": 3, */
  delay: number;
  /** "departure": "12:30", */
  departure: string;
  /** "scheduledDeparture": "Jan 1, 1900 12:30:00 PM", */
  scheduledDeparture: string;
  /** "scheduledDepartureTime": "12:30" */
  scheduledDepartureTime: string;

  /** "code": 8488 */
  code: number;
  /** "routeBegin": false */
  routeBegin: boolean;
  currentStop: Stop;
  nextStop: Stop;
  distance: number;
  lag: number;
}

export interface Stop {
  /** "s": "20820", */
  s: string;
  /** "x": 17.06015, */
  x: number;
  /** "y": 51.111614, */
  y: number;
  /** "t": "b", */
  t: string;
  /** "n": "PL. GRUNWALDZKI", */
  n: string;
  /** "symbol": "20820", */
  symbol: string;
  /** "name": "PL. GRUNWALDZKI" */
  name: string;
}
