import assert from 'node:assert/strict'
import { test } from 'node:test'

import { assertRateLimit, clearRateLimitBuckets } from '../api/_rateLimit.ts'

function requestFor(headers: Record<string, string> = {}, remoteAddress = '127.0.0.1') {
  return {
    headers,
    socket: { remoteAddress },
  }
}

test('assertRateLimit rejects requests over the configured window limit', () => {
  clearRateLimitBuckets()
  let now = 1_000
  const options = {
    scope: 'publication-write',
    limit: 2,
    windowMs: 1_000,
    now: () => now,
  }
  const request = requestFor({ 'x-forwarded-for': '203.0.113.10, 10.0.0.1' })

  assert.doesNotThrow(() => assertRateLimit(request, options))
  assert.doesNotThrow(() => assertRateLimit(request, options))
  assert.throws(() => assertRateLimit(request, options), {
    name: 'Error',
    message: 'rate limit exceeded',
    status: 429,
  })

  now += 1_001
  assert.doesNotThrow(() => assertRateLimit(request, options))
})

test('assertRateLimit keeps independent buckets per client IP and scope', () => {
  clearRateLimitBuckets()
  const options = {
    scope: 'publication-write',
    limit: 1,
    windowMs: 60_000,
    now: () => 2_000,
  }

  assert.doesNotThrow(() => assertRateLimit(requestFor({ 'x-real-ip': '203.0.113.10' }), options))
  assert.throws(() => assertRateLimit(requestFor({ 'x-real-ip': '203.0.113.10' }), options), /rate limit/)
  assert.doesNotThrow(() => assertRateLimit(requestFor({ 'x-real-ip': '203.0.113.11' }), options))
  assert.doesNotThrow(() => assertRateLimit(requestFor({ 'x-real-ip': '203.0.113.10' }), {
    ...options,
    scope: 'publication-read',
  }))
})
