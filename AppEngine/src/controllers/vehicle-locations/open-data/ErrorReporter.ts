import { ApiResult, ResourceIdError, VehicleLocationsError } from "./ApiType";
import { IntervalErrorReporter } from "../helpers";
import { Logger } from "../models";

// For calculating intervals.
const second = 1000;
const minute = 60 * second;

/* ============ */
/* === Type === */
/* ============ */

export interface ErrorReporterType {
  apiError(error: VehicleLocationsError): void;
  resourceIdError(error: ResourceIdError | undefined): void;
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
  private readonly resourceId: IntervalErrorReporter;
  private readonly invalidRecords: IntervalErrorReporter;
  private readonly noVehicles: IntervalErrorReporter;
  private readonly noVehicleHasMoved: IntervalErrorReporter;

  constructor(logger: Logger) {
    this.api = new IntervalErrorReporter(5 * minute, "[OpenData] Api get vehicle locations failed.", logger);

    this.resourceId = new IntervalErrorReporter(15 * minute, "[OpenData] Api resource id refresh failed.", logger);

    this.invalidRecords = new IntervalErrorReporter(
      30 * minute,
      "[OpenData] Api response contains invalid records.",
      logger
    );

    this.noVehicles = new IntervalErrorReporter(
      5 * minute,
      "[OpenData] Api response contains no valid vehicles.",
      logger
    );

    this.noVehicleHasMoved = new IntervalErrorReporter(
      5 * minute,
      "[OpenData] No vehicle has moved in last few minutes.",
      logger
    );
  }
  apiError(error: VehicleLocationsError): void {
    this.api.report(error);
  }

  resourceIdError(error: ResourceIdError | undefined): void {
    if (error) {
      this.resourceId.report(error);
    }
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

  apiError(error: VehicleLocationsError): void {
    this.errors.push(new ReportedError("ApiError", error));
  }

  resourceIdError(error: ResourceIdError | undefined): void {
    if (error) {
      this.errors.push(new ReportedError("ResourceIdError", error));
    }
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
