import express, { Request, Response, NextFunction } from 'express';

import { ConsoleLogger } from './util';
import { createV1Router } from './routers/api-v1';
import { FirestoreDatabase } from './cloud-platform';
import {
  Mpk,
  LinesProvider, DummyLineProvider, FirestoreLineProvider,
  StopsProvider, DummyStopProvider, FirestoreStopProvider,
  MMPVehicleLocationProvider
} from './mpk';

const isLocal = process.argv.includes('run-local');
const logger = new ConsoleLogger();

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

(async function updateVehicleLocations() {
  try {
    await mpk.updateVehicleLocations();
  } catch (error) {
    logger.error('Error while updating mpk vehicle locations.', error)
  }

  setTimeout(updateVehicleLocations, 5 * second);
}());

/* ------ */
/* Server */
/* ------ */

const app = express();
app.disable('etag');
app.disable('x-powered-by');

app.get('/', (req: Request, res: Response) => {
  res.status(200).end();
});

app.use('/api/v1', createV1Router(mpk));

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.error('404 - Not Found', req.originalUrl);
  res.status(404).end();
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('500 - Internal Server Error', req.path, err);
  res.status(500).end();
});

module.exports = app;
