export interface Line {
  readonly name: string;
  readonly type: string;
  readonly subtype: string;
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
