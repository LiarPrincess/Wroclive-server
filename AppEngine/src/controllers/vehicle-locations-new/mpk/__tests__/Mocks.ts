import { ApiType, ApiResult, ApiError } from '../ApiType';
import { VehicleLocationFromApi } from '../../models';
import { HasMovedInLastFewMinutesClassifierType } from '../../vehicle-classification';
import { ErrorReporterType } from '../ErrorReporter';

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

/* ====================== */
/* === Error reporter === */
/* ====================== */

class ReportedError {
  constructor(
    public readonly kind: string,
    public readonly arg?: any
  ) { }
}

export class ErrorReporter implements ErrorReporterType {

  public readonly errors: ReportedError[] = [];

  apiError(error: ApiError): void {
    this.errors.push(new ReportedError('ApiError', error));
  }

  responseContainsInvalidRecords(records: any[]): void {
    if (records.length) {
      this.errors.push(new ReportedError('ResponseContainsInvalidRecords', records));
    }
  }

  responseContainsNoVehicles(result: ApiResult): void {
    this.errors.push(new ReportedError('ResponseContainsNoVehicles', result));
  }

  noVehicleHasMovedInLastFewMinutes(): void {
    this.errors.push(new ReportedError('NoVehicleHasMovedInLastFewMinutes'));
  }
}
