// Typed client for the Denario Control Room API (read-only surface used by the tracker).
// Field shapes mirror api/schemas.py: RunSummaryOut, RunDetailOut, RecommendationOut, GateOut.

const BASE = ((import.meta.env.VITE_API_BASE as string | undefined) ?? '').replace(/\/$/, '')

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
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

export async function fetchRuns(): Promise<RunSummary[]> {
  const data = await getJSON<unknown>('/api/runs')
  if (Array.isArray(data)) return data as RunSummary[]
  const obj = data as { runs?: RunSummary[]; items?: RunSummary[] }
  return obj.runs ?? obj.items ?? []
}

export function fetchRun(runId: string): Promise<RunDetail> {
  return getJSON<RunDetail>(`/api/runs/${runId}`)
}

export const reportPdfUrl = (runId: string) => `${BASE}/api/runs/${runId}/report/pdf`
export const reportHtmlUrl = (runId: string) => `${BASE}/api/runs/${runId}/report/html`
export const reportUrl = (runId: string, kind: 'pdf' | 'html' | 'json' | 'xlsx') =>
  `${BASE}/api/runs/${runId}/report/${kind}`
