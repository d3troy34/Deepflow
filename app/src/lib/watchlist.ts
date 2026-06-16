// Client-side research bench (MVP shell). Persisted to localStorage — no backend yet.
// Productionizing this = a later Denario persistence plan (ties to design docs 014/015).

export interface Pin {
  run_id: string
  ticker: string
  note: string
  pinned_at: string
}

const KEY = 'df-watchlist'

export function getPins(): Pin[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Pin[]) : []
  } catch {
    return []
  }
}

function save(pins: Pin[]) {
  localStorage.setItem(KEY, JSON.stringify(pins))
}

export function isPinned(runId: string): boolean {
  return getPins().some((p) => p.run_id === runId)
}

export function pin(runId: string, ticker: string) {
  const pins = getPins()
  if (!pins.some((p) => p.run_id === runId)) {
    pins.push({ run_id: runId, ticker, note: '', pinned_at: new Date().toISOString() })
    save(pins)
  }
}

export function unpin(runId: string) {
  save(getPins().filter((p) => p.run_id !== runId))
}

export function setNote(runId: string, note: string) {
  save(getPins().map((p) => (p.run_id === runId ? { ...p, note } : p)))
}
