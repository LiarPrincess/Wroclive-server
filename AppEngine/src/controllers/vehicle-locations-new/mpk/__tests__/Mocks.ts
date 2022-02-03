import { ApiType, ApiResult } from '../interfaces';
import { HasMovedInLastFewMinutesClassifierType } from '../../vehicle-classification';
import { VehicleLocationFromApi } from 'controllers/vehicle-locations-new/models';

/* =========== */
/* === Api === */
/* =========== */

export class Api implements ApiType {

  public results: ApiResult[] = [];
  private resultIndex = 0;

  getVehicleLocations(): Promise<ApiResult> {
    if (this.resultIndex < this.results.length) {
      const result = this.results[this.resultIndex];
      this.resultIndex++;
      return Promise.resolve(result);
    }

    throw new Error('Forgot to define api result?');
  }
}

/* ================ */
/* === HasMoved === */
/* ================ */

export class HasMovedInLastFewMinutesClassifier implements HasMovedInLastFewMinutesClassifierType {

  public prepareCallCount = 0;
  public vehicleIdThatHaveNotMoved: string[] = [];

  prepareForClassification(): void {
    this.prepareCallCount++;
  }

  hasMovedInLastFewMinutes(vehicle: VehicleLocationFromApi): boolean {
    const hasNotMoved = this.vehicleIdThatHaveNotMoved.includes(vehicle.id);
    return !hasNotMoved;
  }
}

/* ============ */
/* === Date === */
/* ============ */

const currentDate = new Date(2020, 0, 1, 10, 30, 42);
export const currentDateTimestamp = '2020-01-01T09:30:42.000Z';

export function getCurrentDate(): Date {
  return currentDate;
}

/* ============== */
/* === Logger === */
/* ============== */

export class Logger {

  public readonly messages: any[] = [];

  error(message?: any, ...optionalParams: any[]) {
    this.messages.push({ message, args: optionalParams });
  }
}
