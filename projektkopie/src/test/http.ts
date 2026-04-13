import { NextRequest } from 'next/server';

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}

export function buildJsonRequest(url: string, body: unknown, init: RequestInit = {}): NextRequest {
  const { signal, ...rest } = init;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  return new NextRequest(url, {
    ...rest,
    ...(signal ? { signal } : {}),
    method: init.method ?? 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

type FetchRouteMatch = string | RegExp | ((url: URL, request: Request) => boolean);

export interface FetchRouteHandler {
  match: FetchRouteMatch;
  response: Response | ((request: Request, url: URL) => Response | Promise<Response>);
}

const matchesRoute = (match: FetchRouteMatch, url: URL, request: Request): boolean => {
  if (typeof match === 'string') {
    return url.pathname === match || url.href === match;
  }

  if (match instanceof RegExp) {
    return match.test(url.href);
  }

  return match(url, request);
};

export function createFetchRouter(routes: FetchRouteHandler[], defaultResponse = jsonResponse({})): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const request =
      input instanceof Request
        ? input
        : new Request(typeof input === 'string' ? input : input.toString(), init);
    const url = new URL(request.url);
    const route = routes.find((entry) => matchesRoute(entry.match, url, request));

    if (!route) {
      return defaultResponse;
    }

    return typeof route.response === 'function' ? route.response(request, url) : route.response;
  };
}
