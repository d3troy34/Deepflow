// Typed client for the Denario Control Room API (read-only surface used by the tracker).
// Field shapes mirror api/schemas.py: RunSummaryOut, RunDetailOut, RecommendationOut, GateOut.

import {
  fetchPublicationsFromIndex,
  type PublicPublication,
  type PublicationsFeed,
} from './publications'

const BASE = ((import.meta.env.VITE_API_BASE as string | undefined) ?? '').replace(/\/$/, '')
const PUBLICATIONS_INDEX_URL = (
  (import.meta.env.VITE_PUBLICATIONS_INDEX_URL as string | undefined) ?? '/api/publications/feed'
).trim()

export const hasPublicationsFeed = PUBLICATIONS_INDEX_URL.length > 0
export type { PublicPublication, PublicationsFeed }

type AuthTokenProvider = () => string | null | Promise<string | null>

let authTokenProvider: AuthTokenProvider | null = null

export function setApiAuthTokenProvider(provider: AuthTokenProvider | null): void {
  authTokenProvider = provider
}

export interface RunSummary {
  run_id: string
  workflow_type: string
  valuation_mode: string
  ticker: string
  company_name: string | null
  status: string
  recommendation: string | null
  gate_status: string | null
  failure_mode: string | null
  blocked_reason: string | null
  duration_sec: number | null
  fixture_mode: boolean
  created_at: string | null
  started_at: string | null
  completed_at: string | null
}

export interface Recommendation {
  rating: string | null
  confidence: string | null
  time_horizon: string | null
  display: string | null
  actionability_status: string | null
  verdict_type: string | null
  capital_action: string | null
  public_recommendation: boolean | null
  recommendation_taxonomy: string | null
  public_label_basis: string | null
  internal_research_view: string | null
  raw_thesis_rating: string | null
  thesis_diverges: boolean | null
  is_fallback: boolean | null
  blocked_reason: string | null
}

export interface Gate {
  gate_id: string
  name: string
  severity: string
  status: string
  message: string | null
  details?: unknown
}

export interface RunDetail {
  summary: RunSummary
  recommendation: Recommendation | null
  valuation_summary: Record<string, unknown> | null
  price: number | null
  currency: string | null
  market_cap: number | null
  thesis_summary: string | null
  quality_gates: Gate[]
  limitations: string[]
  manifest: Record<string, string>
}

async function getJSON<T>(path: string): Promise<T> {
  const token = authTokenProvider ? await authTokenProvider() : null
  const headers = token ? { authorization: `Bearer ${token}` } : undefined
  const res = await fetch(`${BASE}${path}`, { headers })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

export async function fetchRuns(): Promise<RunSummary[]> {
  const data = await getJSON<unknown>('/api/runs')
  if (Array.isArray(data)) return data as RunSummary[]
  const obj = data as { runs?: RunSummary[]; items?: RunSummary[] }
  return obj.runs ?? obj.items ?? []
}

export async function fetchPublications(): Promise<PublicPublication[]> {
  if (!hasPublicationsFeed) return Promise.resolve([])
  const token = shouldSendAuthToken(PUBLICATIONS_INDEX_URL) && authTokenProvider
    ? await authTokenProvider()
    : null
  const headers = token ? { authorization: `Bearer ${token}` } : undefined
  return fetchPublicationsFromIndex(PUBLICATIONS_INDEX_URL, { headers })
}

export async function deletePublication(publicSlug: string): Promise<void> {
  const slug = publicSlug.trim()
  if (!slug) throw new Error('public_slug is required')

  const headers: Record<string, string> = { 'content-type': 'application/json' }
  const token = authTokenProvider ? await authTokenProvider() : null
  if (token) headers.authorization = `Bearer ${token}`

  const response = await fetch('/api/publications/delete', {
    method: 'POST',
    headers,
    body: JSON.stringify({ public_slug: slug }),
  })

  if (response.ok) return

  let message = `${response.status} ${response.statusText}`
  try {
    const data = (await response.json()) as { error?: unknown }
    if (typeof data.error === 'string' && data.error.trim()) message = data.error
  } catch {
    // Preserve the HTTP status fallback when the response is not JSON.
  }
  throw new Error(message)
}

function shouldSendAuthToken(url: string): boolean {
  if (url.startsWith('/')) return true
  if (typeof window === 'undefined') return false
  try {
    return new URL(url, window.location.href).origin === window.location.origin
  } catch {
    return false
  }
}

export function fetchRun(runId: string): Promise<RunDetail> {
  return getJSON<RunDetail>(`/api/runs/${runId}`)
}

export const reportPdfUrl = (runId: string) => `${BASE}/api/runs/${runId}/report/pdf`
export const execSummaryPdfUrl = (runId: string) =>
  `${BASE}/api/runs/${runId}/report/exec-summary-pdf`
export const reportHtmlUrl = (runId: string) => `${BASE}/api/runs/${runId}/report/html`
export const reportUrl = (runId: string, kind: 'pdf' | 'html' | 'json' | 'xlsx') =>
  `${BASE}/api/runs/${runId}/report/${kind}`

export async function fetchLivePrices(
  tickers: string[],
): Promise<Record<string, number | null>> {
  if (tickers.length === 0) return {}
  try {
    const params = new URLSearchParams({ tickers: tickers.join(',') })
    const res = await fetch(`/api/market/live-prices?${params}`)
    if (!res.ok) return Object.fromEntries(tickers.map((t) => [t, null]))
    const data = (await res.json()) as { prices?: Record<string, number | null> }
    return data.prices ?? Object.fromEntries(tickers.map((t) => [t, null]))
  } catch {
    return Object.fromEntries(tickers.map((t) => [t, null]))
  }
}
