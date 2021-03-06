import { Router, NextFunction } from 'express';

type RequestMethod = 'get';

export class Request {

  method: RequestMethod;
  path: string;
  query: any;

  constructor(method: RequestMethod, path: string, query?: any) {
    this.method = method;
    this.path = path;
    this.query = query;
  }
}

export class Response {

  headers: { [key: string]: string | undefined } = {};
  body: string | undefined = undefined;

  set(field: string, value?: string): Response {
    this.headers[field] = value;
    return this;
  }

  send(body?: string): Response {
    this.body = body;
    return this;
  }
}

export function send(router: Router, request: Request): Response {
  const route = getExpressRoute(router, request);
  const response = new Response();

  let error: any;
  function captureError(err?: any) {
    error = err;
  }

  route.handle(request, response, captureError);

  if (error) {
    throw error;
  }

  return response;
}

/* ================== */
/* === Bad things === */
/* ================== */

type RouteHandle = (req: Request, res: Response, next: NextFunction) => void;

interface ExpressLayer {
  route: ExpressRoute;
  regexp: RegExp;
  handle: RouteHandle;
}

interface ExpressRoute {
  path: string;
  stack: ExpressRouteLayer[];
}

interface ExpressRouteLayer {
  method: string;
  regexp: RegExp;
  handle: RouteHandle;
}

function getExpressRoute(router: Router, request: Request): ExpressRouteLayer {
  const routerLayers = router.stack as ExpressLayer[];

  for (const layer of routerLayers) {
    const route = layer.route;
    if (route.path != request.path) {
      continue;
    }

    for (const routeLayer of route.stack) {
      if (routeLayer.method == request.method) {
        return routeLayer;
      }
    }
  }

  throw new Error(`Unable to find route '${request.method} ${request.path}' in router.`);
}
