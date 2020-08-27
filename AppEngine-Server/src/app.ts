import express, { Request, Response, NextFunction } from 'express';

import { createLogger, isLocal } from './util';
import { createApiV1Router } from './routers';
import { FirestoreDatabase } from './cloud-platform';
import {
  Mpk,
  LinesProvider, DummyLineProvider, FirestoreLineProvider,
  StopsProvider, DummyStopProvider, FirestoreStopProvider,
  MMPVehicleLocationProvider
} from './mpk';

const logger = createLogger('Webserver');

const mpk: Mpk = (function() {
  let linesProvider: LinesProvider;
  let stopsProvider: StopsProvider;

  if (isLocal) {
    linesProvider = new DummyLineProvider();
    stopsProvider = new DummyStopProvider();
  } else {
    const db = new FirestoreDatabase();
    linesProvider = new FirestoreLineProvider(db);
    stopsProvider = new FirestoreStopProvider(db);
  }

  const vehicleLocationProvider = new MMPVehicleLocationProvider();
  return new Mpk(linesProvider, stopsProvider, vehicleLocationProvider, logger);
})();

/* ------------ */
/* Update loops */
/* ------------ */

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;

(async function updateFirestoreData() {
  try {
    await mpk.updateLines();
  } catch (error) {
    logger.error('Failed to update mpk lines', error);
  }

  try {
    await mpk.updateStops();
  } catch (error) {
    logger.error('Failed to update mpk stops', error);
  }

  setTimeout(updateFirestoreData, 1 * hour);
})();

const vehicleLocationUpdateInterval = 5 * second;
// We will log error if we fail to update locations for X minutes.
const reportVehicleLocationUpdateErrorAfter = 2 * minute;
// How many times did we fail in a row?
let vehicleLocationUpdateErrorCounter = 0;

(async function updateVehicleLocations() {
  try {
    await mpk.updateVehicleLocations();
  } catch (error) {
    const failedFor = vehicleLocationUpdateErrorCounter * vehicleLocationUpdateInterval;
    if (failedFor >= reportVehicleLocationUpdateErrorAfter) {
      vehicleLocationUpdateErrorCounter = 0;
      logger.error('Error while updating mpk vehicle locations.', error)
    } else {
      vehicleLocationUpdateErrorCounter += 1;
    }
  }

  setTimeout(updateVehicleLocations, vehicleLocationUpdateInterval);
}());

/* ------ */
/* Server */
/* ------ */

const app = express();
app.disable('etag');
app.disable('x-powered-by');

// wroclive.app -> 'public' directory
// wroclive.app/api -> always respond with 200 (used in cron.yaml)
// wroclive.app/api/v1 -> use more precise router

app.get('/api', (req: Request, res: Response) => res.status(200).end());
app.use('/api/v1', createApiV1Router(mpk));
app.use('/', express.static('public'));

module.exports = app;
