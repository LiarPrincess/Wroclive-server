import express, { Request, Response, NextFunction } from 'express';

import { ConsoleLogger } from './util';
import { Mpk, DummyLineProvider } from './mpk';
import { createV1Router } from './routers/api-v1';

const logger = new ConsoleLogger();
const mpk = new Mpk(logger);

/* ------------ */
/* Update loops */
/* ------------ */

(async function updateLines() {
  try {
    const provider = new DummyLineProvider();
    await mpk.updateLines(provider);
  } catch (error) {
    logger.error('Failed to update mpk lines', error);
  }
})();

// (function updateVehicleLocations() {
//   mpk.updateVehicleLocations()
//     .catch(e => logger.error('Error while updating mpk vehicle locations.', e))
//     .then(() => setTimeout(updateVehicleLocations, 10 * 1000)); // 10s
// }());

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
