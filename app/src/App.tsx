import { useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchLivePrices,
  fetchPublications,
  fetchRun,
  fetchRuns,
  hasPublicationsFeed,
  reportUrl,
  setApiAuthTokenProvider,
  type Gate,
  type PublicPublication,
  type Recommendation,
  type RunDetail,
  type RunSummary,
} from './lib/api'
import {
  getInitialAuthSession,
  onAuthSessionChange,
  signOut,
  signInWithGoogle,
  supabaseAuthConfig,
  type AuthSession,
} from './lib/supabase'
import { getPins, isPinned, pin, unpin, type Pin } from './lib/watchlist'

/* ---------- helpers ---------- */

const AXES = [
  { key: 'data', match: 'data', label: 'datos' },
  { key: 'model', match: 'model', label: 'modelo' },
  { key: 'memo', match: 'memo', label: 'memo' },
  { key: 'news', match: 'news', label: 'news' },
]

type Tone = 'green' | 'red' | 'amber' | 'muted'

function labelTone(label?: string | null): Tone {
  const l = (label || '').toUpperCase()
  if (l.includes('BUY')) return 'green'
  if (l.includes('SELL') || l.includes('AVOID') || l.includes('PROVISIONAL_NEGATIVE')) return 'red'
  if (l === 'HOLD' || l.includes('WATCHLIST') || l.includes('UNCERTAIN') || l === 'NO_NEW_CAPITAL')
    return 'amber'
  return 'muted'
}

function cleanLabel(s?: string | null): string {
  return (s || '—').toUpperCase().split('(')[0].trim()
}

function Pill({ text, tone, subtle }: { text: string; tone: Tone; subtle?: boolean }) {
  const c = `var(--${tone})`
  return (
    <span
      className="inline-block font-mono text-[10px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-pill border whitespace-nowrap"
      style={{ color: subtle ? 'var(--muted)' : c, borderColor: subtle ? 'var(--line-strong)' : c }}
    >
      {text}
    </span>
  )
}

function gateColor(status?: string): string {
  const s = (status || '').toLowerCase()
  if (s.includes('pass') || s.includes('accept') || s === 'ok') return 'var(--green)'
  if (s.includes('warn')) return 'var(--amber)'
  if (s.includes('block') || s.includes('fail')) return 'var(--red)'
  return 'var(--muted)'
}

function axisVal(gates: Gate[], match: string): number {
  const g = gates.find((x) => (x.gate_id || '').toLowerCase().includes(match))
  const s = (g?.status || '').toLowerCase()
  if (!g) return 0.5
  if (s.includes('pass') || s.includes('accept') || s === 'ok') return 1
  if (s.includes('warn')) return 0.5
  if (s.includes('block') || s.includes('fail')) return 0
  return 0.5
}

// Derived 0–100 health score from the 4 quality axes (a UI aggregate of the real gate states).
function qualityScore(gates?: Gate[]): number | null {
  if (!gates || gates.length === 0) return null
  const vals = AXES.map((a) => axisVal(gates, a.match))
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100)
}

function scoreColor(s: number | null): string {
  if (s == null) return 'var(--muted)'
  if (s >= 80) return 'var(--green)'
  if (s >= 50) return 'var(--amber)'
  return 'var(--red)'
}

function deriveStatus(
  label: string,
  rec?: Recommendation | null,
  gates?: Gate[],
): { text: string; tone: Tone } {
  const L = label.toUpperCase()
  const cap = (rec?.capital_action || '').toLowerCase()
  const dataGate = gates?.find((g) => (g.gate_id || '').toLowerCase().includes('data'))
  const dataBlocked = (dataGate?.status || '').toLowerCase().includes('block')
  if (cap.includes('eligible')) return { text: 'PUBLISHABLE', tone: 'green' }
  if (L.includes('DATA_LIMITED') || dataBlocked) return { text: 'WAITING DATA', tone: 'amber' }
  if (L.includes('NOT_ACTIONABLE') || cap.includes('reject') || L.includes('UNSUPPORTED'))
    return { text: 'BLOCKED', tone: 'muted' }
  if (
    L.includes('WATCHLIST') ||
    L.includes('UNCERTAIN') ||
    L.includes('PROVISIONAL') ||
    cap.includes('watchlist')
  )
    return { text: 'IN REVIEW', tone: 'amber' }
  return { text: 'IN REVIEW', tone: 'muted' }
}

/* ---------- icons ---------- */

type IconProps = { className?: string }
const svgBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}
const SearchIcon = ({ className = '' }: IconProps) => (
  <svg className={className} width="14" height="14" {...svgBase}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)
