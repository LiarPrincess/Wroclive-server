import { Logger } from "../../../util";

export { DatabaseMock } from "../database";
export { VehicleProviderMock } from "../vehicle-provider";

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
