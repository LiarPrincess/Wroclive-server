export class StopArrival {
  constructor(
    readonly line: string,
    readonly dir: string,
    readonly time: number,
    readonly ac: boolean,
    readonly lowFloor: boolean | undefined,
  ) { }
}
export class StopArrivalCollection {

  readonly timestamp: string;
  readonly isValid: boolean;
  readonly data: StopArrival[];

  constructor(timestamp: string, isValid: boolean, data: StopArrival[]) {
    this.timestamp = timestamp;
    this.isValid = isValid;
    this.data = data;
  }
}
