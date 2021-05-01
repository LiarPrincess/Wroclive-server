import express, { Request, Response, NextFunction, Router } from 'express';

import { TimestampedLines, TimestampedStops, Controllers } from '../controllers';
import { splitLowerCase } from './helpers';

/* ================ */
/* === Response === */
/* ================ */

enum Cache {
  Store6h = 'max-age=21600',
  Store12h = 'max-age=43200',
  Store3days = 'max-age=259200',
  Disable = 'no-store'
}

function standardHeaders(res: Response, cache: Cache) {
  res.append('Connection', 'Keep-Alive');
  res.append('Keep-Alive', 'timeout=10, max=30');
  res.append('Cache-Control', cache);
}

function jsonBody(res: Response, json: string) {
  res.set('Content-Type', 'application/json');
  res.send(json);
}

/* ============= */
/* === Cache === */
/* ============= */

interface TimestampedString {
  readonly timestamp: string;
  readonly data: string;
}

/**
 * A lot of our data is static (it does not change very often), we will cache
 * stringified responses to avoid expensive serialization.
 */
class JSONCache {

  private cachedLines?: TimestampedString = undefined;
  private cachedStops?: TimestampedString = undefined;

  stringifyLines(newValue: TimestampedLines): string {
    if (this.cachedLines && this.cachedLines.timestamp == newValue.timestamp) {
      return this.cachedLines.data;
    }

    // 'mpk.models.Line' has more properties than we should return,
    // so first we have to narrow it.
    const data = {
      timestamp: newValue.timestamp,
      data: newValue.data.map(l => ({ name: l.name, type: l.type, subtype: l.subtype }))
    };

    const json = JSON.stringify(data);
    this.cachedLines = { timestamp: newValue.timestamp, data: json };
    return json;
  }

  stringifyStops(newValue: TimestampedStops): string {
    if (this.cachedStops && this.cachedStops.timestamp == newValue.timestamp) {
      return this.cachedStops.data;
    }

    const json = JSON.stringify(newValue);
    this.cachedStops = { timestamp: newValue.timestamp, data: json };
    return json;
  }
}

/* ===================== */
/* === Create router === */
/* ===================== */

export function createApiV1Router(controllers: Controllers): Router {
  const router = express.Router();
  const cache = new JSONCache();

  router.get('/lines', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = controllers.lines.getLines();
      const json = cache.stringifyLines(data);

      standardHeaders(res, Cache.Store6h);
      jsonBody(res, json);
    } catch (err) {
      next(err);
    }
  });

  router.get('/stops', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = controllers.stops.getStops();
      const json = cache.stringifyStops(data);

      standardHeaders(res, Cache.Store3days);
      jsonBody(res, json);
    } catch (err) {
      next(err);
    }
  });

  router.get('/vehicles', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.lines as string || '';
      const lineNames = splitLowerCase(query, ';');
      const data = controllers.vehicleLocation.getVehicleLocations(lineNames);

      standardHeaders(res, Cache.Disable);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
