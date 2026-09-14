export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Basic in-memory rate limiter.
 * Note: In a serverless environment (like Vercel), this state is not shared across instances
 * and may be reset during cold starts. For production, consider Redis (Upstash) or Vercel KV.
 * 
 * @param ip The IP address or identifier to rate limit
 * @param limit Max requests allowed
 * @param windowMs Time window in milliseconds
 */
export function rateLimit(ip: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { success: true, limit, remaining: limit - record.count, reset: record.resetTime };
}
