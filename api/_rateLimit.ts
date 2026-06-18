interface RateLimitRequest {
  headers: Headers | Record<string, string | string[] | undefined>
  socket?: {
    remoteAddress?: string
  }
}

export interface RateLimitOptions {
  scope: string
  limit: number
  windowMs: number
  now?: () => number
}

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

class RateLimitError extends Error {
  status = 429
}

export function clearRateLimitBuckets(): void {
  buckets.clear()
}

export function assertRateLimit(request: RateLimitRequest, options: RateLimitOptions): void {
  if (options.limit <= 0 || options.windowMs <= 0) return

  const now = options.now?.() ?? Date.now()
  const key = `${options.scope}:${clientIp(request)}`
  const existing = buckets.get(key)

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    pruneExpiredBuckets(now)
    return
  }

  if (existing.count >= options.limit) {
    throw new RateLimitError('rate limit exceeded')
  }

  existing.count += 1
}

function pruneExpiredBuckets(now: number): void {
  if (buckets.size < 10_000) return
  for (const [key, bucket] of buckets.entries()) {
    if (now >= bucket.resetAt) buckets.delete(key)
  }
}

function clientIp(request: RateLimitRequest): string {
  const forwardedFor = headerValue(request.headers, 'x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()

  return (
    headerValue(request.headers, 'cf-connecting-ip') ||
    headerValue(request.headers, 'x-real-ip') ||
    request.socket?.remoteAddress ||
    'unknown'
  )
}

function headerValue(
  headers: Headers | Record<string, string | string[] | undefined>,
  name: string,
): string {
  if (headers instanceof Headers) return headers.get(name) ?? ''

  const value = headers[name] ?? headers[name.toLowerCase()]
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}
