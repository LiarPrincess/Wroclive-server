import { ApiType, ApiResult, ApiError } from '../interfaces';
import { VehicleLocationFromApi } from '../../models';
import { HasMovedInLastFewMinutesClassifierType } from '../../vehicle-classification';
import { MpkErrorReporterType } from '../MpkErrorReporter';

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

/* ====================== */
/* === Error reporter === */
/* ====================== */

class ReportedError {
  constructor(
    public readonly kind: string,
    public readonly arg?: any
  ) { }
}

export class ErrorReporter implements MpkErrorReporterType {

  public readonly errors: ReportedError[] = [];

  reportApiError(error: ApiError): void {
    this.errors.push(new ReportedError('ApiError', error));
  }

  reportResponseContainsInvalidRecords(records: any[]): void {
    if (records.length) {
      this.errors.push(new ReportedError('ResponseContainsInvalidRecords', records));
    }
  }

  reportResponseContainsNoVehicles(result: ApiResult): void {
    this.errors.push(new ReportedError('ResponseContainsNoVehicles', result));
  }

  reportNoVehicleHasMovedInLastFewMinutes(): void {
    this.errors.push(new ReportedError('NoVehicleHasMovedInLastFewMinutes'));
  }
}
