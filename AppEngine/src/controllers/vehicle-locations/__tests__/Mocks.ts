import { Logger } from '../../../util';

export { MpkVehicleProviderMock } from '../mpk';
export { OpenDataVehicleProviderMock } from '../open-data';
export { VehicleLocationsDatabaseMock } from '../database';

export class LoggerMock implements Logger {
  info(message?: any, ...optionalParams: any[]): void { }
  error(message?: any, ...optionalParams: any[]): void { }
}

export let currentDate: Date = new Date();

export function getCurrentDate(): Date {
  return currentDate;
}

export function mockCurrentDate(s: string) {
  currentDate = new Date(s);
}
