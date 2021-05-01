import { join } from 'path';
import express, { Request, Response, NextFunction } from 'express';

import { createApiV1Router } from './routers';
import { createControllers } from './create-controllers';
import { startDataUpdateLoops } from './data-update-loops';
import { isLocal, createLogger } from './util';

const logger = createLogger('AppEngine');
const controllers = createControllers(logger);
startDataUpdateLoops(controllers, logger);

const app = express();
app.disable('etag');
app.disable('x-powered-by');

// Routes:
// - wroclive.app/api -> always respond with 200 (used for uptime testing)
// - wroclive.app/api/v1 -> use more precise router

app.get('/api', (req: Request, res: Response) => res.status(200).end());
app.use('/api/v1', createApiV1Router(controllers));

// In production the GCP is responsible for serving static files (it is faster/easier this way).
// Locally we have to do it ourselves.
if (isLocal) {
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
}

module.exports = app;
