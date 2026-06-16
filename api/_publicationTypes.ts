export const INDEX_PATH = 'publications/index.json'
export const PDF_MAX_BYTES = 100 * 1024 * 1024

export const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'authorization, content-type',
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export type MemoKind = 'memo_long' | 'memo_short'

export interface UploadClientPayload {
  run_id: string
  ticker: string
  kind: MemoKind
}

export interface PublicationCommitBody {
  run_id: string
  ticker: string
  company_name: string | null
  public_slug: string
  publishability_status: string
  confidence: string | null
  system_label: string | null
  memo_long_url: string
  memo_short_url: string
  editor_note: string | null
}

export interface PublicPublication {
  run_id: string
  ticker: string
  company_name: string | null
  public_slug: string
  published_at: string
  publishability_status: string
  confidence: string | null
  system_label: string | null
  memo_long_url: string
  memo_short_url: string
  metadata_url: string | null
  editor_note: string | null
}

export interface PublicationsFeed {
  schema_version: 1
  updated_at: string | null
  publications: PublicPublication[]
}

export function optionsResponse(): Response {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: corsHeaders })
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return jsonResponse({ error: error.message }, error.status)
  }
  const message = error instanceof Error ? error.message : 'unknown error'
  return jsonResponse({ error: message }, 500)
}

export function assertPublishToken(request: Request): void {
  const expected = process.env.DEEPFLOW_PUBLISH_TOKEN
  if (!expected) throw new HttpError(500, 'DEEPFLOW_PUBLISH_TOKEN is not configured')
  const actual = request.headers.get('authorization') ?? ''
  if (actual !== `Bearer ${expected}`) throw new HttpError(401, 'invalid publish token')
}

export function parseUploadClientPayload(raw: string | null): UploadClientPayload {
  if (!raw) throw new HttpError(400, 'client payload is required')
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new HttpError(400, 'client payload must be JSON')
  }
  const obj = asRecord(parsed)
  const kind = stringField(obj, 'kind')
  if (kind !== 'memo_long' && kind !== 'memo_short') {
    throw new HttpError(400, 'invalid memo kind')
  }
  return {
    run_id: stringField(obj, 'run_id'),
    ticker: stringField(obj, 'ticker'),
    kind,
  }
}

export function validateUploadPath(pathname: string, payload: UploadClientPayload): void {
  const expectedFile = payload.kind === 'memo_long' ? 'memo-largo.pdf' : 'memo-corto.pdf'
  if (!pathname.endsWith(`/${expectedFile}`)) {
    throw new HttpError(400, `expected upload path to end with ${expectedFile}`)
  }
  if (!/^publications\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/memo-(largo|corto)\.pdf$/.test(pathname)) {
    throw new HttpError(400, 'invalid publication upload path')
  }
}

export function parseCommitBody(raw: unknown): PublicationCommitBody {
  const obj = asRecord(raw)
  const publicSlug = stringField(obj, 'public_slug')
  validatePublicSlug(publicSlug)
  return {
    run_id: stringField(obj, 'run_id'),
    ticker: stringField(obj, 'ticker'),
    company_name: nullableStringField(obj, 'company_name'),
    public_slug: publicSlug,
    publishability_status: stringField(obj, 'publishability_status'),
    confidence: nullableStringField(obj, 'confidence'),
    system_label: nullableStringField(obj, 'system_label'),
    memo_long_url: urlField(obj, 'memo_long_url'),
    memo_short_url: urlField(obj, 'memo_short_url'),
    editor_note: nullableStringField(obj, 'editor_note'),
  }
}

export function publicationMetadataPath(publicSlug: string): string {
  validatePublicSlug(publicSlug)
  return `publications/${publicSlug}/metadata.json`
}

export function emptyFeed(): PublicationsFeed {
  return { schema_version: 1, updated_at: null, publications: [] }
}

export function upsertPublication(
  feed: PublicationsFeed,
  publication: PublicPublication,
): PublicationsFeed {
  const next = feed.publications.filter((item) => item.run_id !== publication.run_id)
  next.unshift(publication)
  next.sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
  return {
    schema_version: 1,
    updated_at: publication.published_at,
    publications: next,
  }
}

export function normalizeFeed(raw: unknown): PublicationsFeed {
  if (!raw || typeof raw !== 'object') return emptyFeed()
  const obj = raw as Partial<PublicationsFeed>
  return {
    schema_version: 1,
    updated_at: typeof obj.updated_at === 'string' ? obj.updated_at : null,
    publications: Array.isArray(obj.publications) ? obj.publications : [],
  }
}

function validatePublicSlug(value: string): void {
  if (!/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(value)) {
    throw new HttpError(400, 'invalid public slug')
  }
}

function urlField(obj: Record<string, unknown>, key: string): string {
  const value = stringField(obj, key)
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol')
    return url.toString()
  } catch {
    throw new HttpError(400, `${key} must be an absolute URL`)
  }
}

function stringField(obj: Record<string, unknown>, key: string): string {
  const value = obj[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `${key} is required`)
  }
  return value.trim()
}

function nullableStringField(obj: Record<string, unknown>, key: string): string | null {
  const value = obj[key]
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string') throw new HttpError(400, `${key} must be a string`)
  return value.trim()
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'body must be an object')
  }
  return value as Record<string, unknown>
}
