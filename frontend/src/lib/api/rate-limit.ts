/**
 * Production-ready distributed rate limiting for API routes.
 *
 * Designed for serverless environments (e.g. Vercel) using Upstash Redis REST API.
 * In serverless environments, in-memory rate limiting is ineffective because lambda instances
 * are ephemeral and do not share state.
 *
 * Required environment variables for distributed enforcement:
 * - UPSTASH_REDIS_REST_URL: REST endpoint URL from Upstash Console
 * - UPSTASH_REDIS_REST_TOKEN: REST bearer token from Upstash Console
 */

export interface RateLimitOptions {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  isSharedStore: boolean;
}

// Local in-memory store used exclusively for non-production development/test execution
const localMemoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Checks whether the distributed Upstash Redis store credentials are provided.
 */
export function isSharedRateLimiterConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(
    url &&
    token &&
    !url.includes('placeholder') &&
    !token.includes('placeholder')
  );
}

/**
 * Returns diagnostic configuration status for logging and health checks.
 */
export function getRateLimitConfigDiagnostics(): {
  configured: boolean;
  store: 'upstash_redis' | 'local_fallback_unshared';
  missingEnv: string[];
} {
  const missingEnv: string[] = [];
  if (!process.env.UPSTASH_REDIS_REST_URL) missingEnv.push('UPSTASH_REDIS_REST_URL');
  if (!process.env.UPSTASH_REDIS_REST_TOKEN) missingEnv.push('UPSTASH_REDIS_REST_TOKEN');

  const configured = isSharedRateLimiterConfigured();
  return {
    configured,
    store: configured ? 'upstash_redis' : 'local_fallback_unshared',
    missingEnv,
  };
}

/**
 * Evaluates rate limit for a specific key (e.g. user ID or IP address).
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { maxRequests, windowSeconds } = options;
  const rateLimitKey = `utsavai:ratelimit:${identifier}`;

  // 1. Production distributed rate limiting via Upstash Redis REST API
  if (isSharedRateLimiterConfigured()) {
    try {
      const url = process.env.UPSTASH_REDIS_REST_URL!;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

      // Pipeline execution: INCR + EXPIRE (if not exists) + TTL
      const pipelineCommands = [
        ['INCR', rateLimitKey],
        ['EXPIRE', rateLimitKey, windowSeconds, 'NX'],
        ['TTL', rateLimitKey],
      ];

      const res = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipelineCommands),
      });

      if (!res.ok) {
        console.error(`[rateLimit] Upstash HTTP error ${res.status}: ${res.statusText}`);
        // Fail-open to preserve user availability if Redis provider encounters transient HTTP failure
        return {
          allowed: true,
          limit: maxRequests,
          remaining: 1,
          resetInSeconds: 0,
          isSharedStore: true,
        };
      }

      const results = (await res.json()) as Array<{ result?: unknown; error?: string }>;
      const count = typeof results[0]?.result === 'number' ? results[0].result : 1;
      const ttl = typeof results[2]?.result === 'number' && results[2].result > 0
        ? results[2].result
        : windowSeconds;

      if (count > maxRequests) {
        return {
          allowed: false,
          limit: maxRequests,
          remaining: 0,
          resetInSeconds: ttl,
          isSharedStore: true,
        };
      }

      return {
        allowed: true,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - count),
        resetInSeconds: ttl,
        isSharedStore: true,
      };
    } catch (err: unknown) {
      console.error('[rateLimit] Error contacting Upstash Redis REST endpoint:', err);
      // Fail-open on network failure to avoid blocking legitimate users
      return {
        allowed: true,
        limit: maxRequests,
        remaining: 1,
        resetInSeconds: 0,
        isSharedStore: true,
      };
    }
  }

  // 2. Fallback when shared Redis credentials are not configured
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    // In production on Vercel without Redis, log an actionable diagnostic once and allow request
    console.warn(
      '[rateLimit] Shared Redis not configured (missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). In serverless production, in-memory rate limiting is not used.'
    );
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests,
      resetInSeconds: 0,
      isSharedStore: false,
    };
  }

  // In non-production (testing / dev), provide in-memory simulation for test suites
  const now = Date.now();
  const existing = localMemoryStore.get(rateLimitKey);

  if (!existing || now >= existing.resetAt) {
    localMemoryStore.set(rateLimitKey, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetInSeconds: windowSeconds,
      isSharedStore: false,
    };
  }

  existing.count += 1;
  const remainingSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetInSeconds: remainingSeconds,
      isSharedStore: false,
    };
  }

  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - existing.count,
    resetInSeconds: remainingSeconds,
    isSharedStore: false,
  };
}

