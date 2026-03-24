import { logger } from "./logger";

/**
 * Logs request method, path, status, and duration.
 * Import and call in individual API routes:
 *
 *   const done = requestLog(request);
 *   // ... handle request ...
 *   done(200);
 */
export function requestLog(request: Request) {
  const start = Date.now();
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;

  return function done(status: number) {
    const duration = Date.now() - start;
    logger.info({ method, path, status, duration }, "request completed");
  };
}
