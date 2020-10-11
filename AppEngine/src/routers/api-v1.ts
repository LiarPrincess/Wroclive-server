import express, { Request, Response, NextFunction, Router } from 'express';

import { LineLocations, Mpk, Stop, Timestamped } from '../mpk';
import { splitLowerCase } from './helpers';

/* =============== */
/* === Headers === */
/* =============== */

enum Cache {
  Store12h = 'max-age=43200',
  Store3d = 'max-age=259200',
  Disable = 'no-store'
}

function standardHeaders(res: Response, cache: Cache) {
  res.append('Connection', 'Keep-Alive');
  res.append('Keep-Alive', 'timeout=10, max=30');
  res.append('Cache-Control', cache);
}

/* ============== */
/* === Types === */
/* ============== */

interface LinesResponseEntry {
  name: string;
  type: string;
  subtype: string;
}

type LinesResponse = Timestamped<LinesResponseEntry[]>;
type StopsResponse = Timestamped<Stop[]>;
type VehiclesResponse = Timestamped<LineLocations[]>;

/* ===================== */
/* === Create router === */
/* ===================== */

export function createApiV1Router(mpk: Mpk): Router {
  const router = express.Router();

  // 'mpk.models.Line' has more properties than 'LinesResponseEntry', we have to narrow it.
  // We will cache the result, so that we do not filter/alloc on every response.
  let cachedLinesResponse: LinesResponse | undefined;

  router.get('/lines', async (req: Request, res: Response, next: NextFunction) => {
    try {
      standardHeaders(res, Cache.Store12h);

      const mpkLines = mpk.getLines();

      let data: LinesResponse;
      if (cachedLinesResponse && cachedLinesResponse.timestamp == mpkLines.timestamp) {
        data = cachedLinesResponse;
      } else {
        data = {
          timestamp: mpkLines.timestamp,
          data: mpkLines.data.map(l => ({ name: l.name, type: l.type, subtype: l.subtype }))
        };

        cachedLinesResponse = data;
      }

      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/stops', async (req: Request, res: Response, next: NextFunction) => {
    try {
      standardHeaders(res, Cache.Store3d);

      const data: StopsResponse = mpk.getStops();
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/vehicles', async (req: Request, res: Response, next: NextFunction) => {
    try {
      standardHeaders(res, Cache.Disable);

      const query = req.query.lines as string || '';
      const lineNames = splitLowerCase(query, ';');
      const data: VehiclesResponse = mpk.getVehicleLocations(lineNames);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
