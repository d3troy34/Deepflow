import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  deletePublication,
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
  formatPublicationDate,
  formatPublicationPrice,
  publicationDocumentLinks,
} from './lib/publicationPresentation'
import {
  fetchAccountProfile,
  getInitialAuthSession,
  onAuthSessionChange,
  signOut,
  syncApiAuthCookie,
  supabaseAuthConfig,
  updateAccountProfile,
  validateUsername,
  type AccountProfile,
  type AccountProfileUpdate,
  type AuthSession,
  type UserEntitlement,
} from './lib/supabase'
import { loginUnavailableUrl } from './lib/authConfig'
import { getPins, isPinned, pin, unpin, type Pin } from './lib/watchlist'

/* ---------- helpers ---------- */

const AXES = [
  { key: 'data', match: 'data' },
  { key: 'model', match: 'model' },
  { key: 'memo', match: 'memo' },
  { key: 'news', match: 'news' },
]

const LOGIN_UNAVAILABLE_HREF = loginUnavailableUrl(import.meta.env.BASE_URL)
const LANG_STORAGE_KEY = 'df-lang'

type AppLanguage = 'es' | 'en'

const APP_TEXT = {
  es: {
    'axis.data': 'datos',
    'axis.model': 'modelo',
    'axis.memo': 'memo',
    'axis.news': 'news',
    'nav.product': 'Producto',
    'nav.process': 'Como funciona',
    'nav.sample': 'Muestra',
    'nav.roadmap': 'Roadmap',
    'nav.tracker': 'Tracker ->',
    'nav.contact': 'Hablemos ->',
    'nav.profile': 'Ver perfil',
    'nav.themeDark': 'Cambiar a tema oscuro',
    'nav.themeLight': 'Cambiar a tema claro',
    'nav.language': 'Cambiar idioma',
    'profile.guest': 'Invitado',
    'profile.comingSoon': 'Proximamente',
    'profile.title': 'Perfil',
    'profile.username': 'Usuario',
    'profile.displayName': 'Nombre',
    'profile.usernamePlaceholder': 'tu_usuario',
    'profile.displayNamePlaceholder': 'Nombre visible',
    'profile.credits': 'Creditos',
    'profile.access': 'Acceso',
    'profile.saved': 'Perfil guardado.',
    'profile.saving': 'Guardando...',
    'profile.save': 'Guardar',
    'profile.signOut': 'Cerrar sesion',
    'profile.loading': 'Cargando...',
    'profile.accountSoon': 'El acceso con cuenta estara disponible pronto.',
    'profile.viewSoon': 'Ver proximamente',
    'hero.eyebrow': 'Operational Research Hub',
    'hero.titleA': 'Research',
    'hero.titleB': 'Tracker',
    'hero.body': 'Plataforma de analisis institucional para seguimiento de activos. Precision tecnica integrada en un entorno editorial de alta velocidad.',
    'search.label': 'Buscar research',
    'search.placeholder': 'Buscar research...',
    'detail.verdict': 'Veredicto gobernado',
    'detail.quality': 'Calidad',
    'detail.thesis': 'Tesis',
    'detail.limitations': 'Limitaciones',
    'detail.confidence': 'conf.',
    'row.loading': 'cargando...',
    'row.loadingDetail': 'Cargando detalle...',
    'row.unpin': 'Quitar del bench',
    'row.pin': 'Pin al bench',
    'table.candidate': 'Candidato',
    'table.verdict': 'Veredicto',
    'table.quality': 'Calidad',
    'table.status': 'Estado',
    'table.notes': 'Notas del analista',
    'table.artifacts': 'Artifacts',
    'stats.totalAnalyses': 'Analisis totales',
    'stats.buyHoldRatio': 'Ratio buy/hold',
    'stats.pendingReview': 'Revision pendiente',
    'stats.reviewRequired': 'requiere revision',
    'stats.modelCoverage': 'Cobertura del modelo',
    'featured.empty': 'Sin analisis destacado todavia.',
    'featured.kicker': 'Internal memo -',
    'featured.engine': 'DeepFlow Engine',
    'featured.recommendation': 'Recomendacion deterministica',
    'featured.read': 'Leer analisis completo ->',
    'watchlist.empty': 'Pin un candidato (*) para sumarlo al bench.',
    'watchlist.remove': 'quitar',
    'audit.pass': 'Cumplimiento aprobado',
    'audit.review': 'Revision necesaria',
    'audit.coverage': 'Cobertura de modelo',
    'audit.verified': 'analisis verificados.',
    'public.publicTheses': 'Tesis publicas',
    'public.latestMemo': 'Ultimo memo',
    'public.noPublications': 'sin publicaciones',
    'public.evidencePackages': 'Paquetes de evidencia',
    'public.privateThesis': 'Tesis privada',
    'public.curatedFeed': 'feed curado',
    'public.complete': 'completo',
    'public.ticker': 'Ticker',
    'public.datePublished': 'Fecha de publicacion',
    'public.inceptionPrice': 'Precio inicial',
    'public.livePrice': 'Precio actual',
    'public.change': '% cambio',
    'public.documents': 'Documentos',
    'public.delete': 'Eliminar',
    'public.deleting': 'Eliminando...',
    'public.deleteTitle': 'Eliminar memo publicado',
    'public.deleteAria': 'Eliminar',
    'public.empty': 'Sin publicaciones todavia.',
    'public.auditAwaiting': 'Esperando publicaciones',
    'public.auditComplete': 'Evidencia completa',
    'public.auditPartial': 'Evidencia parcial',
    'public.auditLabel': 'Auditoria de evidencia:',
    'public.auditBody': 'paquetes publicos incluyen resumen, memo y tesis completa.',
    'public.feedError': 'No se pudo cargar el feed:',
    'public.deleteError': 'No se pudo eliminar el memo:',
    'public.loading': 'Cargando publicaciones...',
    'public.noRows': 'No hay publicaciones todavia.',
    'doc.summary': 'Resumen',
    'doc.memo': 'Memo',
    'doc.fullThesis': 'Tesis completa',
    'auth.eyebrow': 'Acceso operador Denario',
    'auth.title': 'Login proximamente',
    'auth.body': 'El acceso con cuenta esta temporalmente deshabilitado mientras preparamos el nuevo flujo.',
    'auth.publicEyebrow': 'Acceso gratuito a research',
    'auth.publicBody': 'El acceso con cuenta esta temporalmente deshabilitado. Estamos preparando el nuevo flujo antes de abrir el tracker.',
    'auth.button': 'Ver proximamente',
    'auth.backHome': 'Volver al inicio',
    'app.runsError': 'No se pudo cargar /api/runs:',
    'app.backendHint': 'Esta corriendo el backend en :8000?',
    'app.loadingRuns': 'Cargando runs...',
    'app.noRuns': 'No hay runs de DeepFlow todavia.',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Terminos',
    'footer.guidelines': 'Guias',
    'confirm.deletePrefix': 'Eliminar el memo publicado de',
    'confirm.deleteSuffix': 'Esta accion no se puede deshacer.',
  },
  en: {
    'axis.data': 'data',
    'axis.model': 'model',
    'axis.memo': 'memo',
    'axis.news': 'news',
    'nav.product': 'Product',
    'nav.process': 'How it works',
    'nav.sample': 'Sample',
    'nav.roadmap': 'Roadmap',
    'nav.tracker': 'Tracker ->',
    'nav.contact': 'Talk to us ->',
    'nav.profile': 'View profile',
    'nav.themeDark': 'Switch to dark mode',
    'nav.themeLight': 'Switch to light mode',
    'nav.language': 'Change language',
    'profile.guest': 'Guest',
    'profile.comingSoon': 'Coming soon',
    'profile.title': 'Profile',
    'profile.username': 'Username',
    'profile.displayName': 'Name',
    'profile.usernamePlaceholder': 'your_username',
    'profile.displayNamePlaceholder': 'Display name',
    'profile.credits': 'Credits',
    'profile.access': 'Access',
    'profile.saved': 'Profile saved.',
    'profile.saving': 'Saving...',
    'profile.save': 'Save',
    'profile.signOut': 'Sign out',
    'profile.loading': 'Loading...',
    'profile.accountSoon': 'Account access will be available soon.',
    'profile.viewSoon': 'View coming soon',
    'hero.eyebrow': 'Operational Research Hub',
    'hero.titleA': 'Research',
    'hero.titleB': 'Tracker',
    'hero.body': 'Research platform for institutional asset monitoring. Technical precision integrated into a high-speed editorial environment.',
    'search.label': 'Search research',
    'search.placeholder': 'Search research...',
    'detail.verdict': 'Governed verdict',
    'detail.quality': 'Quality',
    'detail.thesis': 'Thesis',
    'detail.limitations': 'Limitations',
    'detail.confidence': 'conf.',
    'row.loading': 'loading...',
    'row.loadingDetail': 'Loading detail...',
    'row.unpin': 'Remove from bench',
    'row.pin': 'Pin to bench',
    'table.candidate': 'Candidate',
    'table.verdict': 'Verdict',
    'table.quality': 'Quality',
    'table.status': 'Status',
    'table.notes': 'Analyst notes',
    'table.artifacts': 'Artifacts',
    'stats.totalAnalyses': 'Total analyses',
    'stats.buyHoldRatio': 'Buy/hold ratio',
    'stats.pendingReview': 'Pending review',
    'stats.reviewRequired': 'review required',
    'stats.modelCoverage': 'Model coverage',
    'featured.empty': 'No featured analysis yet.',
    'featured.kicker': 'Internal memo -',
    'featured.engine': 'DeepFlow Engine',
    'featured.recommendation': 'Deterministic recommendation',
    'featured.read': 'Read full analysis ->',
    'watchlist.empty': 'Pin a candidate (*) to add it to the bench.',
    'watchlist.remove': 'remove',
    'audit.pass': 'Compliance pass',
    'audit.review': 'Review needed',
    'audit.coverage': 'Model coverage',
    'audit.verified': 'verified analyses.',
    'public.publicTheses': 'Public theses',
    'public.latestMemo': 'Latest memo',
    'public.noPublications': 'no publications',
    'public.evidencePackages': 'Evidence packages',
    'public.privateThesis': 'Private thesis',
    'public.curatedFeed': 'curated feed',
    'public.complete': 'complete',
    'public.ticker': 'Ticker',
    'public.datePublished': 'Date published',
    'public.inceptionPrice': 'Inception price',
    'public.livePrice': 'Live price',
    'public.change': '% change',
    'public.documents': 'Documents',
    'public.delete': 'Delete',
    'public.deleting': 'Deleting...',
    'public.deleteTitle': 'Delete published memo',
    'public.deleteAria': 'Delete',
    'public.empty': 'No publications yet.',
    'public.auditAwaiting': 'Awaiting publications',
    'public.auditComplete': 'Complete evidence',
    'public.auditPartial': 'Partial evidence',
    'public.auditLabel': 'Evidence audit:',
    'public.auditBody': 'public packages include summary, memo, and full thesis.',
    'public.feedError': 'Could not load the feed:',
    'public.deleteError': 'Could not delete the memo:',
    'public.loading': 'Loading publications...',
    'public.noRows': 'No publications yet.',
    'doc.summary': 'Summary',
    'doc.memo': 'Memo',
    'doc.fullThesis': 'Full thesis',
    'auth.eyebrow': 'Denario operator access',
    'auth.title': 'Login coming soon',
    'auth.body': 'Account access is temporarily disabled while we prepare the new flow.',
    'auth.publicEyebrow': 'Free research access',
    'auth.publicBody': 'Account access is temporarily disabled. We are preparing the new flow before opening the tracker.',
    'auth.button': 'View coming soon',
    'auth.backHome': 'Back home',
    'app.runsError': 'Could not load /api/runs:',
    'app.backendHint': 'Is the backend running on :8000?',
    'app.loadingRuns': 'Loading runs...',
    'app.noRuns': 'No DeepFlow runs yet.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.guidelines': 'Guidelines',
    'confirm.deletePrefix': 'Delete the published memo for',
    'confirm.deleteSuffix': 'This action cannot be undone.',
  },
} as const

