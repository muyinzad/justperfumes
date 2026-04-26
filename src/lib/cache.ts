import Redis from 'ioredis'

const redis = new Redis({ 
  host: '127.0.0.1', 
  port: 6379,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  lazyConnect: true,
})

redis.on('error', (err) => {
  if (err.message !== 'Connection is closed.') {
    console.error('[Redis cache]', err.message)
  }
})

export async function getCached(key: string): Promise<string | null> {
  try {
    return await redis.get(key)
  } catch {
    return null
  }
}

export async function setCached(key: string, value: string, ttlSeconds: number): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, value)
  } catch {
    // fail silently — cache is optional
  }
}

export async function delCached(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length) await redis.del(...keys)
  } catch {
    // fail silently
  }
}

export { redis }
