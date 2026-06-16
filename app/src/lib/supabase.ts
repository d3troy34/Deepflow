import {
  createClient,
  type Session,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { authRedirectUrl, resolveSupabaseAuthConfig } from './authConfig'

export type AuthSession = Session

export interface AccountProfile {
  id: string
  email: string | null
  name: string | null
  username: string | null
  display_name: string | null
  avatar_url: string | null
  tier: string | null
  created_at: string | null
  updated_at: string | null
}

export interface UserEntitlement {
  user_id: string
  plan_code: string
  billing_status: string
  credit_balance: number
  monthly_credit_limit: number
  credits_label: string
  created_at: string | null
  updated_at: string | null
}

export interface AccountProfileBundle {
  profile: AccountProfile | null
  entitlement: UserEntitlement | null
}

export interface AccountProfileUpdate {
  displayName: string
  username: string
}

const PROFILE_COLUMNS = [
  'id',
  'email',
  'name',
  'username',
  'display_name',
  'avatar_url',
  'tier',
  'created_at',
  'updated_at',
].join(',')

const ENTITLEMENT_COLUMNS = [
  'user_id',
  'plan_code',
  'billing_status',
  'credit_balance',
  'monthly_credit_limit',
  'credits_label',
  'created_at',
  'updated_at',
].join(',')

const USERNAME_RE = /^[a-z0-9_]{3,24}$/

export const supabaseAuthConfig = resolveSupabaseAuthConfig(
  import.meta.env as Record<string, string | undefined>,
)

export const supabase: SupabaseClient | null = supabaseAuthConfig.enabled
  ? createClient(supabaseAuthConfig.url, supabaseAuthConfig.publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null

export async function getInitialAuthSession(): Promise<AuthSession | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export function onAuthSessionChange(
  callback: (session: AuthSession | null) => void,
): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return () => data.subscription.unsubscribe()
}

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) throw new Error('Supabase auth is not configured')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authRedirectUrl(window.location.origin, import.meta.env.BASE_URL),
    },
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function normalizeUsername(value: string): string | null {
  const normalized = value.trim().toLowerCase()
  return normalized || null
}

export function validateUsername(username: string | null): string | null {
  if (!username) return null
  if (USERNAME_RE.test(username)) return null
  return 'Usuario: 3-24 caracteres, solo letras minusculas, numeros o _.'
}

export async function fetchAccountProfile(userId: string): Promise<AccountProfileBundle> {
  if (!supabase) return { profile: null, entitlement: null }

  const [profileResult, entitlementResult] = await Promise.all([
    supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .maybeSingle<AccountProfile>(),
    supabase
      .from('user_entitlements')
      .select(ENTITLEMENT_COLUMNS)
      .eq('user_id', userId)
      .maybeSingle<UserEntitlement>(),
  ])

  if (profileResult.error) throw profileResult.error
  if (entitlementResult.error) throw entitlementResult.error

  return {
    profile: profileResult.data ?? null,
    entitlement: entitlementResult.data ?? null,
  }
}

export async function updateAccountProfile(
  userId: string,
  input: AccountProfileUpdate,
): Promise<AccountProfile> {
  if (!supabase) throw new Error('Supabase auth is not configured')

  const username = normalizeUsername(input.username)
  const usernameError = validateUsername(username)
  if (usernameError) throw new Error(usernameError)

  const displayName = input.displayName.trim() || null

  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      name: displayName,
      username,
    })
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single<AccountProfile>()

  if (error) throw error
  return data
}
