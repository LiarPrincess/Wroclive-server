import { join } from 'path';
import express, { Request, Response, NextFunction } from 'express';

import { createLogger, isLocal } from './util';
import { createApiV1Router } from './routers';
import { FirestoreDatabase } from './cloud-platform';
import {
  Mpk,
  LinesProvider, DummyLineProvider, FirestoreLineProvider,
  StopsProvider, DummyStopProvider, FirestoreStopProvider,
  MPKVehicleLocationProvider
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

  const vehicleLocationProvider = new MPKVehicleLocationProvider();
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

// Routes:
// - wroclive.app/api -> always respond with 200 (used in cron.yaml)
// - wroclive.app/api/v1 -> use more precise router
// - wroclive.app/$FILE -> 'public' directory
// - wroclive.app/static -> 'public' directory
// - 404 and 500

app.get('/api', (req: Request, res: Response) => res.status(200).end());
app.use('/api/v1', createApiV1Router(mpk));

// Static
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

// 404 and 500
app.use((req: Request, res: Response) => {
  logger.info(`404: File Not Found: ${req.originalUrl}`);
  res.status(404).send('404: File Not Found');
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`500: Internal Server Error: ${req.originalUrl}`, error);
  res.status(500).send('500: Internal Server Error');
});

module.exports = app;
