import express, { Request, Response, NextFunction, Router } from 'express';

import { JSONCache } from './JSONCache';
import { Controllers } from '../../controllers';
import { splitLowerCase } from '../helpers';
import { Logger } from '../../util';

/* ================ */
/* === Response === */
/* ================ */

enum CacheHeader {
  // 2 min = 120s
  Store2min = 'max-age=120',
  // 6h = 360 min= 21600s
  Store6h = 'max-age=21600',
  // 12h = 720 min= 43200s
  Store12h = 'max-age=43200',
  // 3 days = 72h = 4320 min = 259200s
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

function endWithStatus(res: Response, status: number) {
  res.status(status).end();
}

function asString(o: any): string | undefined {
  const isString = typeof o === 'string' || o instanceof String;
  return isString ? (o as string) : undefined;
}

/* ============ */
/* === Main === */
/* ============ */

export function createApiV1Router(controllers: Controllers, logger: Logger): Router {
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

  router.get('/stops/:id/live', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stopId = req.params['id'];
      const data = await controllers.stopsLive.getNextArrivals(stopId);
      const json = JSON.stringify(data);

      setStandardHeaders(res, CacheHeader.Disable);
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
      const json = JSON.stringify(data);

      setStandardHeaders(res, CacheHeader.Disable);
      sendJSON(res, json);
    } catch (err) {
      next(err);
    }
  });

  router.get('/notifications', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await controllers.notifications.getNotifications();
      const json = JSON.stringify(data);

      setStandardHeaders(res, CacheHeader.Store2min);
      sendJSON(res, json);
    } catch (err) {
      next(err);
    }
  });

  router.post('/notification-tokens', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceId = asString(req.body?.deviceId);
      const token = asString(req.body?.token);
      const platform = asString(req.body?.platform);

      if (!deviceId || !token || !platform) {
        endWithStatus(res, 400); // Bad Request
        return;
      }

      const result = await controllers.pushNotificationToken.save(deviceId, token, platform);
      switch (result.kind) {
        case 'Success':
          endWithStatus(res, 200);
          return;
        case 'Error':
          logger.info(`Error when saving push notification token.`, {
            deviceId,
            token,
            platform,
            error: result.error
          });

          endWithStatus(res, 500); // Internal Server Error
          return;
      }
    } catch (err) {
      next(err);
    }
  });

  return router;
}
