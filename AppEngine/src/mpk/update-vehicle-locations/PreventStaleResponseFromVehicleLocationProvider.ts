import { VehicleLocationProvider } from './VehicleLocationProvider';
import { subtractMilliseconds } from '../math';
import { MPKVehicle } from '../models';
import { hour, minute, second } from '../../util';

/* ============== */
/* === Config === */
/* ============== */

export const returnEmptyIfWeGetTheSameResultFor = 5 * minute;

/* ============= */
/* === Types === */
/* ============= */

interface PreviousResult {
  readonly value: MPKVehicle[];
  readonly date: Date;
}

/* ============ */
/* === Main === */
/* ============ */

/**
 * If VehicleLocationProvider hangs (returns the same response for extended period of time)
 * return empty (as if the data source failed).
 */
export class PreventStaleResponseFromVehicleLocationProvider implements VehicleLocationProvider {

  private inner: VehicleLocationProvider;
  private previousResult?: PreviousResult;

  constructor(inner: VehicleLocationProvider) {
    this.inner = inner;
  }

  async getVehicleLocations(lineNames: string[]): Promise<MPKVehicle[]> {
    const result = await this.inner.getVehicleLocations(lineNames);
    const now = new Date();

    // 1st update -> remember result.
    const previousResult = this.previousResult;
    if (!previousResult) {
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
    return [];
  }

  private areEqual(lhs: MPKVehicle[], rhs: MPKVehicle[]): boolean {
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
}
