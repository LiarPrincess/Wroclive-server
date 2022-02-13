import express, { Request, Response, NextFunction, Router } from 'express';

import { JSONCache } from './JSONCache';
import { Controllers } from '../../controllers';
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

function asString(o: any): string | undefined {
  const isString = typeof o === 'string' || o instanceof String;
  return isString ? (o as string) : undefined;
}

/* ============ */
/* === Main === */
/* ============ */

export function createApiV1Router(controllers: Controllers): Router {
  const router = express.Router();
  router.use(express.json());

  const jsonCache = new JSONCache();

  router.get('/lines', (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = controllers.lines.getLines();
      const json = jsonCache.getLines(data);

      setStandardHeaders(res, CacheHeader.Store6h);
      sendJSON(res, json);
    } catch (err) {
      next(err);
    }
  });

  router.get('/stops', (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = controllers.stops.getStops();
      const json = jsonCache.getStops(data);

      setStandardHeaders(res, CacheHeader.Store3days);
      sendJSON(res, json);
    } catch (err) {
      next(err);
    }
  });

  router.get('/vehicles', (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = asString(req.query?.lines) || '';
      const lineNames = splitLowerCase(query, ';');

      const data = controllers.vehicleLocation.getVehicleLocations(lineNames);
      const json = jsonCache.getVehicleLocations(data);

      setStandardHeaders(res, CacheHeader.Disable);
      sendJSON(res, json);
    } catch (err) {
      next(err);
    }
  });

  router.post('/notification-tokens', (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceId = asString(req.body?.deviceId);
      const token = asString(req.body?.token);
      const platform = asString(req.body?.platform);

      let statusCode = 400; // BAD REQUEST
      if (deviceId !== undefined && token !== undefined && platform !== undefined) {
        controllers.pushNotificationToken.save(deviceId, token, platform);
        statusCode = 200;
      }

      res.status(statusCode).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
