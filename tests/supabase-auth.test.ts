import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'

import {
  assertPublishTokenOrSupabaseAdmin,
  assertSupabaseAdmin,
  assertSupabaseUser,
  isSupabaseAdminUser,
} from '../api/_supabaseAuth.ts'

const originalFetch = globalThis.fetch
const originalEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  DEEPFLOW_ADMIN_EMAILS: process.env.DEEPFLOW_ADMIN_EMAILS,
  DEEPFLOW_PUBLISH_TOKEN: process.env.DEEPFLOW_PUBLISH_TOKEN,
}

afterEach(() => {
  globalThis.fetch = originalFetch
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

test('assertSupabaseUser rejects requests without a bearer token', async () => {
  await assert.rejects(
    () => assertSupabaseUser({ headers: {} }),
    (error) => error instanceof Error && 'status' in error && error.status === 401,
  )
})

test('assertSupabaseUser validates bearer token against Supabase Auth', async () => {
  process.env.SUPABASE_URL = 'https://project.supabase.co'
  process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test'
  let observedUrl = ''
  let observedAuthorization = ''
  let observedApiKey = ''

  globalThis.fetch = async (input, init) => {
    observedUrl = String(input)
    const headers = new Headers(init?.headers)
    observedAuthorization = headers.get('authorization') ?? ''
    observedApiKey = headers.get('apikey') ?? ''
    return Response.json({
      id: 'user-id',
      email: 'reader@example.com',
      app_metadata: {},
    })
  }

  const user = await assertSupabaseUser({ headers: { authorization: 'Bearer user-token' } })

  assert.equal(observedUrl, 'https://project.supabase.co/auth/v1/user')
  assert.equal(observedAuthorization, 'Bearer user-token')
  assert.equal(observedApiKey, 'sb_publishable_test')
  assert.equal(user.email, 'reader@example.com')
})

test('assertSupabaseUser maps rejected Supabase sessions to login required', async () => {
  process.env.SUPABASE_URL = 'https://project.supabase.co'
  process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test'
  globalThis.fetch = async () => new Response('{}', { status: 401 })

  await assert.rejects(
    () => assertSupabaseUser({ headers: { authorization: 'Bearer expired-token' } }),
    (error) => error instanceof Error && 'status' in error && error.status === 401,
  )
})

test('isSupabaseAdminUser accepts admin app metadata', () => {
  assert.equal(isSupabaseAdminUser({
    id: 'user-id',
    email: 'reader@example.com',
    app_metadata: { role: 'admin' },
  }), true)
  assert.equal(isSupabaseAdminUser({
    id: 'user-id',
    email: 'reader@example.com',
    app_metadata: { admin: true },
  }), true)
  assert.equal(isSupabaseAdminUser({
    id: 'user-id',
    email: 'reader@example.com',
    app_metadata: { roles: ['member', 'admin'] },
  }), true)
})

test('isSupabaseAdminUser accepts configured admin emails', () => {
  process.env.DEEPFLOW_ADMIN_EMAILS = 'owner@example.com, admin@example.com'

  assert.equal(isSupabaseAdminUser({
    id: 'user-id',
    email: ' Admin@Example.com ',
    app_metadata: {},
  }), true)
})

test('assertSupabaseAdmin rejects non-admin users', async () => {
  process.env.SUPABASE_URL = 'https://project.supabase.co'
  process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test'
  globalThis.fetch = async () => Response.json({
    id: 'user-id',
    email: 'reader@example.com',
    app_metadata: {},
  })

  await assert.rejects(
    () => assertSupabaseAdmin({ headers: { authorization: 'Bearer user-token' } }),
    (error) => error instanceof Error && 'status' in error && error.status === 403,
  )
})

test('assertPublishTokenOrSupabaseAdmin accepts the server publish token', async () => {
  process.env.DEEPFLOW_PUBLISH_TOKEN = 'server-token'
  globalThis.fetch = async () => {
    throw new Error('Supabase should not be called for a valid publish token')
  }

  await assertPublishTokenOrSupabaseAdmin({
    headers: { authorization: 'Bearer server-token' },
  })
})
