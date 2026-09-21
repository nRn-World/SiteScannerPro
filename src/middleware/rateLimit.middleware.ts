import { Request, Response, NextFunction } from 'express';

/**
 * Enkel in-memory rate limiting per IP (ingen extern dependency).
 * Räknare i en slädande bucket; nollställs per fönster.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Max antal förfrågningar per fönster. */
  max: number;
  /** Fönsterlängd i ms. */
  windowMs: number;
  /** Nyckel-prefix så olika endpoints kan ha olika gränser. */
  name: string;
  /** Valfri funktion som ger en strängare gräns. */
  keyExtractor?: (req: Request) => string;
}

function clientKey(req: Request, name: string, keyExtractor?: (req: Request) => string): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
    req.socket.remoteAddress || 'unknown';
  return `${name}:${keyExtractor ? keyExtractor(req) : ip}`;
}

// Städa gamla buckets periodiskt för att undvika minnesläckage
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref();

export function rateLimit(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = clientKey(req, options.name, options.keyExtractor);
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > options.max) {
      const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.setHeader('X-RateLimit-Limit', String(options.max));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.status(429).json({
        error: 'rate_limit',
        message: 'Too many scans. Please wait before scanning again.',
        retryAfterSeconds: retryAfterSec
      });
      return;
    }

    res.setHeader('X-RateLimit-Limit', String(options.max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, options.max - bucket.count)));
    next();
  };
}
