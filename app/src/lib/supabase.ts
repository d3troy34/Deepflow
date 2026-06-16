import {
  createClient,
  type Session,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { authRedirectUrl, resolveSupabaseAuthConfig } from './authConfig'

export type AuthSession = Session

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
