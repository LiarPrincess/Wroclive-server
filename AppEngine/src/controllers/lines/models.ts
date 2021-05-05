interface StopArrivalTimes {
  readonly min: number;
  readonly max: number;
}

export class Line {

  readonly name: string;
  readonly type: string;
  readonly subtype: string;

  /**
   * First and last appearance of this line in schedule
   * (as number of minutes since midnight).
   *
   * One day has 1440 minutes, if the time is >1440 then it means next day.
   *
   * Example:
   * Line |  Min |  Max | Comment
   * -----+------+------+----------------------------------------------------
   *   0L |  287 | 1400 | Daily line that starts and finishes at the same day
   *    4 |  242 | 1450 | Daily line that finishes after midnight
   *  240 | 1400 | 1720 | Night line that starts during the day
   *  206 | 1456 | 1738 | Night line that starts after midnight
   */
  readonly stopArrivalTimes?: StopArrivalTimes;

  constructor(
    name: string,
    type: string,
    subtype: string,
    stopArrivalTimes?: StopArrivalTimes
  ) {
    this.name = name;
    this.type = type;
    this.subtype = subtype;
    this.stopArrivalTimes = stopArrivalTimes;
  }
}

export class LineCollection {

  readonly timestamp: string;
  readonly data: Line[];

  constructor(
    timestamp: string,
    data: Line[]
  ) {
    this.timestamp = timestamp;
    this.data = data;
  }
}

// This is lor later:
// export interface LineTrip {
//   readonly id: string;
//   readonly isMain: boolean;
//   readonly points: ShapePoint[];
// }

// export interface ShapePoint {
//   readonly sequence: number;
//   readonly lat: number;
//   readonly lon: number;
// }
