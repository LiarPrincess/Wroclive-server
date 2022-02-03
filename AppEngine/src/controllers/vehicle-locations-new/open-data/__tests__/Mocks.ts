import { ApiType, ApiResult, ResourceIdError, VehicleLocationsError } from '../ApiType';
import { ErrorReporterType } from '../ErrorReporter';
import { VehicleLocationFromApi } from '../../models';
import { VehicleClassifierType, VehicleClassification } from '../../vehicle-classification';
import { Line } from '../../../lines';

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

export class VehicleClassifier implements VehicleClassifierType {

  public prepareCallCount = 0;
  public vehicleIdInDepot: string[] = [];
  public vehicleIdThatHaveNotMoved: string[] = [];
  public vehicleIdOutsideOfSchedule: string[] = [];

  prepareForClassification(): void {
    this.prepareCallCount++;
  }

  classify(line: Line, vehicle: VehicleLocationFromApi): VehicleClassification {
    const id = vehicle.id;
    const isInDepot = this.vehicleIdInDepot.includes(id);
    const isWithinScheduleTimeFrame = !this.vehicleIdOutsideOfSchedule.includes(id);
    const hasMovedInLastFewMinutes = !this.vehicleIdThatHaveNotMoved.includes(id);
    return new VehicleClassification(isInDepot, isWithinScheduleTimeFrame, hasMovedInLastFewMinutes);
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

  apiError(error: VehicleLocationsError): void {
    this.errors.push(new ReportedError('ApiError', error));
  }

  resourceIdError(error: ResourceIdError | undefined): void {
    if (error) {
      this.errors.push(new ReportedError('ResourceIdError', error));
    }
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
