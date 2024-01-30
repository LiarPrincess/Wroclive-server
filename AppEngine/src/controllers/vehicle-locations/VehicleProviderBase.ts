import { LineLocation } from "./models";

export type VehicleLocations =
  | { kind: "Success"; lineLocations: LineLocation[] }
  | { kind: "ApiError" }
  | { kind: "ResponseContainsNoVehicles" }
  | { kind: "NoVehicleHasMovedInLastFewMinutes" };

export abstract class VehicleProviderBase {
  abstract getVehicleLocations(): Promise<VehicleLocations>;

  protected assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
  }
}