type AppTextKey = keyof typeof APP_TEXT.en

type I18nState = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  t: (key: AppTextKey) => string
}

const I18nContext = createContext<I18nState>({
  language: 'es',
  setLanguage: () => {},
  t: (key) => APP_TEXT.es[key],
})

function normalizeAppLanguage(value?: string | null): AppLanguage {
  return value?.toLowerCase().split(/[-_]/)[0] === 'en' ? 'en' : 'es'
}

function readInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'es'
  const params = new URLSearchParams(window.location.search)
  return normalizeAppLanguage(params.get('lang') || localStorage.getItem(LANG_STORAGE_KEY))
}

function useI18n() {
  return useContext(I18nContext)
}

function translateDocLabel(label: string, t: I18nState['t']) {
  if (label.toLowerCase().includes('resumen')) return t('doc.summary')
  if (label.toLowerCase().includes('tesis')) return t('doc.fullThesis')
  return t('doc.memo')
}

function LanguageToggle() {
  const { language, setLanguage, t } = useI18n()
  return (
    <div className="language-toggle" role="group" aria-label={t('nav.language')}>
      {(['es', 'en'] as const).map((option) => (
        <button
          key={option}
          type="button"
          data-lang-option={option}
          aria-pressed={language === option}
          onClick={() => setLanguage(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

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
  return (s || '-').toUpperCase().split('(')[0].trim()
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

function sessionHasAdminRole(session: AuthSession | null): boolean {
  const metadata = session?.user.app_metadata as unknown
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return false

  const record = metadata as Record<string, unknown>
  if (record.admin === true) return true
  if (typeof record.role === 'string' && record.role.toLowerCase() === 'admin') return true
  if (Array.isArray(record.roles)) {
    return record.roles.some((role) => typeof role === 'string' && role.toLowerCase() === 'admin')
  }
  return false
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

// Derived 0-100 health score from the 4 quality axes (a UI aggregate of the real gate states).
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
  const { t } = useI18n()
  return (
    <span className="inline-flex items-center gap-3">
      {AXES.map((a) => {
        const g = gates.find((x) => (x.gate_id || '').toLowerCase().includes(a.match))
        return (
          <span key={a.key} className="inline-flex items-center gap-1.5" title={g?.status ?? 'n/d'}>
            <span className="h-2 w-2 rounded-full" style={{ background: gateColor(g?.status) }} />
            <span className="text-[10.5px] text-muted uppercase">
              {t(`axis.${a.key}` as AppTextKey)}
            </span>
          </span>
        )
      })}
    </span>
  )
}

function ExpandedDetail({ detail }: { detail: RunDetail }) {
  const { t } = useI18n()
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
          {t('detail.verdict')}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Pill text={label} tone={labelTone(label)} />
          <span className="text-[12px] text-bone-dim uppercase">{rec?.capital_action || '-'}</span>
          {rec?.confidence && (
            <span className="text-[12px] text-muted">
              {t('detail.confidence')} {rec.confidence}
            </span>
          )}
        </div>
        {qualifiers && (
          <div className="text-[11px] text-muted mt-2 leading-snug break-words">{qualifiers}</div>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] font-mono uppercase tracking-wide text-muted mb-1.5">
          {t('detail.quality')}
        </div>
        <QualityDots gates={detail.quality_gates} />
      </div>
      {detail.thesis_summary && (
        <div className="md:col-span-2">
          <div className="text-[10.5px] font-mono uppercase tracking-wide text-muted mb-1">
            {t('detail.thesis')}
          </div>
          <p className="text-[13px] text-bone-dim leading-relaxed">{detail.thesis_summary}</p>
        </div>
      )}
      {detail.limitations?.length > 0 && (
        <div className="md:col-span-2">
          <div className="text-[10.5px] font-mono uppercase tracking-wide text-muted mb-1">
            {t('detail.limitations')}
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
  const { t } = useI18n()
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
            {score ?? '-'}
          </span>
        </td>
        <td className="py-3.5 pr-4 align-middle">
          <Pill
            text={detail ? status.text : '...'}
            tone={status.tone}
            subtle={status.text !== 'WAITING DATA'}
          />
        </td>
        <td className="py-3.5 pr-4 align-middle max-w-[300px]">
          <span className="italic text-muted text-[12.5px] block truncate">
            {note ? note : detail ? '-' : t('row.loading')}
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
              title={pinned ? t('row.unpin') : t('row.pin')}
              className="text-[13px]"
              style={{ color: pinned ? 'var(--green)' : 'var(--muted)' }}
            >
              {pinned ? 'PINNED' : 'PIN'}
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
              <span className="text-muted text-[12px]">{t('row.loadingDetail')}</span>
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
  isAdmin: boolean
}

interface AccountNavState {
  profile: AccountProfile | null
  entitlement: UserEntitlement | null
  loading: boolean
  saving: boolean
  error: string | null
  saved: boolean
}

function NavBar({
  light,
  toggleTheme,
  auth,
  account,
  onProfileSave,
  onSignOut,
}: {
  light: boolean
  toggleTheme: () => void
  auth?: AuthNavState
  account?: AccountNavState
  onProfileSave?: (input: AccountProfileUpdate) => void
  onSignOut?: () => void
}) {
  const { t } = useI18n()
  const profileRef = useRef<HTMLDivElement | null>(null)
  const [profileOpen, setProfileOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('profile') === '1'
  })
  const profileEmail = auth?.email?.trim() || null
  const [profileFormError, setProfileFormError] = useState<string | null>(null)
  const displayName = account?.profile?.display_name || account?.profile?.name || ''
  const accountTitle = displayName || account?.profile?.username || profileEmail || t('profile.guest')
  const rawCreditsLabel = account?.entitlement?.credits_label || t('profile.comingSoon')
  const normalizedCreditsLabel = rawCreditsLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const creditsLabel = /^proximamente$/i.test(normalizedCreditsLabel)
    ? t('profile.comingSoon')
    : rawCreditsLabel
  const planLabel = account?.entitlement?.plan_code || account?.profile?.tier || 'free'
  const profileFormKey = [
    account?.profile?.id ?? 'anon',
    account?.profile?.username ?? '',
    account?.profile?.display_name ?? '',
    account?.profile?.updated_at ?? '',
  ].join(':')

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

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!onProfileSave || !profileEmail) return

    const formData = new FormData(event.currentTarget)
    const username = String(formData.get('username') ?? '').trim().toLowerCase()
    const formDisplayName = String(formData.get('displayName') ?? '')
    const usernameError = validateUsername(username || null)
    if (usernameError) {
      setProfileFormError(usernameError)
      return
    }

    setProfileFormError(null)
    onProfileSave({
      displayName: formDisplayName,
      username,
    })
  }

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
          <a href="/#producto">{t('nav.product')}</a>
          <a href="/#proceso">{t('nav.process')}</a>
          <a href="/#muestra">{t('nav.sample')}</a>
          <a href="/#roadmap">{t('nav.roadmap')}</a>
        </nav>
        <div className="nav__actions">
          <a href="/#contacto" className="btn btn--small btn--nav-cta">
            {t('nav.contact')}
          </a>
          <LanguageToggle />
          <div className="nav__profile" ref={profileRef}>
            <button
              type="button"
              className="profile-button"
              onClick={() => {
                setProfileFormError(null)
                setProfileOpen((value) => !value)
              }}
              aria-label={t('nav.profile')}
              aria-controls="nav-profile-menu"
              aria-expanded={profileOpen}
              title={t('nav.profile')}
            >
              <UserIcon />
            </button>
            {profileOpen && (
              <div className="profile-menu" id="nav-profile-menu" role="dialog" aria-label={t('profile.title')}>
                <span className="profile-menu__eyebrow">{t('profile.title')}</span>
                <strong>{accountTitle}</strong>
                {profileEmail ? (
                  <>
                    <span>{profileEmail}</span>
                    <form
                      key={profileFormKey}
                      className="profile-menu__form"
                      onSubmit={handleProfileSubmit}
                    >
                      <label>
                        <span>{t('profile.username')}</span>
                        <input
                          name="username"
                          defaultValue={account?.profile?.username || ''}
                          placeholder={t('profile.usernamePlaceholder')}
                          autoComplete="username"
                          disabled={account?.loading || account?.saving}
                        />
                      </label>
                      <label>
                        <span>{t('profile.displayName')}</span>
                        <input
                          name="displayName"
                          defaultValue={displayName}
                          placeholder={t('profile.displayNamePlaceholder')}
                          autoComplete="name"
                          disabled={account?.loading || account?.saving}
                        />
                      </label>
                      <div className="profile-menu__grid">
                        <div>
                          <span>{t('profile.credits')}</span>
                          <strong>{creditsLabel}</strong>
                        </div>
                        <div>
                          <span>{t('profile.access')}</span>
                          <strong>{planLabel}</strong>
                        </div>
                      </div>
                      {(profileFormError || account?.error) && (
                        <p className="profile-menu__error">{profileFormError || account?.error}</p>
                      )}
                      {account?.saved && !profileFormError && !account?.error && (
                        <p className="profile-menu__status">{t('profile.saved')}</p>
                      )}
                      <div className="profile-menu__actions">
                        <button
                          type="submit"
                          className="profile-menu__action"
                          disabled={account?.loading || account?.saving}
                        >
                          {account?.saving ? t('profile.saving') : t('profile.save')}
                        </button>
                        {onSignOut && (
                          <button
                            type="button"
                            className="profile-menu__action profile-menu__action--muted"
                            onClick={() => {
                              setProfileOpen(false)
                              onSignOut()
                            }}
                          >
                            {t('profile.signOut')}
                          </button>
                        )}
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <span>
                      {auth?.loading
                        ? t('profile.loading')
                        : t('profile.accountSoon')}
                    </span>
                    <a className="profile-menu__action" href={LOGIN_UNAVAILABLE_HREF}>
                      {t('profile.viewSoon')}
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={light ? t('nav.themeDark') : t('nav.themeLight')}
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
  placeholder,
}: {
  q: string
  setQ: (value: string) => void
  placeholder?: string
}) {
  const { t } = useI18n()
  return (
    <div className="mt-6 flex justify-center md:justify-end">
      <label className="relative block w-full max-w-[320px]">
        <span className="sr-only">{t('search.label')}</span>
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder ?? t('search.placeholder')}
          className="w-full rounded-pill border border-line-strong bg-ink-2 py-2 pl-9 pr-4 text-[13px] text-bone outline-none transition-colors placeholder:text-muted focus:border-green"
        />
      </label>
    </div>
  )
}

function Hero() {
  const { t } = useI18n()
  return (
    <section className="text-center pt-14 pb-10">
      <span className="inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-green border border-line-strong rounded-pill px-3 py-1">
        {t('hero.eyebrow')}
      </span>
      <h1 className="font-display text-[clamp(36px,9vw,72px)] text-bone leading-[1.04] mt-5">
        {t('hero.titleA')} <span className="block text-green sm:inline">{t('hero.titleB')}</span>
      </h1>
      <p className="text-[15px] text-bone-dim w-full max-w-[330px] sm:max-w-[560px] mx-auto mt-4 leading-relaxed">
        {t('hero.body')}
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

function internalStatItems(stats: Stats, t: I18nState['t']): StatTile[] {
  return [
    { label: t('stats.totalAnalyses'), value: stats.total.toLocaleString('en-US'), color: 'var(--bone)' },
    { label: t('stats.buyHoldRatio'), value: stats.ratio, color: 'var(--bone)' },
    {
      label: t('stats.pendingReview'),
      value: String(stats.pending),
      color: 'var(--amber)',
      sub: stats.pending > 0 ? t('stats.reviewRequired') : undefined,
    },
    { label: t('stats.modelCoverage'), value: `${stats.coverage}%`, color: 'var(--green)' },
  ]
}

function StatsBar({ items }: { items: StatTile[] }) {
  return (
    <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-cols-4 rounded-xl border border-line bg-ink-2 overflow-hidden">
      {items.map((it, i) => (
        <div
          key={i}
          className={i > 0
            ? 'min-w-0 px-4 py-5 sm:px-6 md:border-l border-line'
            : 'min-w-0 px-4 py-5 sm:px-6'}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted break-words">
            {it.label}
          </div>
          <div className="mt-2 font-display text-[30px] leading-none" style={{ color: it.color }}>
            <span>{it.value}</span>
            {it.sub && (
              <span className="block mt-1 font-body text-[11px] leading-tight text-amber sm:mt-0 sm:ml-2 sm:inline sm:align-middle">
                {it.sub}
              </span>
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
  const { t } = useI18n()
  return (
    <div className="mt-6 rounded-xl border border-line bg-ink-2 overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="text-muted font-mono text-[10px] uppercase tracking-[0.1em] border-b border-line">
            <th className="py-3 pl-4 pr-4 font-normal">{t('table.candidate')}</th>
            <th className="py-3 pr-4 font-normal">{t('table.verdict')}</th>
            <th className="py-3 pr-4 font-normal">{t('table.quality')}</th>
            <th className="py-3 pr-4 font-normal">{t('table.status')}</th>
            <th className="py-3 pr-4 font-normal">{t('table.notes')}</th>
            <th className="py-3 pr-4 font-normal">{t('table.artifacts')}</th>
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
  const { t } = useI18n()
  if (!featured) {
    return (
      <div className="rounded-xl border border-line bg-ink-2 p-6 text-muted text-[13px]">
        {t('featured.empty')}
      </div>
    )
  }
  const { r, d } = featured
  const quote = (d.thesis_summary || '').slice(0, 240)
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {t('featured.kicker')} {r.ticker}
      </div>
      <h3 className="font-display text-[26px] text-bone mt-2 leading-tight">
        {r.company_name || r.ticker}
      </h3>
      <p className="mt-3 text-[14px] italic text-bone-dim leading-relaxed border-l-2 border-line-strong pl-4">
        "{quote}..."
      </p>
      <div className="flex items-center justify-between mt-5">
        <div>
          <div className="text-[13px] text-bone">{t('featured.engine')}</div>
          <div className="text-[11px] text-muted">{t('featured.recommendation')}</div>
        </div>
        <a
          href={reportUrl(r.run_id, 'html')}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] uppercase tracking-wide text-green hover:underline"
        >
          {t('featured.read')}
        </a>
      </div>
    </div>
  )
}

function WatchlistCard({ pins, onPinChange }: { pins: Pin[]; onPinChange: () => void }) {
  const { t } = useI18n()
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-green">
        Watchlist - {pins.length}
      </div>
      {pins.length === 0 ? (
        <p className="text-[12.5px] text-muted mt-2 leading-relaxed">{t('watchlist.empty')}</p>
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
                {t('watchlist.remove')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AuditCard({ stats }: { stats: Stats }) {
  const { t } = useI18n()
  const pass = stats.coverage >= 80
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-5">
      <div className="text-[13px] text-bone font-medium">
        System Audit: {pass ? t('audit.pass') : t('audit.review')}
      </div>
      <div className="text-[11.5px] text-muted mt-1 leading-relaxed">
        {t('audit.coverage')} {stats.coverage}% - {stats.total} {t('audit.verified')}
      </div>
    </div>
  )
}
function PublicEvidenceAuditCard({ publications }: { publications: PublicPublication[] }) {
  const { t } = useI18n()
  const completePackages = publications.filter(
    (publication) =>
      Boolean(publication.memo_short_url) &&
      Boolean(publication.memo_long_url) &&
      Boolean(publication.memo_full_url),
  ).length
  const status =
    publications.length === 0
      ? t('public.auditAwaiting')
      : completePackages === publications.length
        ? t('public.auditComplete')
        : t('public.auditPartial')

  return (
    <div className="rounded-xl border border-line bg-ink-2 p-5">
      <div className="text-[13px] text-bone font-medium">
        {t('public.auditLabel')} {status}
      </div>
      <div className="text-[11.5px] text-muted mt-1 leading-relaxed">
        {completePackages}/{publications.length} {t('public.auditBody')}
      </div>
    </div>
  )
}

function Footer() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-line mt-16">
      <div className="mx-auto max-w-container px-6 py-6 flex items-center justify-between text-[11px] text-muted font-mono uppercase tracking-wide">
        <span>DeepFlow - by Denario</span>
        <span className="hidden sm:flex gap-6">
          <a href="/legal.html#privacidad" className="hover:text-bone">
            {t('footer.privacy')}
          </a>
          <a href="/legal.html#terminos" className="hover:text-bone">
            {t('footer.terms')}
          </a>
          <a href="/legal.html#uso-aceptable" className="hover:text-bone">
            {t('footer.guidelines')}
          </a>
        </span>
      </div>
    </footer>
  )
}

function publicStatItems(publications: PublicPublication[], t: I18nState['t']): StatTile[] {
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
      label: t('public.publicTheses'),
      value: publications.length.toLocaleString('en-US'),
      color: 'var(--bone)',
      sub: publications.length > 0 ? t('public.curatedFeed') : undefined,
    },
    {
      label: t('public.latestMemo'),
      value: latest?.ticker ?? 'n/d',
      color: 'var(--bone)',
      sub: latest ? formatPublicationDate(latest.published_at) : t('public.noPublications'),
    },
    {
      label: t('public.evidencePackages'),
      value: publications.length > 0 ? `${completePackages}/${publications.length}` : '0',
      color: 'var(--green)',
      sub: publications.length > 0 ? t('public.complete') : undefined,
    },
    {
      label: t('public.privateThesis'),
      value: '321',
      color: 'var(--bone)',
    },
  ]
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
  canDelete,
  isDeleting,
  onDeletePublication,
}: {
  publication: PublicPublication
  livePrices: Record<string, number | null>
  canDelete: boolean
  isDeleting: boolean
  onDeletePublication: (publication: PublicPublication) => void
}) {
  const { t } = useI18n()
  const livePrice = livePrices[publication.ticker] ?? null
  const documentLinks = publicationDocumentLinks(publication)
  return (
    <tr className="border-t border-line hover:bg-ink-3 transition-colors">
      <td className="py-3.5 pl-4 pr-4 align-middle">
        <div className="min-w-[140px]">
          <div className="font-mono text-[13px] font-medium uppercase text-bone">
            {publication.ticker}
          </div>
          <div className="mt-0.5 text-[12px] text-muted truncate">
            {publication.company_name || publication.ticker}
          </div>
          {canDelete && (
            <button
              type="button"
              className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-red hover:underline disabled:text-muted disabled:no-underline disabled:cursor-wait"
              onClick={() => onDeletePublication(publication)}
              disabled={isDeleting}
              aria-label={`${t('public.deleteAria')} ${publication.company_name || publication.ticker}`}
              title={t('public.deleteTitle')}
            >
              {isDeleting ? t('public.deleting') : t('public.delete')}
            </button>
          )}
        </div>
      </td>
      <td className="py-3.5 pr-4 align-middle whitespace-nowrap">
        <span className="text-[12.5px] text-bone-dim">
          {formatPublicationDate(publication.published_at)}
        </span>
      </td>
      <td className="py-3.5 pr-4 align-middle whitespace-nowrap">
        <span className="font-mono text-[12px] text-bone-dim">
          {formatPublicationPrice(publication.memo_price, publication.memo_price_currency)}
        </span>
      </td>
      <td className="py-3.5 pr-4 align-middle whitespace-nowrap">
        <span className="font-mono text-[12px] text-bone-dim block">
          {formatPublicationPrice(livePrice, publication.memo_price_currency)}
        </span>
      </td>
      <td className="py-3.5 pr-4 align-middle whitespace-nowrap">
        <PriceChange memoPrice={publication.memo_price} livePrice={livePrice} />
      </td>
      <td className="py-3.5 pr-4 align-middle text-center">
        <div className="inline-grid grid-cols-3 overflow-hidden rounded-md border border-line divide-x divide-line text-muted">
          {documentLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              rel="noreferrer"
              title={translateDocLabel(link.label, t)}
              className="inline-flex min-h-9 min-w-[92px] items-center justify-center gap-1.5 px-3 text-[11.5px] transition-colors hover:bg-green-dim hover:text-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green"
            >
              <DocIcon />
              <span>{translateDocLabel(link.label, t)}</span>
            </a>
          ))}
        </div>
      </td>
    </tr>
  )
}

function PublicPublicationsTable({
  publications,
  livePrices,
  canDelete,
  deletingSlug,
  onDeletePublication,
}: {
  publications: PublicPublication[]
  livePrices: Record<string, number | null>
  canDelete: boolean
  deletingSlug: string | null
  onDeletePublication: (publication: PublicPublication) => void
}) {
  const { t } = useI18n()
  return (
    <div className="mt-6 rounded-xl border border-line bg-ink-2 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-muted font-mono text-[10px] uppercase tracking-[0.1em] border-b border-line">
            <th className="py-3 pl-4 pr-4 font-normal">{t('public.ticker')}</th>
            <th className="py-3 pr-4 font-normal">{t('public.datePublished')}</th>
            <th className="py-3 pr-4 font-normal">{t('public.inceptionPrice')}</th>
            <th className="py-3 pr-4 font-normal">{t('public.livePrice')}</th>
            <th className="py-3 pr-4 font-normal">{t('public.change')}</th>
            <th className="py-3 pr-4 font-normal text-center">{t('public.documents')}</th>
          </tr>
        </thead>
        <tbody>
          {publications.map((publication) => (
            <PublicPublicationRow
              key={publication.run_id}
              publication={publication}
              livePrices={livePrices}
              canDelete={canDelete}
              isDeleting={deletingSlug === publication.public_slug}
              onDeletePublication={onDeletePublication}
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
  const { t } = useI18n()
  if (!publication) {
    return (
      <div className="rounded-xl border border-line bg-ink-2 p-6 text-muted text-[13px]">
        {t('public.empty')}
      </div>
    )
  }
  const documentLinks = publicationDocumentLinks(publication)
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {t('public.latestMemo')} - {publication.ticker}
          </div>
          <h3 className="font-display text-[24px] text-bone mt-1.5 leading-tight">
            {publication.company_name || publication.ticker}
          </h3>
          <div className="mt-4 inline-grid grid-cols-3 overflow-hidden rounded-md border border-line divide-x divide-line text-muted">
            {documentLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                rel="noreferrer"
                className="inline-flex min-h-8 items-center justify-center px-3 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors hover:bg-green-dim hover:text-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green"
              >
                {translateDocLabel(link.label, t)}
              </a>
            ))}
          </div>
        </div>
        <div className="w-full rounded-lg border border-line bg-ink-3 px-4 py-3 sm:w-auto sm:min-w-[180px] sm:text-right">
          <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
            {t('public.livePrice')}
          </div>
          <div className="mt-1 font-display text-[22px] leading-none text-bone">
            {formatPublicationPrice(livePrice, publication.memo_price_currency)}
          </div>
          <div className="mt-2 flex items-center gap-2 sm:justify-end">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
              {t('public.change')}
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
  account,
  onProfileSave,
  onSignOut,
  authError,
  canManagePublications,
  deletingPublicationSlug,
  deletePublicationError,
  onDeletePublication,
}: {
  publications: PublicPublication[] | null
  livePrices: Record<string, number | null>
  error: string | null
  q: string
  setQ: (value: string) => void
  light: boolean
  toggleTheme: () => void
  auth: AuthNavState
  account: AccountNavState
  onProfileSave: (input: AccountProfileUpdate) => void
  onSignOut: () => void
  authError: string | null
  canManagePublications: boolean
  deletingPublicationSlug: string | null
  deletePublicationError: string | null
  onDeletePublication: (publication: PublicPublication) => void
}) {
  const { t } = useI18n()
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
    () => publicStatItems(publications || [], t),
    [publications, t],
  )
  const featured = filtered[0] ?? null
  const featuredLivePrice = featured ? livePrices[featured.ticker] : null

  return (
    <div className="min-h-screen">
      <NavBar
        light={light}
        toggleTheme={toggleTheme}
        auth={auth}
        account={account}
        onProfileSave={onProfileSave}
        onSignOut={onSignOut}
      />
      <main className="mx-auto max-w-container px-6">
        <Hero />
        <StatsBar items={publicStats} />
        <ResearchSearch q={q} setQ={setQ} />

        {authError && <p className="text-red text-[13px] mt-6">Auth error: {authError}</p>}
        {error && <p className="text-red text-[13px] mt-6">{t('public.feedError')} {error}</p>}
        {deletePublicationError && (
          <p className="text-red text-[13px] mt-6">
            {t('public.deleteError')} {deletePublicationError}
          </p>
        )}
        {!publications && !error && (
          <p className="text-muted text-[13px] mt-6">{t('public.loading')}</p>
        )}
        {publications && filtered.length === 0 && !error && (
          <p className="text-muted text-[13px] mt-6">{t('public.noRows')}</p>
        )}

        {filtered.length > 0 && (
          <PublicPublicationsTable
            publications={filtered}
            livePrices={livePrices}
            canDelete={canManagePublications}
            deletingSlug={deletingPublicationSlug}
            onDeletePublication={onDeletePublication}
          />
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
  eyebrow,
  title,
  body,
  buttonLabel,
  loginHref = LOGIN_UNAVAILABLE_HREF,
}: {
  light: boolean
  toggleTheme: () => void
  auth: AuthNavState
  authError: string | null
  eyebrow?: string
  title?: string
  body?: string
  buttonLabel?: string
  loginHref?: string
}) {
  const { t } = useI18n()
  const displayEyebrow = eyebrow ?? t('auth.eyebrow')
  const displayTitle = title ?? t('auth.title')
  const displayBody = body ?? t('auth.body')
  const displayButtonLabel = buttonLabel ?? t('auth.button')
  return (
    <div className="min-h-screen">
      <NavBar light={light} toggleTheme={toggleTheme} auth={auth} />
      <main className="mx-auto max-w-container px-6">
        <section className="pt-24 max-w-[560px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-green">
            {displayEyebrow}
          </span>
          <h1 className="font-display text-[44px] leading-tight text-bone mt-4">
            {displayTitle}
          </h1>
          <p className="text-[14px] text-bone-dim leading-relaxed mt-4">
            {displayBody}
          </p>
          <a
            href={loginHref}
            className="mt-7 rounded-md border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-bone hover:border-green disabled:cursor-wait disabled:text-muted"
          >
            {displayButtonLabel}
          </a>
          {authError && <p className="text-red text-[13px] mt-5">Auth error: {authError}</p>}
        </section>
      </main>
      <Footer />
    </div>
  )
}

function LoginComingSoonPage({
  light,
  toggleTheme,
  auth,
}: {
  light: boolean
  toggleTheme: () => void
  auth: AuthNavState
}) {
  const { t } = useI18n()
  return (
    <div className="min-h-screen">
      <NavBar light={light} toggleTheme={toggleTheme} auth={auth} />
      <main className="mx-auto max-w-container px-6">
        <section className="pt-24 max-w-[560px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-green">
            {t('profile.title')}
          </span>
          <h1 className="font-display text-[44px] leading-tight text-bone mt-4">
            {t('profile.comingSoon')}
          </h1>
          <p className="text-[14px] text-bone-dim leading-relaxed mt-4">
            {t('auth.body')}
          </p>
          <a
            href="/"
            className="mt-7 inline-block rounded-md border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-bone hover:border-green"
          >
            {t('auth.backHome')}
          </a>
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
  const loginUnavailablePage =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('login') === '1'
  const [language, setLanguage] = useState<AppLanguage>(() => readInitialLanguage())
  const [runs, setRuns] = useState<RunSummary[] | null>(null)
  const [details, setDetails] = useState<Record<string, RunDetail>>({})
  const [publications, setPublications] = useState<PublicPublication[] | null>(null)
  const [publicationError, setPublicationError] = useState<string | null>(null)
  const [deletingPublicationSlug, setDeletingPublicationSlug] = useState<string | null>(null)
  const [deletePublicationError, setDeletePublicationError] = useState<string | null>(null)
  const [livePrices, setLivePrices] = useState<Record<string, number | null>>({})
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [light, setLight] = useState(document.body.classList.contains('light'))
  const [pins, setPins] = useState<Pin[]>(() => getPins())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)
  const [authLoading, setAuthLoading] = useState(supabaseAuthConfig.enabled && !loginUnavailablePage)
  const [authError, setAuthError] = useState<string | null>(null)
  const [accountProfile, setAccountProfile] = useState<AccountProfile | null>(null)
  const [accountEntitlement, setAccountEntitlement] = useState<UserEntitlement | null>(null)
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [accountSaved, setAccountSaved] = useState(false)
  const i18nValue = useMemo<I18nState>(
    () => ({
      language,
      setLanguage,
      t: (key) => APP_TEXT[language][key],
    }),
    [language],
  )
  const t = i18nValue.t
  const withI18n = (node: ReactNode) => (
    <I18nContext.Provider value={i18nValue}>{node}</I18nContext.Provider>
  )

  useEffect(() => {
    document.documentElement.lang = language
    localStorage.setItem('df-lang', language)
  }, [language])

  useEffect(() => {
    if (loginUnavailablePage) return
    if (!supabaseAuthConfig.enabled) return

    let cancelled = false
    getInitialAuthSession()
      .then((session) => {
        if (cancelled) return
        syncApiAuthCookie(session)
        setAuthSession(session)
      })
      .catch((e) => {
        if (!cancelled) setAuthError(errorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false)
      })

    const unsubscribe = onAuthSessionChange((session) => {
      if (cancelled) return
      syncApiAuthCookie(session)
      setAuthSession(session)
      setAuthLoading(false)
      if (session) setAuthError(null)
      else {
        setRuns(null)
        setDetails({})
        setPublications(null)
        setLivePrices({})
        setAccountProfile(null)
        setAccountEntitlement(null)
        setAccountError(null)
        setAccountSaved(false)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [loginUnavailablePage])

  useEffect(() => {
    setApiAuthTokenProvider(() => authSession?.access_token ?? null)
    return () => setApiAuthTokenProvider(null)
  }, [authSession])

  useEffect(() => {
    if (!supabaseAuthConfig.enabled || !authSession) {
      return
    }

    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setAccountLoading(true)
      setAccountError(null)
    })

    fetchAccountProfile(authSession.user.id)
      .then(({ profile, entitlement }) => {
        if (cancelled) return
        setAccountProfile(profile)
        setAccountEntitlement(entitlement)
      })
      .catch((e) => {
        if (!cancelled) setAccountError(errorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setAccountLoading(false)
      })

    return () => {
      cancelled = true
    }
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

  // Throttled detail loader (max 4 concurrent) fills quality/status/notes without an N+1 burst.
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
    isAdmin: sessionHasAdminRole(authSession),
  }), [requiresAuth, authLoading, authSession])
  const account = useMemo<AccountNavState>(() => ({
    profile: accountProfile,
    entitlement: accountEntitlement,
    loading: accountLoading,
    saving: accountSaving,
    error: accountError,
    saved: accountSaved,
  }), [accountProfile, accountEntitlement, accountLoading, accountSaving, accountError, accountSaved])
  const canManagePublications = auth.isAdmin || accountProfile?.tier?.toLowerCase() === 'admin'

  const handleSignOut = () => {
    setAuthError(null)
    void signOut().catch((e) => setAuthError(errorMessage(e)))
  }

  const handleProfileSave = (input: AccountProfileUpdate) => {
    if (!authSession) return
    setAccountSaving(true)
    setAccountError(null)
    setAccountSaved(false)

    void updateAccountProfile(authSession.user.id, input)
      .then((profile) => {
        setAccountProfile(profile)
        setAccountSaved(true)
      })
      .catch((e) => {
        setAccountError(errorMessage(e))
      })
      .finally(() => {
        setAccountSaving(false)
      })
  }

  const handleDeletePublication = (publication: PublicPublication) => {
    if (!canManagePublications || deletingPublicationSlug) return
    const label = publication.company_name
      ? `${publication.company_name} (${publication.ticker})`
      : publication.ticker
    const confirmed = window.confirm(
      `${t('confirm.deletePrefix')} ${label}? ${t('confirm.deleteSuffix')}`,
    )
    if (!confirmed) return

    setDeletingPublicationSlug(publication.public_slug)
    setDeletePublicationError(null)

    void deletePublication(publication.public_slug)
      .then(() => {
        setPublications((items) =>
          items ? items.filter((item) => item.public_slug !== publication.public_slug) : items,
        )
      })
      .catch((e) => {
        setDeletePublicationError(errorMessage(e))
      })
      .finally(() => {
        setDeletingPublicationSlug(null)
      })
  }

  const toggleTheme = () => {
    const next = !light
    document.body.classList.toggle('light', next)
    localStorage.setItem('df-theme', next ? 'light' : 'dark')
    setLight(next)
  }

  if (loginUnavailablePage) {
    return withI18n(
      <LoginComingSoonPage
        light={light}
        toggleTheme={toggleTheme}
        auth={auth}
      />,
    )
  }

  if (publicMode && requiresAuth && (authLoading || !authSession)) {
    return withI18n(
      <AuthGate
        light={light}
        toggleTheme={toggleTheme}
        auth={auth}
        authError={authError}
        eyebrow={t('auth.publicEyebrow')}
        title={t('auth.title')}
        body={t('auth.publicBody')}
        buttonLabel={t('auth.button')}
      />,
    )
  }

  if (publicMode) {
    return withI18n(
      <PublicEvidenceView
        publications={publications}
        livePrices={livePrices}
        error={publicationError}
        q={q}
        setQ={setQ}
        light={light}
        toggleTheme={toggleTheme}
        auth={auth}
        account={account}
        onProfileSave={handleProfileSave}
        onSignOut={handleSignOut}
        authError={authError}
        canManagePublications={canManagePublications}
        deletingPublicationSlug={deletingPublicationSlug}
        deletePublicationError={deletePublicationError}
        onDeletePublication={handleDeletePublication}
      />,
    )
  }

  if (requiresAuth && (authLoading || !authSession)) {
    return withI18n(
      <AuthGate
        light={light}
        toggleTheme={toggleTheme}
        auth={auth}
        authError={authError}
      />,
    )
  }

  return withI18n(
    <div className="min-h-screen">
      <NavBar
        light={light}
        toggleTheme={toggleTheme}
        auth={auth}
        account={account}
        onProfileSave={handleProfileSave}
        onSignOut={handleSignOut}
      />
      <main className="mx-auto max-w-container px-6">
        <Hero />
        <StatsBar items={internalStatItems(stats, t)} />
        <ResearchSearch q={q} setQ={setQ} />

        {authError && <p className="text-red text-[13px] mt-6">Auth error: {authError}</p>}
        {error && (
          <p className="text-red text-[13px] mt-6">`n            {t('app.runsError')} {error}. {t('app.backendHint')}`n          </p>
        )}
        {!runs && !error && <p className="text-muted text-[13px] mt-6">{t('app.loadingRuns')}</p>}
        {runs && filtered.length === 0 && !error && (
          <p className="text-muted text-[13px] mt-6">{t('app.noRuns')}</p>
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
    </div>,
  )
}
