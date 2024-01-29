import { ApiError, ApiResult } from "./ApiType";
import { IntervalErrorReporter } from "../helpers";
import { Logger } from "../models";

// For calculating intervals.
const second = 1000;
const minute = 60 * second;

/* ============ */
/* === Type === */
/* ============ */

export interface ErrorReporterType {
  apiError(error: ApiError): void;
  responseContainsInvalidRecords(records: any[]): void;
  responseContainsNoVehicles(result: ApiResult): void;
  noVehicleHasMovedInLastFewMinutes(): void;
}

/* ============ */
/* === Main === */
/* ============ */

// If the something fails then report error.
// But not always, we don't like spam.
export class ErrorReporter implements ErrorReporterType {
  private readonly api: IntervalErrorReporter;
  private readonly invalidRecords: IntervalErrorReporter;
  private readonly noVehicles: IntervalErrorReporter;
  private readonly noVehicleHasMoved: IntervalErrorReporter;

  constructor(logger: Logger) {
    this.api = new IntervalErrorReporter(5 * minute, "[Mpk] Api get vehicle locations failed.", logger);

    this.invalidRecords = new IntervalErrorReporter(
      30 * minute,
      "[Mpk] Api response contains invalid records.",
      logger
    );

    this.noVehicles = new IntervalErrorReporter(5 * minute, "[Mpk] Api response contains no valid vehicles.", logger);

    this.noVehicleHasMoved = new IntervalErrorReporter(
      5 * minute,
      "[Mpk] No vehicle has moved in last few minutes.",
      logger
    );
  }

  apiError(error: ApiError) {
    this.api.report(error);
  }

  responseContainsInvalidRecords(records: any[]): void {
    if (records.length) {
      this.invalidRecords.report(records);
    }
  }

  responseContainsNoVehicles(result: ApiResult): void {
    this.noVehicles.report(result);
  }

  noVehicleHasMovedInLastFewMinutes(): void {
    this.noVehicleHasMoved.report();
  }
}

/* ============ */
/* === Mock === */
/* ============ */

class ReportedError {
  constructor(public readonly kind: string, public readonly arg?: any) {}
}

export class ErrorReporterMock implements ErrorReporterType {
  public readonly errors: ReportedError[] = [];

  apiError(error: ApiError): void {
    this.errors.push(new ReportedError("ApiError", error));
  }

  responseContainsInvalidRecords(records: any[]): void {
    if (records.length) {
      this.errors.push(new ReportedError("ResponseContainsInvalidRecords", records));
    }
  }

  responseContainsNoVehicles(result: ApiResult): void {
    this.errors.push(new ReportedError("ResponseContainsNoVehicles", result));
  }

  noVehicleHasMovedInLastFewMinutes(): void {
    this.errors.push(new ReportedError("NoVehicleHasMovedInLastFewMinutes"));
  }
}
