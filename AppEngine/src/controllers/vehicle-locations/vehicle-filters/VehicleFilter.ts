import { Line } from '../..';
import { Vehicle } from '../vehicle-providers';

export interface VehicleFilter {

  /**
   * Should be called before any filtering starts.
   * Chance to reset local state.
   */
  prepareForFiltering(): void;

  /**
   * Should the vehicle be shown on the map?
   */
  isAccepted(vehicle: Vehicle, line: Line): boolean;
}
