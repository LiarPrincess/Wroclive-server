import { MpkVehicleProviderType, MpkVehicleLocations } from '../mpk';
import { OpenDataVehicleProviderType, OpenDataVehicleLocations } from '../open-data';
import { LineProviderType } from '../VehicleLocationsController';
import { LineCollection } from '../models';
import { LineDatabase } from '../helpers';

export let currentDate: Date = new Date();

export function getCurrentDate(): Date {
  return currentDate;
}

export function mockCurrentDate(s: string) {
  currentDate = new Date(s);
}

export class LineProvider implements LineProviderType {

  lines: LineCollection;

  constructor(lines: LineCollection) {
    this.lines = lines;
  }

  getLines(): LineCollection {
    return this.lines;
  }
}

export class MpkProvider implements MpkVehicleProviderType {

  lineDatabase: LineDatabase = new LineDatabase();
  result: OpenDataVehicleLocations | undefined;

  getVehicleLocations(): Promise<MpkVehicleLocations> {
    if (this.result) {
      return Promise.resolve(this.result);
    }

    throw new Error("'MpkProvider.getVehicleLocations' was not expected to be called.");
  }
}

export class OpenDataProvider implements OpenDataVehicleProviderType {

  lineDatabase: LineDatabase = new LineDatabase();
  result: OpenDataVehicleLocations | undefined;

  getVehicleLocations(): Promise<OpenDataVehicleLocations> {
    if (this.result) {
      return Promise.resolve(this.result);
    }

    throw new Error("'OpenDataProvider.getVehicleLocations' was not expected to be called.");
  }
}