const ThemeIcon = ({ light }: { light: boolean }) =>
  light ? (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.5 8.7A6 6 0 0 1 7.3 2.5a6 6 0 1 0 6.2 6.2z" fill="currentColor" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.06 1.06M11.84 11.84l1.06 1.06M3.1 12.9l1.06-1.06M11.84 4.16l1.06-1.06"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
const UserIcon = () => (
  <svg width="15" height="15" {...svgBase} aria-hidden="true">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5.5 20a6.7 6.7 0 0 1 13 0" />
  </svg>
)
const DocIcon = ({ className = '' }: IconProps) => (
  <svg className={className} width="15" height="15" {...svgBase}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
)
const CodeIcon = ({ className = '' }: IconProps) => (
  <svg className={className} width="15" height="15" {...svgBase}>
    <path d="m9 9-3 3 3 3M15 9l3 3-3 3" />
  </svg>
)

/* ---------- expanded detail (on row click) ---------- */

function QualityDots({ gates }: { gates: Gate[] }) {
  return (
    <span className="inline-flex items-center gap-3">
      {AXES.map((a) => {
        const g = gates.find((x) => (x.gate_id || '').toLowerCase().includes(a.match))
        return (
          <span key={a.key} className="inline-flex items-center gap-1.5" title={g?.status ?? 'n/d'}>
            <span className="h-2 w-2 rounded-full" style={{ background: gateColor(g?.status) }} />
            <span className="text-[10.5px] text-muted uppercase">{a.label}</span>
          </span>
        )
      })}
    </span>
  )
}

function ExpandedDetail({ detail }: { detail: RunDetail }) {
  const rec = detail.recommendation
  const full = rec?.display || rec?.rating || ''
  const label = cleanLabel(full)
  const qualifiers = full.includes('(')
    ? full.slice(full.indexOf('(') + 1).replace(/\)/g, '').trim()
    : null
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-3">
      <div className="min-w-0">
        <div className="text-[10.5px] font-mono uppercase tracking-wide text-muted mb-1.5">
          Veredicto gobernado
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Pill text={label} tone={labelTone(label)} />
          <span className="text-[12px] text-bone-dim uppercase">{rec?.capital_action || '—'}</span>
          {rec?.confidence && <span className="text-[12px] text-muted">conf. {rec.confidence}</span>}
        </div>
        {qualifiers && (
          <div className="text-[11px] text-muted mt-2 leading-snug break-words">{qualifiers}</div>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] font-mono uppercase tracking-wide text-muted mb-1.5">Calidad</div>
        <QualityDots gates={detail.quality_gates} />
      </div>
      {detail.thesis_summary && (
        <div className="md:col-span-2">
          <div className="text-[10.5px] font-mono uppercase tracking-wide text-muted mb-1">Tesis</div>
          <p className="text-[13px] text-bone-dim leading-relaxed">{detail.thesis_summary}</p>
        </div>
      )}
      {detail.limitations?.length > 0 && (
        <div className="md:col-span-2">
          <div className="text-[10.5px] font-mono uppercase tracking-wide text-muted mb-1">
            Limitaciones
          </div>
          <ul className="list-disc pl-5 text-[12px] text-muted leading-relaxed">
            {detail.limitations.slice(0, 4).map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ---------- candidate row ---------- */

function CandidateRow({
  run,
  detail,
  expanded,
  onToggle,
  onPinChange,
}: {
  run: RunSummary
  detail?: RunDetail
  expanded: boolean
  onToggle: () => void
  onPinChange: () => void
}) {
  const [pinned, setPinned] = useState(isPinned(run.run_id))
  const rec = detail?.recommendation
  const label = cleanLabel(run.recommendation || rec?.rating)
  const score = detail ? qualityScore(detail.quality_gates) : null
  const status = deriveStatus(label, rec, detail?.quality_gates)
  const note = detail?.thesis_summary || rec?.public_label_basis || ''

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (pinned) unpin(run.run_id)
    else pin(run.run_id, run.ticker)
    setPinned(!pinned)
    onPinChange()
  }

  return (
    <>
      <tr
        onClick={onToggle}
        className="border-t border-line hover:bg-ink-3 transition-colors cursor-pointer"
      >
        <td className="py-3.5 pl-4 pr-4 align-middle">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-ink-3 border border-line text-bone font-display text-[16px]">
              {(run.ticker || '?').slice(0, 1)}
            </span>
            <div className="min-w-0">
              <div className="text-bone text-[14px] font-medium truncate">
                {run.company_name || run.ticker}
              </div>
              <div className="font-mono text-[11px] text-muted uppercase">{run.ticker}</div>
            </div>
          </div>
        </td>
        <td className="py-3.5 pr-4 align-middle">
          <Pill text={label} tone={labelTone(label)} />
        </td>
        <td className="py-3.5 pr-4 align-middle">
          <span className="font-display text-[20px]" style={{ color: scoreColor(score) }}>
            {score ?? '—'}
          </span>
        </td>
        <td className="py-3.5 pr-4 align-middle">
          <Pill
            text={detail ? status.text : '…'}
            tone={status.tone}
            subtle={status.text !== 'WAITING DATA'}
          />
        </td>
        <td className="py-3.5 pr-4 align-middle max-w-[300px]">
          <span className="italic text-muted text-[12.5px] block truncate">
            {note ? note : detail ? '—' : 'cargando…'}
          </span>
        </td>
        <td className="py-3.5 pr-4 align-middle">
          <div className="flex items-center gap-3 text-muted">
            <a
              href={reportUrl(run.run_id, 'pdf')}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Memo PDF"
              className="hover:text-green"
            >
              <DocIcon />
            </a>
            <a
              href={reportUrl(run.run_id, 'json')}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Packet JSON"
              className="hover:text-green"
            >
              <CodeIcon />
            </a>
            <button
              type="button"
              onClick={togglePin}
              title={pinned ? 'Quitar del bench' : 'Pin al bench'}
              className="text-[13px]"
              style={{ color: pinned ? 'var(--green)' : 'var(--muted)' }}
            >
              {pinned ? '★' : '☆'}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-ink-2">
          <td colSpan={6} className="px-6 pb-4">
            {detail ? (
              <ExpandedDetail detail={detail} />
            ) : (
              <span className="text-muted text-[12px]">Cargando detalle…</span>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

/* ---------- sections ---------- */

interface AuthNavState {
  configured: boolean
  loading: boolean
  email: string | null
}

function NavBar({
  light,
  toggleTheme,
  auth,
  onSignOut,
}: {
  light: boolean
  toggleTheme: () => void
  auth?: AuthNavState
  onSignOut?: () => void
}) {
  const profileRef = useRef<HTMLDivElement | null>(null)
  const [profileOpen, setProfileOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('profile') === '1'
  })
  const profileEmail = auth?.email?.trim() || null

  useEffect(() => {
    if (!profileOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Node && !profileRef.current?.contains(target)) {
        setProfileOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileOpen])

  return (
    <header className="nav">
      <div className="nav__inner">
        <a className="nav__brand" href="/">
          <span className="nav__dot" aria-hidden="true"></span>
          <span className="nav__logo">DeepFlow</span>
          <span className="nav__sep" aria-hidden="true">{'\u00b7'}</span>
          <span className="nav__by">by Denario</span>
        </a>
        <nav className="nav__links" aria-label="DeepFlow">
          <a href="/#producto">Producto</a>
          <a href="/#proceso">{'C\u00f3mo funciona'}</a>
          <a href="/#muestra">Muestra</a>
        </nav>
        <div className="nav__actions">
          <a href="/app/" className="btn btn--small">
            {'Tracker \u2192'}
          </a>
          <a href="/#contacto" className="btn btn--small btn--nav-cta">
            {'Hablemos \u2192'}
          </a>
          <div className="nav__profile" ref={profileRef}>
            <button
              type="button"
              className="profile-button"
              onClick={() => setProfileOpen((value) => !value)}
              aria-label="Ver perfil"
              aria-controls="nav-profile-menu"
              aria-expanded={profileOpen}
              title="Ver perfil"
            >
              <UserIcon />
            </button>
            {profileOpen && (
              <div className="profile-menu" id="nav-profile-menu" role="dialog" aria-label="Perfil">
                <span className="profile-menu__eyebrow">Perfil</span>
                <strong>{profileEmail ?? (auth?.loading ? 'Cargando...' : 'Invitado')}</strong>
                <span>
                  {profileEmail
                    ? 'Sesion Google activa'
                    : 'Inicia sesion para ver tu perfil de Denario.'}
                </span>
                {profileEmail && onSignOut ? (
                  <button
                    type="button"
                    className="profile-menu__action"
                    onClick={() => {
                      setProfileOpen(false)
                      onSignOut()
                    }}
                  >
                    Cerrar sesion
                  </button>
                ) : (
                  <a className="profile-menu__action" href="/app/">
                    Abrir tracker
                  </a>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={light ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
          >
            <ThemeIcon light={light} />
          </button>
        </div>
      </div>
    </header>
  )
}

function ResearchSearch({
  q,
  setQ,
  placeholder = 'Search research...',
}: {
  q: string
  setQ: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="mt-6 flex justify-center md:justify-end">
      <label className="relative block w-full max-w-[320px]">
        <span className="sr-only">Search research</span>
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-pill border border-line-strong bg-ink-2 py-2 pl-9 pr-4 text-[13px] text-bone outline-none transition-colors placeholder:text-muted focus:border-green"
        />
      </label>
    </div>
  )
}

function Hero() {
  return (
    <section className="text-center pt-14 pb-10">
      <span className="inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-green border border-line-strong rounded-pill px-3 py-1">
        Operational Research Hub
      </span>
      <h1 className="font-display text-[clamp(40px,6vw,72px)] text-bone leading-[1.04] mt-5">
        Research <span className="text-green">Tracker</span>
      </h1>
      <p className="text-[15px] text-bone-dim max-w-[560px] mx-auto mt-4 leading-relaxed">
        Plataforma de análisis institucional para seguimiento de activos. Precisión técnica integrada
        en un entorno editorial de alta velocidad.
      </p>
    </section>
  )
}

type Stats = { total: number; ratio: string; pending: number; coverage: number }
type StatTile = { label: string; value: string; color: string; sub?: string }

function computeStats(runs: RunSummary[]): Stats {
  const L = (r: RunSummary) => (r.recommendation || '').toUpperCase()
  const total = runs.length
  const buy = runs.filter((r) => L(r).includes('BUY')).length
  const hold = runs.filter((r) => L(r) === 'HOLD').length
  const pending = runs.filter((r) => {
    const l = L(r)
    return l.includes('PROVISIONAL') || l.includes('UNCERTAIN') || l.includes('WATCHLIST')
  }).length
  const benched = runs.filter((r) => {
    const l = L(r)
    return l.includes('MODEL_COVERAGE') || l.includes('UNSUPPORTED')
  }).length
  const coverage = total ? Math.round((1 - benched / total) * 1000) / 10 : 0
  const ratio = buy > 0 ? `1 : ${(hold / buy).toFixed(1)}` : `${buy} : ${hold}`
  return { total, ratio, pending, coverage }
}

function internalStatItems(stats: Stats): StatTile[] {
  return [
    { label: 'Total Analyses', value: stats.total.toLocaleString('en-US'), color: 'var(--bone)' },
    { label: 'Buy/Hold Ratio', value: stats.ratio, color: 'var(--bone)' },
    {
      label: 'Pending Review',
      value: String(stats.pending),
      color: 'var(--amber)',
      sub: stats.pending > 0 ? 'requiere revisión' : undefined,
    },
    { label: 'Model Coverage', value: `${stats.coverage}%`, color: 'var(--green)' },
  ]
}

function StatsBar({ items }: { items: StatTile[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 rounded-xl border border-line bg-ink-2 overflow-hidden">
      {items.map((it, i) => (
        <div key={i} className={i > 0 ? 'px-6 py-5 md:border-l border-line' : 'px-6 py-5'}>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{it.label}</div>
          <div className="mt-2 font-display text-[30px] leading-none" style={{ color: it.color }}>
            {it.value}
            {it.sub && (
              <span className="ml-2 font-body text-[11px] text-amber align-middle">{it.sub}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function CandidatesTable({
  runs,
  details,
  expandedId,
  setExpandedId,
  onPinChange,
}: {
  runs: RunSummary[]
  details: Record<string, RunDetail>
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  onPinChange: () => void
}) {
  return (
    <div className="mt-6 rounded-xl border border-line bg-ink-2 overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="text-muted font-mono text-[10px] uppercase tracking-[0.1em] border-b border-line">
            <th className="py-3 pl-4 pr-4 font-normal">Candidate</th>
            <th className="py-3 pr-4 font-normal">Verdict</th>
            <th className="py-3 pr-4 font-normal">Quality</th>
            <th className="py-3 pr-4 font-normal">Status</th>
            <th className="py-3 pr-4 font-normal">Analyst Notes</th>
            <th className="py-3 pr-4 font-normal">Artifacts</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <CandidateRow
              key={r.run_id}
              run={r}
              detail={details[r.run_id]}
              expanded={expandedId === r.run_id}
              onToggle={() => setExpandedId(expandedId === r.run_id ? null : r.run_id)}
              onPinChange={onPinChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FeaturedMemo({ featured }: { featured: { r: RunSummary; d: RunDetail } | null }) {
  if (!featured) {
    return (
      <div className="rounded-xl border border-line bg-ink-2 p-6 text-muted text-[13px]">
        Sin análisis destacado todavía.
      </div>
    )
  }
  const { r, d } = featured
  const quote = (d.thesis_summary || '').slice(0, 240)
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        Internal memo · {r.ticker}
      </div>
      <h3 className="font-display text-[26px] text-bone mt-2 leading-tight">
        {r.company_name || r.ticker}
      </h3>
      <p className="mt-3 text-[14px] italic text-bone-dim leading-relaxed border-l-2 border-line-strong pl-4">
        “{quote}…”
      </p>
      <div className="flex items-center justify-between mt-5">
        <div>
          <div className="text-[13px] text-bone">DeepFlow Engine</div>
          <div className="text-[11px] text-muted">Recomendación determinística</div>
        </div>
        <a
          href={reportUrl(r.run_id, 'html')}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] uppercase tracking-wide text-green hover:underline"
        >
          Read full analysis →
        </a>
      </div>
    </div>
  )
}

function WatchlistCard({ pins, onPinChange }: { pins: Pin[]; onPinChange: () => void }) {
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-green">
        Watchlist · {pins.length}
      </div>
      {pins.length === 0 ? (
        <p className="text-[12.5px] text-muted mt-2 leading-relaxed">
          Pin un candidato (★) para sumarlo al bench.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {pins.slice(0, 6).map((p) => (
            <li key={p.run_id} className="flex items-center justify-between">
              <span className="font-mono text-[13px] text-bone">{p.ticker}</span>
              <button
                type="button"
                onClick={() => {
                  unpin(p.run_id)
                  onPinChange()
                }}
                className="text-[11px] text-muted hover:text-red font-mono"
              >
                quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AuditCard({ stats }: { stats: Stats }) {
  const pass = stats.coverage >= 80
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-5">
      <div className="text-[13px] text-bone font-medium">
        System Audit: {pass ? 'Compliance Pass' : 'Review Needed'}
      </div>
      <div className="text-[11.5px] text-muted mt-1 leading-relaxed">
        Cobertura de modelo {stats.coverage}% · {stats.total} análisis verificados.
      </div>
    </div>
  )
}

function PublicEvidenceAuditCard({ publications }: { publications: PublicPublication[] }) {
  const completePackages = publications.filter(
    (publication) =>
      Boolean(publication.memo_short_url) &&
      Boolean(publication.memo_long_url) &&
      Boolean(publication.memo_full_url),
  ).length
  const status =
    publications.length === 0
      ? 'Awaiting Publications'
      : completePackages === publications.length
        ? 'Complete Evidence'
        : 'Partial Evidence'

  return (
    <div className="rounded-xl border border-line bg-ink-2 p-5">
      <div className="text-[13px] text-bone font-medium">Evidence Audit: {status}</div>
      <div className="text-[11.5px] text-muted mt-1 leading-relaxed">
        {completePackages}/{publications.length} paquetes públicos incluyen resumen, memo y tesis completa.
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="mx-auto max-w-container px-6 py-6 flex items-center justify-between text-[11px] text-muted font-mono uppercase tracking-wide">
        <span>DeepFlow · by Denario</span>
        <span className="hidden sm:flex gap-6">
          <a href="/legal.html#privacidad" className="hover:text-bone">
            Privacy
          </a>
          <a href="/legal.html#terminos" className="hover:text-bone">
            Terms
          </a>
          <a href="/legal.html#uso-aceptable" className="hover:text-bone">
            Guidelines
          </a>
        </span>
      </div>
    </footer>
  )
}

function publicationStatusLabel(value: string): string {
  const status = value.toLowerCase()
  if (status === 'full_deepflow_investment_memo') return 'FULL MEMO'
  if (status === 'full_with_disclosed_limitations') return 'FULL + LIMITATIONS'
  return value.replace(/_/g, ' ').toUpperCase()
}

function publicStatItems(publications: PublicPublication[]): StatTile[] {
  const sorted = [...publications].sort(
    (a, b) => new Date(b.published_at).valueOf() - new Date(a.published_at).valueOf(),
  )
  const latest = sorted[0] ?? null
  const completePackages = publications.filter(
    (publication) =>
      Boolean(publication.memo_short_url) &&
      Boolean(publication.memo_long_url) &&
      Boolean(publication.memo_full_url),
  ).length

  return [
    {
      label: 'Public Theses',
      value: publications.length.toLocaleString('en-US'),
      color: 'var(--bone)',
      sub: publications.length > 0 ? 'curated feed' : undefined,
    },
    {
      label: 'Latest Memo',
      value: latest?.ticker ?? 'n/d',
      color: 'var(--bone)',
      sub: latest ? publicDate(latest.published_at) : 'sin publicaciones',
    },
    {
      label: 'Evidence Packages',
      value: publications.length > 0 ? `${completePackages}/${publications.length}` : '0',
      color: 'var(--green)',
      sub: publications.length > 0 ? 'complete' : undefined,
    },
    {
      label: 'Private Thesis',
      value: '321',
      color: 'var(--bone)',
    },
  ]
}

function publicDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return 'n/d'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

function formatPrice(value: number | null | undefined, currency: string | null | undefined): string {
  if (value == null) return 'n/d'
  const prefix = (!currency || currency === 'USD') ? '$' : `${currency} `
  return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function PriceChange({ memoPrice, livePrice }: { memoPrice: number | null; livePrice: number | null | undefined }) {
  if (memoPrice == null || livePrice == null) {
    return <span className="font-mono text-[12px] text-muted">n/d</span>
  }
  const pct = ((livePrice - memoPrice) / memoPrice) * 100
  const sign = pct > 0 ? '+' : ''
  const color = pct > 0 ? 'var(--green)' : pct < 0 ? 'var(--red)' : 'var(--muted)'
  return (
    <span className="font-mono text-[12px] font-medium" style={{ color }}>
      {sign}{pct.toFixed(2)}%
    </span>
  )
}

function PublicPublicationRow({
  publication,
  livePrices,
}: {
  publication: PublicPublication
  livePrices: Record<string, number | null>
}) {
  const livePrice = livePrices[publication.ticker] ?? null
  return (
    <tr className="border-t border-line hover:bg-ink-3 transition-colors">
      <td className="py-3.5 pl-4 pr-4 align-middle">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-ink-3 border border-line text-bone font-display text-[16px]">
            {(publication.ticker || '?').slice(0, 1)}
          </span>
          <div className="min-w-0">
            <div className="text-bone text-[14px] font-medium truncate">
              {publication.company_name || publication.ticker}
            </div>
            <div className="font-mono text-[11px] text-muted uppercase">{publication.ticker}</div>
          </div>
        </div>
      </td>
      <td className="py-3.5 pr-4 align-middle">
        <Pill text={publicationStatusLabel(publication.publishability_status)} tone="green" />
      </td>
      <td className="py-3.5 pr-4 align-middle">
        <span className="text-[12.5px] text-bone-dim">{publicDate(publication.published_at)}</span>
      </td>
      <td className="py-3.5 pr-4 align-middle max-w-[320px]">
        <span className="font-mono text-[11px] text-muted block truncate">
          {publication.public_slug}
        </span>
      </td>
      <td className="py-3.5 pr-4 align-middle whitespace-nowrap">
        <span className="font-mono text-[12px] text-bone-dim">
          {formatPrice(publication.memo_price, publication.memo_price_currency)}
        </span>
      </td>
      <td className="py-3.5 pr-4 align-middle whitespace-nowrap">
        <span className="font-mono text-[12px] text-bone-dim block">
          {formatPrice(livePrice, publication.memo_price_currency)}
        </span>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
          Yahoo Finance
        </span>
      </td>
      <td className="py-3.5 pr-4 align-middle whitespace-nowrap">
        <PriceChange memoPrice={publication.memo_price} livePrice={livePrice} />
      </td>
      <td className="py-3.5 pr-4 align-middle">
        <div className="flex items-center gap-3 text-muted">
          <a
            href={publication.memo_short_url}
            target="_blank"
            rel="noreferrer"
            title="Resumen"
            className="inline-flex items-center gap-1.5 hover:text-green text-[12px]"
          >
            <DocIcon />
            Resumen
          </a>
          <a
            href={publication.memo_long_url}
            target="_blank"
            rel="noreferrer"
            title="Memo"
            className="inline-flex items-center gap-1.5 hover:text-green text-[12px]"
          >
            <DocIcon />
            Memo
          </a>
          {publication.memo_full_url && (
            <a
              href={publication.memo_full_url}
              target="_blank"
              rel="noreferrer"
              title="Tesis completa"
              className="inline-flex items-center gap-1.5 hover:text-green text-[12px]"
            >
              <DocIcon />
              Tesis completa
            </a>
          )}
        </div>
      </td>
    </tr>
  )
}

function PublicPublicationsTable({
  publications,
  livePrices,
}: {
  publications: PublicPublication[]
  livePrices: Record<string, number | null>
}) {
  return (
    <div className="mt-6 rounded-xl border border-line bg-ink-2 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-muted font-mono text-[10px] uppercase tracking-[0.1em] border-b border-line">
            <th className="py-3 pl-4 pr-4 font-normal">Research</th>
            <th className="py-3 pr-4 font-normal">Status</th>
            <th className="py-3 pr-4 font-normal">Published</th>
            <th className="py-3 pr-4 font-normal">Evidence path</th>
            <th className="py-3 pr-4 font-normal">Memo price</th>
            <th className="py-3 pr-4 font-normal">Live price</th>
            <th className="py-3 pr-4 font-normal">Since thesis</th>
            <th className="py-3 pr-4 font-normal">Documentos</th>
          </tr>
        </thead>
        <tbody>
          {publications.map((publication) => (
            <PublicPublicationRow
              key={publication.run_id}
              publication={publication}
              livePrices={livePrices}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PublicFeaturedMemo({
  publication,
  livePrice,
}: {
  publication: PublicPublication | null
  livePrice: number | null | undefined
}) {
  if (!publication) {
    return (
      <div className="rounded-xl border border-line bg-ink-2 p-6 text-muted text-[13px]">
        Sin publicaciones todavia.
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        Published memo · {publication.ticker}
      </div>
      <h3 className="font-display text-[26px] text-bone mt-2 leading-tight">
        {publication.company_name || publication.ticker}
      </h3>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={publication.memo_short_url}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] uppercase tracking-wide text-green hover:underline"
        >
          Resumen
        </a>
        <a
          href={publication.memo_long_url}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] uppercase tracking-wide text-green hover:underline"
        >
          Memo
        </a>
        {publication.memo_full_url && (
          <a
            href={publication.memo_full_url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] uppercase tracking-wide text-green hover:underline"
          >
            Tesis completa
          </a>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <div className="min-w-[190px] rounded-lg border border-line bg-ink-3 px-4 py-3 text-right">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
            Live price · Yahoo Finance
          </div>
          <div className="mt-1 font-display text-[22px] leading-none text-bone">
            {formatPrice(livePrice, publication.memo_price_currency)}
          </div>
          <div className="mt-2 flex items-center justify-end gap-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
              Since thesis
            </span>
            <PriceChange memoPrice={publication.memo_price} livePrice={livePrice} />
          </div>
        </div>
      </div>
    </div>
  )
}

function PublicEvidenceView({
  publications,
  livePrices,
  error,
  q,
  setQ,
  light,
  toggleTheme,
  auth,
  onSignOut,
  authError,
}: {
  publications: PublicPublication[] | null
  livePrices: Record<string, number | null>
  error: string | null
  q: string
  setQ: (value: string) => void
  light: boolean
  toggleTheme: () => void
  auth: AuthNavState
  onSignOut: () => void
  authError: string | null
}) {
  const filtered = useMemo(() => {
    if (!publications) return []
    const needle = q.trim().toUpperCase()
    if (!needle) return publications
    return publications.filter(
      (publication) =>
        publication.ticker.toUpperCase().includes(needle) ||
        (publication.company_name || '').toUpperCase().includes(needle),
    )
  }, [publications, q])
  const publicStats = useMemo(
    () => publicStatItems(publications || []),
    [publications],
  )
  const featured = filtered[0] ?? null
  const featuredLivePrice = featured ? livePrices[featured.ticker] : null

  return (
    <div className="min-h-screen">
      <NavBar light={light} toggleTheme={toggleTheme} auth={auth} onSignOut={onSignOut} />
      <main className="mx-auto max-w-container px-6">
        <Hero />
        <StatsBar items={publicStats} />
        <ResearchSearch q={q} setQ={setQ} />

        {authError && <p className="text-red text-[13px] mt-6">Auth error: {authError}</p>}
        {error && <p className="text-red text-[13px] mt-6">No se pudo cargar el feed: {error}</p>}
        {!publications && !error && (
          <p className="text-muted text-[13px] mt-6">Cargando publicaciones...</p>
        )}
        {publications && filtered.length === 0 && !error && (
          <p className="text-muted text-[13px] mt-6">No hay publicaciones todavia.</p>
        )}

        {filtered.length > 0 && (
          <PublicPublicationsTable publications={filtered} livePrices={livePrices} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-10">
          <PublicFeaturedMemo publication={featured} livePrice={featuredLivePrice} />
          <PublicEvidenceAuditCard publications={publications || []} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

function AuthGate({
  light,
  toggleTheme,
  auth,
  authError,
  onSignIn,
  eyebrow = 'Denario operator access',
  title = 'Sign in to continue',
  body = 'Internal research views use Supabase Auth with Google sign-in.',
  buttonLabel = 'Sign in with Google',
}: {
  light: boolean
  toggleTheme: () => void
  auth: AuthNavState
  authError: string | null
  onSignIn: () => void
  eyebrow?: string
  title?: string
  body?: string
  buttonLabel?: string
}) {
  return (
    <div className="min-h-screen">
      <NavBar light={light} toggleTheme={toggleTheme} auth={auth} />
      <main className="mx-auto max-w-container px-6">
        <section className="pt-24 max-w-[560px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-green">
            {eyebrow}
          </span>
          <h1 className="font-display text-[44px] leading-tight text-bone mt-4">
            {title}
          </h1>
          <p className="text-[14px] text-bone-dim leading-relaxed mt-4">
            {body}
          </p>
          <button
            type="button"
            onClick={onSignIn}
            disabled={auth.loading}
            className="mt-7 rounded-md border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-bone hover:border-green disabled:cursor-wait disabled:text-muted"
          >
            {auth.loading ? 'Checking...' : buttonLabel}
          </button>
          {authError && <p className="text-red text-[13px] mt-5">Auth error: {authError}</p>}
        </section>
      </main>
      <Footer />
    </div>
  )
}

/* ---------- app ---------- */

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export default function App() {
  const publicMode = hasPublicationsFeed
  const requiresAuth = supabaseAuthConfig.enabled
  const [runs, setRuns] = useState<RunSummary[] | null>(null)
  const [details, setDetails] = useState<Record<string, RunDetail>>({})
  const [publications, setPublications] = useState<PublicPublication[] | null>(null)
  const [publicationError, setPublicationError] = useState<string | null>(null)
  const [livePrices, setLivePrices] = useState<Record<string, number | null>>({})
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [light, setLight] = useState(document.body.classList.contains('light'))
  const [pins, setPins] = useState<Pin[]>(() => getPins())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)
  const [authLoading, setAuthLoading] = useState(supabaseAuthConfig.enabled)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabaseAuthConfig.enabled) return

    let cancelled = false
    getInitialAuthSession()
      .then((session) => {
        if (!cancelled) setAuthSession(session)
      })
      .catch((e) => {
        if (!cancelled) setAuthError(errorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false)
      })

    const unsubscribe = onAuthSessionChange((session) => {
      if (cancelled) return
      setAuthSession(session)
      setAuthLoading(false)
      if (session) setAuthError(null)
      else {
        setRuns(null)
        setDetails({})
        setPublications(null)
        setLivePrices({})
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    setApiAuthTokenProvider(() => authSession?.access_token ?? null)
    return () => setApiAuthTokenProvider(null)
  }, [authSession])

  useEffect(() => {
    if (publicMode) return
    if (requiresAuth && (authLoading || !authSession)) return
    fetchRuns()
      .then((r) => setRuns(r.filter((x) => x.workflow_type === 'deepflow')))
      .catch((e) => setError(String(e)))
  }, [publicMode, requiresAuth, authLoading, authSession])

  useEffect(() => {
    if (!publicMode) return
    if (requiresAuth && (authLoading || !authSession)) return
    fetchPublications()
      .then((items) => setPublications(items))
      .catch((e) => setPublicationError(String(e)))
  }, [publicMode, requiresAuth, authLoading, authSession])

  useEffect(() => {
    if (!publicMode || !publications || publications.length === 0) return
    const tickers = [...new Set(publications.map((p) => p.ticker).filter(Boolean))]
    fetchLivePrices(tickers).then(setLivePrices).catch(() => {})
  }, [publicMode, publications])

  // Throttled detail loader (max 4 concurrent) — fills quality/status/notes without an N+1 burst.
  useEffect(() => {
    if (publicMode) return
    if (requiresAuth && !authSession) return
    if (!runs) return
    let cancelled = false
    const queue = [...runs]
    let active = 0
    const CONC = 4
    const pump = () => {
      if (cancelled) return
      while (active < CONC && queue.length) {
        const r = queue.shift()!
        active++
        fetchRun(r.run_id)
          .then((d) => {
            if (!cancelled) setDetails((prev) => (prev[r.run_id] ? prev : { ...prev, [r.run_id]: d }))
          })
          .catch(() => {})
          .finally(() => {
            active--
            pump()
          })
      }
    }
    pump()
    return () => {
      cancelled = true
    }
  }, [publicMode, requiresAuth, runs, authSession])

  const stats = useMemo(() => computeStats(runs || []), [runs])
  const filtered = useMemo(() => {
    if (!runs) return []
    const needle = q.trim().toUpperCase()
    if (!needle) return runs
    return runs.filter(
      (r) => r.ticker.includes(needle) || (r.company_name || '').toUpperCase().includes(needle),
    )
  }, [runs, q])
  const featured = useMemo<{ r: RunSummary; d: RunDetail } | null>(() => {
    if (!runs) return null
    const withThesis = runs
      .map((r) => ({ r, d: details[r.run_id] }))
      .filter((x) => x.d?.thesis_summary)
    if (withThesis.length === 0) return null
    const buy = withThesis.find((x) => (x.r.recommendation || '').toUpperCase().includes('BUY'))
    return (buy || withThesis[0]) as { r: RunSummary; d: RunDetail }
  }, [runs, details])
  const refreshPins = () => setPins(getPins())
  const auth = useMemo<AuthNavState>(() => ({
    configured: requiresAuth,
    loading: authLoading,
    email: authSession?.user.email ?? null,
  }), [requiresAuth, authLoading, authSession])

  const handleSignIn = () => {
    setAuthError(null)
    void signInWithGoogle().catch((e) => setAuthError(errorMessage(e)))
  }

  const handleSignOut = () => {
    setAuthError(null)
    void signOut().catch((e) => setAuthError(errorMessage(e)))
  }

  const toggleTheme = () => {
    const next = !light
    document.body.classList.toggle('light', next)
    localStorage.setItem('df-theme', next ? 'light' : 'dark')
    setLight(next)
  }

  if (publicMode && requiresAuth && (authLoading || !authSession)) {
    return (
      <AuthGate
        light={light}
        toggleTheme={toggleTheme}
        auth={auth}
        authError={authError}
        onSignIn={handleSignIn}
        eyebrow="Free research access"
        title="Log in to view Research Tracker"
        body="Use Google to create a free Denario session before reading the tracker and memos. No payment is required."
        buttonLabel="Continue with Google"
      />
    )
  }

  if (publicMode) {
    return (
      <PublicEvidenceView
        publications={publications}
        livePrices={livePrices}
        error={publicationError}
        q={q}
        setQ={setQ}
        light={light}
        toggleTheme={toggleTheme}
        auth={auth}
        onSignOut={handleSignOut}
        authError={authError}
      />
    )
  }

  if (requiresAuth && (authLoading || !authSession)) {
    return (
      <AuthGate
        light={light}
        toggleTheme={toggleTheme}
        auth={auth}
        authError={authError}
        onSignIn={handleSignIn}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <NavBar light={light} toggleTheme={toggleTheme} auth={auth} onSignOut={handleSignOut} />
      <main className="mx-auto max-w-container px-6">
        <Hero />
        <StatsBar items={internalStatItems(stats)} />
        <ResearchSearch q={q} setQ={setQ} />

        {authError && <p className="text-red text-[13px] mt-6">Auth error: {authError}</p>}
        {error && (
          <p className="text-red text-[13px] mt-6">
            No se pudo cargar /api/runs: {error}. ¿Está corriendo el backend en :8000?
          </p>
        )}
        {!runs && !error && <p className="text-muted text-[13px] mt-6">Cargando runs…</p>}
        {runs && filtered.length === 0 && !error && (
          <p className="text-muted text-[13px] mt-6">No hay runs de DeepFlow todavía.</p>
        )}

        {filtered.length > 0 && (
          <CandidatesTable
            runs={filtered}
            details={details}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onPinChange={refreshPins}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-10">
          <FeaturedMemo featured={featured} />
          <div className="flex flex-col gap-4">
            <WatchlistCard pins={pins} onPinChange={refreshPins} />
            <AuditCard stats={stats} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
