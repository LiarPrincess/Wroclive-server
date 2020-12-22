import { join } from 'path';
import express, { Request, Response, NextFunction } from 'express';

import { createApiV1Router } from './routers';
import { FirestoreDatabase } from './cloud-platform';
import {
  createLogger,
  isLocal,
  second, hour, minute
} from './util';
import {
  Mpk,
  LinesProvider, DummyLineProvider, FirestoreLineProvider,
  StopsProvider, DummyStopProvider, FirestoreStopProvider,
  OpenDataVehicleLocationProvider, MpkVehicleLocationProvider
} from './mpk';

const logger = createLogger('AppEngine');

const mpk: Mpk = (() => {
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

  // 1st source to return non-empty result wins.
  const openDataVehicleProvider = new OpenDataVehicleLocationProvider();
  const mpkVehicleProvider = new MpkVehicleLocationProvider();
  const vehicleProviders = [openDataVehicleProvider, mpkVehicleProvider];

  return new Mpk(linesProvider, stopsProvider, vehicleProviders, logger);
})();

/* ------------ */
/* Update loops */
/* ------------ */

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
      logger.error('Error while updating mpk vehicle locations.', error);
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

// Routes:
// - wroclive.app/api -> always respond with 200 (used for uptime testing)
// - wroclive.app/api/v1 -> use more precise router

app.get('/api', (req: Request, res: Response) => res.status(200).end());
app.use('/api/v1', createApiV1Router(mpk));

// In production the GCP is responsible for serving static files (it is faster/easier this way).
// Locally we have to do it ourselves.
if (isLocal) {
  type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;
  function serveFile(file: string): RequestHandler {
    const root = join(__dirname, '..');
    return (req: Request, res: Response, next: NextFunction) => {
      res.sendFile(file, { root });
    };
  }

  app.get('/', serveFile('public/homepage.html'));
  app.get('/privacy', serveFile('public/privacy.html'));
  app.use('/static', express.static('public'));
}

module.exports = app;
