import { Logger } from "../../../util";
import { VehicleLocations } from "../VehicleProviderBase";
import { VehicleProviderType } from "../VehicleLocationsController";

export { DatabaseMock } from "../database";

export class VehicleProviderMock implements VehicleProviderType {
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
