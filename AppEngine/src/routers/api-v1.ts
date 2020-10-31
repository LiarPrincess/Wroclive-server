import express, { Request, Response, NextFunction, Router } from 'express';

import { Mpk, Line, Stop, Timestamped } from '../mpk';
import { splitLowerCase } from './helpers';

/* ================ */
/* === Response === */
/* ================ */

enum Cache {
  Store6h = 'max-age=21600',
  Store12h = 'max-age=43200',
  Store3d = 'max-age=259200',
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

type CacheEntry = Timestamped<string>;

/**
 * A lot of our data is static (it does not change very often), we will cache
 * stringified responses to avoid expensive serialization.
 */
class ResponseCache {

  private linesResponse?: CacheEntry = undefined;
  private stopsResponse?: CacheEntry = undefined;

  getLinesResponse(mpk: Timestamped<Line[]>): string {
    if (this.linesResponse && this.linesResponse.timestamp == mpk.timestamp) {
      return this.linesResponse.data;
    }

    // 'mpk.models.Line' has more properties than we should return,
    // so first we have to narrow it.
    const data = {
      timestamp: mpk.timestamp,
      data: mpk.data.map(l => ({ name: l.name, type: l.type, subtype: l.subtype }))
    };

    const json = JSON.stringify(data);
    this.linesResponse = { timestamp: mpk.timestamp, data: json };
    return json;
  }

  getStopsResponse(mpk: Timestamped<Stop[]>): string {
    if (this.stopsResponse && this.stopsResponse.timestamp == mpk.timestamp) {
      return this.stopsResponse.data;
    }

    const json = JSON.stringify(mpk);
    this.stopsResponse = { timestamp: mpk.timestamp, data: json };
    return json;
  }
}

/* ===================== */
/* === Create router === */
/* ===================== */

export function createApiV1Router(mpk: Mpk): Router {
  const router = express.Router();
  const cache = new ResponseCache();

  router.get('/lines', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = mpk.getLines();
      const json = cache.getLinesResponse(data);

      standardHeaders(res, Cache.Store6h);
      jsonBody(res, json);
    } catch (err) {
      next(err);
    }
  });

  router.get('/stops', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = mpk.getStops();
      const json = cache.getStopsResponse(data);

      standardHeaders(res, Cache.Store3d);
      jsonBody(res, json);
    } catch (err) {
      next(err);
    }
  });

  router.get('/vehicles', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.lines as string || '';
      const lineNames = splitLowerCase(query, ';');
      const data = mpk.getVehicleLocations(lineNames);

      standardHeaders(res, Cache.Disable);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
