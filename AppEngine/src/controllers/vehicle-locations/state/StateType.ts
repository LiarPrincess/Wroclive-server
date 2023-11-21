import { Line, LineLocation, VehicleLocationFromApi } from "../models";

export type UpdateResult =
  | { kind: "Success"; lineLocations: LineLocation[] }
  | { kind: "ResponseContainsNoVehicles" }
  | { kind: "NoVehicleHasMovedInLastFewMinutes" };

export interface StateType {
  update(lines: Line[], vehicleLocations: VehicleLocationFromApi[]): Promise<UpdateResult>;
}
