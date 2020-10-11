export interface Line {
  readonly name: string;
  readonly type: string;
  readonly subtype: string;
  /**
   * First and last appearance of this line in schedule.
   * Number computed as '100 * hour + minute', so that 950 means 9:50.
   *
   * Example:
   * Line |  Min |  Max | Comment
   * -----+------+------+----------------------------------------------------
   *   0L |  447 | 2341 | Daily line that starts and finishes at the same day
   *    4 |  402 | 2407 | Daily line that finishes after midnight
   *  240 | 2333 | 2920 | Night line that starts during the day
   *  206 | 2405 | 2938 | Night line that starts after midnight
   */
  readonly stopArrivalTimes?: { min: number, max: number };
}

export interface LineTrip {
  readonly id: string;
  readonly isMain: boolean;
  readonly points: ShapePoint[];
}

export interface ShapePoint {
  readonly sequence: number;
  readonly lat: number;
  readonly lon: number;
}
