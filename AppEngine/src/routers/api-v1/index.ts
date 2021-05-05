import express, { Request, Response, NextFunction, Router } from 'express';

import { Controllers } from '../../controllers';
import { JSONSerialization } from './JSONSerialization';
import { splitLowerCase } from '../helpers';

/* ================ */
/* === Response === */
/* ================ */

enum CacheHeader {
  // 21600s = 360 min = 6h
  Store6h = 'max-age=21600',
  // 43200s = 720 min = 12h
  Store12h = 'max-age=43200',
  // 259200s = 4320 min = 72h = 3 days
  Store3days = 'max-age=259200',
  Disable = 'no-store'
}

function setStandardHeaders(
  res: Response,
  cache: CacheHeader
) {
  res.set('Connection', 'Keep-Alive');
  res.set('Keep-Alive', 'timeout=10, max=30');
  res.set('Cache-Control', cache);
}

function sendJSON(res: Response, value: string) {
  res.set('Content-Type', 'application/json');
  res.send(value);
}

/* ============ */
/* === Main === */
/* ============ */

export function createApiV1Router(controllers: Controllers): Router {
  const router = express.Router();
  const json = new JSONSerialization();

  router.get('/lines', (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = controllers.lines.getLines();
      const stringified = json.stringifyLines(data);

      setStandardHeaders(res, CacheHeader.Store6h);
      sendJSON(res, stringified);
    } catch (err) {
      next(err);
    }
  });

  router.get('/stops', (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = controllers.stops.getStops();
      const stringified = json.stringifyStops(data);

      setStandardHeaders(res, CacheHeader.Store3days);
      sendJSON(res, stringified);
    } catch (err) {
      next(err);
    }
  });

  router.get('/vehicles', (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.query && req.query.lines) ? (req.query.lines as string) : '';
      const lineNames = splitLowerCase(query, ';');
      const data = controllers.vehicleLocation.getVehicleLocations(lineNames);
      const stringified = json.stringifyVehicleLocations(data);

      setStandardHeaders(res, CacheHeader.Disable);
      sendJSON(res, stringified);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
