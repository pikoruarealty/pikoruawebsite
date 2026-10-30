/**
 * Lightweight in-memory rate limiter for API route handlers.
 *
 * NOTE: In-memory state lives in one Node process. The VPS runs the app as a
 * single Node process in one Docker container, so this holds; if it is ever scaled to
 * multiple processes, move this to a shared store (e.g. Redis or Postgres).
 *
 * For a low-traffic luxury advisory site this is sufficient as a spam
 * deterrent; the honeypot and Zod validation are the primary defences.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: options.limit - 1, resetAt };
  }

  if (entry.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: options.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/** Extract a best-effort client identifier from request headers. */
export function getClientIdentifier(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Pre-configured limiters for the two main use cases

/** 10 lead submissions per IP per 10 minutes */
export const leadRateLimit = (ip: string) =>
  rateLimit(ip, { limit: 10, windowMs: 10 * 60 * 1000 });

/** 30 revalidation calls per IP per minute (webhook only) */
export const revalidateRateLimit = (ip: string) =>
  rateLimit(ip, { limit: 30, windowMs: 60 * 1000 });

/** 60 CRM feed calls per IP per minute (in-house CRM polling) */
export const crmRateLimit = (ip: string) =>
  rateLimit(`crm:${ip}`, { limit: 60, windowMs: 60 * 1000 });
