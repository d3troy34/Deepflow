type HeaderRecord = Record<string, string | string[] | undefined>
type AuthRequest = Request | { headers: HeaderRecord }

export const DEEPFLOW_ACCESS_TOKEN_COOKIE = 'deepflow_access_token'

export interface SupabaseAuthUser {
  id: string
  email: string | null
  app_metadata?: Record<string, unknown> | null
}

export interface SupabaseUserAuthOptions {
  allowCookie?: boolean
}

class AuthHttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function assertSupabaseUser(
  request: AuthRequest,
  options: SupabaseUserAuthOptions = {},
): Promise<SupabaseAuthUser> {
  const token = authToken(request, options)
  const supabaseUrl = configuredEnv('SUPABASE_URL', 'VITE_SUPABASE_URL')
  const publishableKey = configuredEnv(
    'SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_ANON_KEY',
  )

  if (!supabaseUrl || !publishableKey) {
    throw new AuthHttpError(500, 'Supabase auth is not configured')
  }

  let response: Response
  try {
    response = await fetch(new URL('/auth/v1/user', supabaseUrl).toString(), {
      headers: {
        apikey: publishableKey,
        authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new AuthHttpError(502, 'failed to validate Supabase session')
  }

  if (response.status === 401 || response.status === 403) {
    throw new AuthHttpError(401, 'login required')
  }
  if (!response.ok) {
    throw new AuthHttpError(502, 'failed to validate Supabase session')
  }

  let rawUser: unknown
  try {
    rawUser = await response.json()
  } catch {
    throw new AuthHttpError(502, 'invalid Supabase user response')
  }
  return parseSupabaseUser(rawUser)
}

export async function assertSupabaseAdmin(request: AuthRequest): Promise<SupabaseAuthUser> {
  const user = await assertSupabaseUser(request)
  if (!isSupabaseAdminUser(user)) throw new AuthHttpError(403, 'admin required')
  return user
}

export async function assertPublishTokenOrSupabaseAdmin(request: AuthRequest): Promise<void> {
  const expected = configuredEnv('DEEPFLOW_PUBLISH_TOKEN')
  const actual = requestHeader(request, 'authorization')
  if (expected && actual === `Bearer ${expected}`) return
  await assertSupabaseAdmin(request)
}

export function isSupabaseAdminUser(user: SupabaseAuthUser): boolean {
  const metadata = user.app_metadata ?? {}
  if (metadata.admin === true) return true
  if (typeof metadata.role === 'string' && metadata.role.toLowerCase() === 'admin') return true
  if (Array.isArray(metadata.roles)) {
    return metadata.roles.some((role) => typeof role === 'string' && role.toLowerCase() === 'admin')
  }

  const email = user.email?.trim().toLowerCase()
  if (!email) return false
  return configuredEnv('DEEPFLOW_ADMIN_EMAILS')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email)
}

function authToken(request: AuthRequest, options: SupabaseUserAuthOptions): string {
  const header = requestHeader(request, 'authorization')
  const prefix = 'Bearer '
  if (header.startsWith(prefix)) {
    const token = header.slice(prefix.length).trim()
    if (token) return token
  }

  if (options.allowCookie) {
    const token = cookieValue(requestHeader(request, 'cookie'), DEEPFLOW_ACCESS_TOKEN_COOKIE)
    if (token) return token
  }

  throw new AuthHttpError(401, 'login required')
}

function cookieValue(header: string, name: string): string {
  const match = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
  if (!match) return ''
  const raw = match.slice(name.length + 1).trim()
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function requestHeader(request: AuthRequest, name: string): string {
  if (request.headers instanceof Headers) return request.headers.get(name) ?? ''
  const lower = name.toLowerCase()
  const direct = request.headers[lower] ?? request.headers[name]
  if (Array.isArray(direct)) return direct[0] ?? ''
  return direct ?? ''
}

function configuredEnv(...names: string[]): string {
  for (const name of names) {
    const value = (process.env[name] ?? '').trim()
    if (value) return value
  }
  return ''
}

function parseSupabaseUser(raw: unknown): SupabaseAuthUser {
  if (!raw || typeof raw !== 'object') {
    throw new AuthHttpError(502, 'invalid Supabase user response')
  }
  const obj = raw as Record<string, unknown>
  if (typeof obj.id !== 'string' || obj.id.trim() === '') {
    throw new AuthHttpError(502, 'invalid Supabase user response')
  }
  return {
    id: obj.id,
    email: typeof obj.email === 'string' ? obj.email : null,
    app_metadata: isRecord(obj.app_metadata) ? obj.app_metadata : null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
