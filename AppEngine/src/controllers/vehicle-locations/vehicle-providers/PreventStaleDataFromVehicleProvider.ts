import { Logger } from '../../../util';
import { Vehicle } from '../models';
import { VehicleProvider } from './VehicleProvider';
import { subtractMilliseconds } from '../math';

/* ============== */
/* === Config === */
/* ============== */

const second = 1000;
const minute = 60 * second;

export const returnEmptyIfWeGetTheSameResultFor = 5 * minute;

/* ============= */
/* === Types === */
/* ============= */

interface PreviousResult {
  readonly value: Vehicle[];
  readonly date: Date;
}

type DateProvider = () => Date;

/* ============ */
/* === Main === */
/* ============ */

/**
 * If VehicleProvider hangs (returns the same response for extended period of time)
 * return empty (as if the data source failed).
 */
export class PreventStaleDataFromVehicleProvider implements VehicleProvider {

  private inner: VehicleProvider;
  private previousResult?: PreviousResult;
  private dateProvider: DateProvider;
  private logger: Logger | undefined;

  constructor(inner: VehicleProvider, logger?: Logger, dateProvider?: DateProvider) {
    this.inner = inner;
    this.logger = logger;
    this.dateProvider = dateProvider || (() => new Date());
  }

  async getVehicles(lineNames: string[]): Promise<Vehicle[]> {
    const result = await this.inner.getVehicles(lineNames);
    const now = this.dateProvider();

    const hasInnerFailed = result.length == 0;
    if (hasInnerFailed) {
      if (this.previousResult) {
        this.log('Inner provider has failed.');
        this.previousResult = undefined;
      }
      return [];
    }

    // 1st update -> remember result.
    const previousResult = this.previousResult;
    if (!previousResult) {
      this.log('1st update -> remember result.');
      this.previousResult = { value: result, date: now };
      return result;
    }

    // Different result -> not stale.
    const areEqual = this.areEqual(result, previousResult.value);
    if (!areEqual) {
      this.previousResult = { value: result, date: now };
      return result;
    }

    // Same result -> possible hang, but wait a bit more to clarify situation.
    const timeSincePreviousResult = subtractMilliseconds(now, previousResult.date);
    const isWithinGracePeriod = timeSincePreviousResult <= returnEmptyIfWeGetTheSameResultFor;
    if (isWithinGracePeriod) {
      return result;
    }

    // Same result, stale -> data source hangs with the same response -> return empty.
    this.log('Stale data.');
    return [];
  }

  private areEqual(lhs: Vehicle[], rhs: Vehicle[]): boolean {
    const isLengthEqual = lhs.length == rhs.length;
    if (!isLengthEqual) {
      return false;
    }

    for (let index = 0; index < lhs.length; index++) {
      const lhsVehicle = lhs[index];
      const rhsVehicle = rhs[index];

      const isVehicleEqual =
        lhsVehicle.id == rhsVehicle.id &&
        lhsVehicle.line == rhsVehicle.line &&
        lhsVehicle.lat == rhsVehicle.lat &&
        lhsVehicle.lng == rhsVehicle.lng;

      if (!isVehicleEqual) {
        return false;
      }
    }

    return true;
  }

  private log(msg: string) {
    if (this.logger) {
      const innerName = this.inner.constructor.name;
      this.logger.info(`[PreventStale.${innerName}] ${msg}`);
    }
  }
}
