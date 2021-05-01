import { Line } from '../..';
import { Vehicle } from '../vehicle-providers';
import { VehicleFilter } from './VehicleFilter';
import { RemoveVehiclesInDepots } from './RemoveVehiclesInDepots';
import { RemoveVehicleOutsideOfSchedule } from './RemoveVehicleOutsideOfSchedule';

export class DefaultVehicleFilter implements VehicleFilter {

  private filters: VehicleFilter[];

  constructor() {
    // We actually need both of those filters, even though they may seem redundant:
    // - scheduleFilter - will remove lines outside of the schedule, but sometimes
    //   vehicles stay in depot during the day even though the line is operating
    //   (for example during saturday/sunday).
    // - depotFilter - will remove vehicles that say in depot, but some vehicles
    //   do not stay in depot during the night (they stay in some random places
    //   like 'John Paul II Square' etc.).
    const scheduleFilter = new RemoveVehicleOutsideOfSchedule();
    const depotFilter = new RemoveVehiclesInDepots();
    this.filters = [scheduleFilter, depotFilter];
  }

  prepareForFiltering(): void {
    for (const filter of this.filters) {
      filter.prepareForFiltering();
    }
  }

  isAccepted(vehicle: Vehicle, line: Line): boolean {
    for (const filter of this.filters) {
      const isAccepted = filter.isAccepted(vehicle, line);
      if (!isAccepted) {
        return false;
      }
    }

    return true;
  }
}
