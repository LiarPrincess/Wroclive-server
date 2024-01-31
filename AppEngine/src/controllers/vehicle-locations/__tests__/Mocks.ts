import { Line, LineCollection } from "../models";
import { VehicleProviderBase, VehicleLocations } from "../VehicleProviderBase";
import { Logger } from "../../../util";

export class VehicleProviderMock extends VehicleProviderBase {
  public setLinesArg: Line[] = [];
  public setLinesCallCount = 0;

  public async setLines(lines: LineCollection): Promise<void> {
    this.setLinesArg = lines.data;
    this.setLinesCallCount++;
  }

  public result: VehicleLocations | undefined;

  public getVehicleLocations(): Promise<VehicleLocations> {
    if (this.result) {
      return Promise.resolve(this.result);
    }

    throw new Error("'getVehicleLocations' was not expected to be called.");
  }
}

export class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void {}
  error(message?: any, ...optionalParams: any[]): void {}
}

export let currentDate: Date = new Date();

export function getCurrentDate(): Date {
  return currentDate;
}

export function mockCurrentDate(s: string) {
  currentDate = new Date(s);
}
