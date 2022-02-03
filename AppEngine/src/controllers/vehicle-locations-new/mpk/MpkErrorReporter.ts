import { ApiError, ApiResult } from './interfaces';
import { IntervalErrorReporter } from '../helpers';
import { Logger } from '../models';

// For calculating intervals.
const second = 1000;
const minute = 60 * second;

export interface MpkErrorReporterType {
  reportApiError(error: ApiError): void;
  reportResponseContainsInvalidRecords(records: any[]): void;
  reportResponseContainsNoVehicles(result: ApiResult): void;
  reportNoVehicleHasMovedInLastFewMinutes(): void;
}

// If the something fails then report error.
// But not always, we don't like spam.
export class MpkErrorReporter implements MpkErrorReporterType {

  private readonly api: IntervalErrorReporter;
  private readonly invalidRecords: IntervalErrorReporter;
  private readonly noVehicles: IntervalErrorReporter;
  private readonly noVehicleHasMoved: IntervalErrorReporter;

  constructor(logger: Logger) {
    this.api = new IntervalErrorReporter(
      5 * minute,
      '[MpkVehicleProvider] Api get vehicle locations failed.',
      logger
    );

    this.invalidRecords = new IntervalErrorReporter(
      30 * minute,
      '[MpkVehicleProvider] Api response contains invalid records.',
      logger
    );

    this.noVehicles = new IntervalErrorReporter(
      5 * minute,
      '[MpkVehicleProvider] Api response contains no valid vehicles.',
      logger
    );

    this.noVehicleHasMoved = new IntervalErrorReporter(
      5 * minute,
      '[MpkVehicleProvider] No vehicle has moved in last few minutes.',
      logger
    );
  }

  reportApiError(error: ApiError) {
    this.api.report(error);
  }

  reportResponseContainsInvalidRecords(records: any[]): void {
    if (records.length) {
      this.invalidRecords.report(records);
    }
  }

  reportResponseContainsNoVehicles(result: ApiResult): void {
    this.noVehicles.report(result);
  }

  reportNoVehicleHasMovedInLastFewMinutes(): void {
    this.noVehicleHasMoved.report();
  }
}
