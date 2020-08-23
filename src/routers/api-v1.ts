import express, { Request, Response, NextFunction, Router } from 'express';

import { Mpk } from '../mpk';

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

export function createV1Router(mpk: Mpk): Router {
  const router = express.Router();

  router.get('/lines', async (req: Request, res: Response, next: NextFunction) => {
    try {
      standardHeaders(res, Cache.Store12h);

      const data = mpk.getLines();
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/stops', async (req: Request, res: Response, next: NextFunction) => {
    try {
      standardHeaders(res, Cache.Store3d);

      const data = mpk.getStops();
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/vehicles', async (req: Request, res: Response, next: NextFunction) => {
    try {
      standardHeaders(res, Cache.Disable);

      const query = req.query.lines as string || '';
      const lineNames = query.toLowerCase().split(';').map(n => n.trim());
      const data = mpk.getVehicleLocations(lineNames);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
