import { Controllers } from './controllers';
import { LinesControllerType } from './controllers/lines';
import { StopsControllerType } from './controllers/stops';
import { VehicleLocationsControllerType } from './controllers/vehicle-locations';
import { Logger } from './util';

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;

export function startDataUpdateLoops(controllers: Controllers, logger: Logger) {
  startUpdatingLines(controllers.lines, logger);
  startUpdatingStops(controllers.stops, logger);
  startUpdatingVehicleLocations(controllers.vehicleLocation, logger);
}

/* ============= */
/* === Lines === */
/* ============= */

const linesUpdateInterval = 1 * hour;

function startUpdatingLines(controller: LinesControllerType, logger: Logger) {
  async function update() {
    try {
      await controller.updateLines();
    } catch (error) {
      logger.error('Failed to update lines', error);
    }

    setTimeout(update, linesUpdateInterval);
  }

  update();
}

/* ============= */
/* === Stops === */
/* ============= */

const stopsUpdateInterval = 1 * hour;

function startUpdatingStops(controller: StopsControllerType, logger: Logger) {
  async function update() {
    try {
      await controller.updateStops();
    } catch (error) {
      logger.error('Failed to update stops', error);
    }

    setTimeout(update, stopsUpdateInterval);
  }

  update();
}

/* ========================= */
/* === Vehicle locations === */
/* ========================= */

const vehicleLocationUpdateInterval = 5 * second;
// We will log error if we fail to update locations for X minutes.
const reportVehicleLocationUpdateErrorAfter = 2 * minute;
// How many times did we fail in a row?
let vehicleLocationUpdateErrorCount = 0;

function startUpdatingVehicleLocations(controller: VehicleLocationsControllerType, logger: Logger) {
  async function update() {
    try {
      await controller.updateVehicleLocations();
    } catch (error) {
      const failedFor = vehicleLocationUpdateErrorCount * vehicleLocationUpdateInterval;
      if (failedFor >= reportVehicleLocationUpdateErrorAfter) {
        vehicleLocationUpdateErrorCount = 0;
        logger.error('Error while updating vehicle locations.', error);
      } else {
        vehicleLocationUpdateErrorCount += 1;
      }
    }

    setTimeout(update, vehicleLocationUpdateInterval);
  }

  update();
}
