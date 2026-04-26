import { redis } from './cache'

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp when the window resets
}

/**
 * Sliding window rate limiter using Redis.
 * Allows `limit` requests per `windowSeconds` from a given `identifier` (IP).
 */
export async function rateLimit(
  identifier: string,
  limit: number = 5,
  windowSeconds: number = 900 // 15 minutes
): Promise<RateLimitResult> {
  const key = 'ratelimit:' + identifier
  const now = Date.now()
  const windowStart = now - windowSeconds * 1000

  try {
    // Remove old entries outside the window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count requests in current window
    const count = await redis.zcard(key)

    if (count >= limit) {
      // Get oldest entry to compute reset time
      const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES')
      const reset = oldest.length >= 2
        ? Math.ceil((parseFloat(oldest[1]) + windowSeconds * 1000) / 1000)
        : Math.ceil(now / 1000) + windowSeconds

      return { success: false, limit, remaining: 0, reset }
    }

    // Add this request with current timestamp as score
    const uniqueId = now + '-' + Math.random()
    await redis.zadd(key, now, uniqueId)
    await redis.expire(key, windowSeconds)

    return {
      success: true,
      limit,
      remaining: limit - count - 1,
      reset: Math.ceil((now + windowSeconds * 1000) / 1000)
    }
  } catch (err) {
    // If Redis fails, fail open (allow request) with warning
    console.warn('[RateLimiter] Redis error, allowing request:', err)
    return { success: true, limit, remaining: -1, reset: Math.ceil(now / 1000) + windowSeconds }
  }
}