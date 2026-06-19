export interface SupabaseAuthConfig {
  enabled: boolean
  url: string
  publishableKey: string
  missing: string[]
}

type Env = Record<string, string | undefined>

const SUPABASE_URL_ENV = 'VITE_SUPABASE_URL'
const SUPABASE_KEY_ENV = 'VITE_SUPABASE_PUBLISHABLE_KEY'

export function resolveSupabaseAuthConfig(env: Env): SupabaseAuthConfig {
  const url = (env[SUPABASE_URL_ENV] ?? '').trim()
  const publishableKey = (env[SUPABASE_KEY_ENV] ?? '').trim()
  const missing = [
    url ? null : SUPABASE_URL_ENV,
    publishableKey ? null : SUPABASE_KEY_ENV,
  ].filter((value): value is string => value !== null)

  return {
    enabled: missing.length === 0,
    url,
    publishableKey,
    missing,
  }
}

export function authRedirectUrl(origin: string, basePath: string): string {
  const normalizedBase = normalizeBasePath(basePath)
  const normalizedOrigin = origin.endsWith('/') ? origin : `${origin}/`
  return new URL(normalizedBase, normalizedOrigin).toString()
}

export function loginUnavailableUrl(basePath: string): string {
  const url = new URL(normalizeBasePath(basePath), 'https://deepflow.local')
  url.searchParams.set('login', '1')
  return `${url.pathname}${url.search}`
}

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim()
  if (!trimmed) return '/'
  const leading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return leading.endsWith('/') ? leading : `${leading}/`
}
