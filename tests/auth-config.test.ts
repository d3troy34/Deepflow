import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  authRedirectUrl,
  resolveSupabaseAuthConfig,
} from '../app/src/lib/authConfig.ts'

test('resolveSupabaseAuthConfig reports missing Supabase env values', () => {
  const config = resolveSupabaseAuthConfig({})

  assert.equal(config.enabled, false)
  assert.deepEqual(config.missing, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'])
})

test('resolveSupabaseAuthConfig trims configured Supabase env values', () => {
  const config = resolveSupabaseAuthConfig({
    VITE_SUPABASE_URL: ' https://project.supabase.co ',
    VITE_SUPABASE_PUBLISHABLE_KEY: ' sb_publishable_example ',
  })

  assert.equal(config.enabled, true)
  assert.equal(config.url, 'https://project.supabase.co')
  assert.equal(config.publishableKey, 'sb_publishable_example')
  assert.deepEqual(config.missing, [])
})

test('authRedirectUrl points OAuth callbacks at the Vite app base path', () => {
  assert.equal(authRedirectUrl('https://deepflow.example', '/app/'), 'https://deepflow.example/app/')
  assert.equal(authRedirectUrl('http://localhost:5173', '/app'), 'http://localhost:5173/app/')
})
