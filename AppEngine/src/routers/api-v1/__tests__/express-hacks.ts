import { Router, NextFunction } from 'express';

export class Request {
  public constructor(
    public method: 'get' | 'post',
    public path: string,
    public query?: any,
    public body?: any,
  ) { }
}

export class Response {

  statusCode: number | undefined;
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

  status(code: number): Response {
    this.statusCode = code;
    return this;
  }

  end() { }
}

export async function send(router: Router, request: Request): Promise<Response> {
  const route = getExpressRoute(router, request);
  const response = new Response();

  let error: any;
  function captureError(err?: any) {
    error = err;
  }

  const result = route.handle(request, response, captureError);
  if (result instanceof Promise) {
    await result;
  }

  if (error) {
    throw error;
  }

  return response;
}

/* ================== */
/* === Bad things === */
/* ================== */

type RouteHandle = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

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
    if (route?.path != request.path) {
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
