import { LineLocation } from "../models";

export type VehicleLocations =
  | { kind: "Success"; lineLocations: LineLocation[] }
  | { kind: "ApiError" }
  | { kind: "ResponseContainsNoVehicles" }
  | { kind: "NoVehicleHasMovedInLastFewMinutes" };

export abstract class VehicleProviderBase {
  public abstract getVehicleLocations(): Promise<VehicleLocations>;
}
