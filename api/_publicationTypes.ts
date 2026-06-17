import { gunzipSync } from 'node:zlib'
import { get } from '@vercel/blob'

export const INDEX_PATH = 'publications/index.json'
export const PDF_MAX_BYTES = 100 * 1024 * 1024
export const HTML_MAX_BYTES = 20 * 1024 * 1024
export const HTML_GZIP_MAX_BYTES = 10 * 1024 * 1024

export const publicCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'authorization, content-type',
}

export const corsHeaders = publicCorsHeaders

export function writeCorsHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
  }
  const allowedOrigin = (process.env.DEEPFLOW_PUBLISH_ALLOWED_ORIGIN || '').trim()
  if (allowedOrigin) headers['access-control-allow-origin'] = allowedOrigin
  return headers
}

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export type MemoKind = 'memo_long' | 'memo_short'
export type HtmlMemoKind = MemoKind | 'memo_full'
export type PublishedHtmlDocumentKind = 'resumen' | 'memo' | 'tesis-completa'

const publishedHtmlDocumentFilenames: Record<PublishedHtmlDocumentKind, string> = {
  resumen: 'resumen.html',
  memo: 'memo.html',
  'tesis-completa': 'tesis-completa.html',
}

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
  memo_price: number | null
  memo_price_currency: string | null
  memo_price_as_of: string | null
}

export interface PublicationPublishBody extends PublicationCommitBody {
  memo_long_html_gzip_base64: string
  memo_short_html_gzip_base64: string
  memo_full_html_gzip_base64: string | null
}

export interface PublicationDeleteBody {
  public_slug: string
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
  memo_long_url: string | null
  memo_short_url: string | null
  memo_full_url: string | null
  memo_long_path?: string | null
  memo_short_path?: string | null
  memo_full_path?: string | null
  metadata_url: string | null
  metadata_path?: string | null
  editor_note: string | null
  memo_price: number | null
  memo_price_currency: string | null
  memo_price_as_of: string | null
}

export interface PublicationsFeed {
  schema_version: 1
  updated_at: string | null
  publications: PublicPublication[]
}

export function optionsResponse(scope: 'public' | 'write' = 'public'): Response {
  return new Response(null, {
    status: 204,
    headers: scope === 'write' ? writeCorsHeaders() : publicCorsHeaders,
  })
}

export function jsonResponse(
  body: unknown,
  status = 200,
  scope: 'public' | 'write' = 'public',
): Response {
  return Response.json(body, {
    status,
    headers: scope === 'write' ? writeCorsHeaders() : publicCorsHeaders,
  })
}

export function errorResponse(error: unknown, scope: 'public' | 'write' = 'public'): Response {
  if (error instanceof HttpError || isHttpErrorLike(error)) {
    return jsonResponse({ error: error.message }, error.status, scope)
  }
  const message = error instanceof Error ? error.message : 'unknown error'
  return jsonResponse({ error: message }, 500, scope)
}

function isHttpErrorLike(error: unknown): error is { status: number; message: string } {
  return Boolean(
    error &&
      typeof error === 'object' &&
      typeof (error as { status?: unknown }).status === 'number' &&
      typeof (error as { message?: unknown }).message === 'string',
  )
}

export function assertPublishToken(request: Request | { headers: Record<string, string | string[] | undefined> }): void {
  const expected = process.env.DEEPFLOW_PUBLISH_TOKEN
  if (!expected) throw new HttpError(500, 'DEEPFLOW_PUBLISH_TOKEN is not configured')
  const actual = request.headers instanceof Headers
    ? request.headers.get('authorization') ?? ''
    : headerValue(request.headers.authorization)
  if (actual !== `Bearer ${expected}`) throw new HttpError(401, 'invalid publish token')
}

function headerValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
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
    memo_long_url: blobUrlField(obj, 'memo_long_url', publicSlug, 'memo-largo.pdf'),
    memo_short_url: blobUrlField(obj, 'memo_short_url', publicSlug, 'memo-corto.pdf'),
    editor_note: nullableStringField(obj, 'editor_note'),
    memo_price: nullableNumberField(obj, 'memo_price'),
    memo_price_currency: nullableStringField(obj, 'memo_price_currency'),
    memo_price_as_of: nullableStringField(obj, 'memo_price_as_of'),
  }
}

export function parsePublishBody(raw: unknown): PublicationPublishBody {
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
    memo_long_url: '',
    memo_short_url: '',
    editor_note: nullableStringField(obj, 'editor_note'),
    memo_price: nullableNumberField(obj, 'memo_price'),
    memo_price_currency: nullableStringField(obj, 'memo_price_currency'),
    memo_price_as_of: nullableStringField(obj, 'memo_price_as_of'),
    memo_long_html_gzip_base64: stringField(obj, 'memo_long_html_gzip_base64'),
    memo_short_html_gzip_base64: stringField(obj, 'memo_short_html_gzip_base64'),
    memo_full_html_gzip_base64: nullableStringField(obj, 'memo_full_html_gzip_base64'),
  }
}

export function parseDeleteBody(raw: unknown): PublicationDeleteBody {
  const obj = asRecord(raw)
  const publicSlug = stringField(obj, 'public_slug')
  validatePublicSlug(publicSlug)
  return { public_slug: publicSlug }
}

export function parsePublishedHtmlDocumentRequest(
  rawUrl: string | URL,
): { public_slug: string; kind: PublishedHtmlDocumentKind } {
  const url = rawUrl instanceof URL ? rawUrl : new URL(rawUrl, 'https://deepflow.local')
  const publicSlug = url.searchParams.get('slug')?.trim() ?? ''
  validatePublicSlug(publicSlug)

  const kind = url.searchParams.get('kind')
  if (!isPublishedHtmlDocumentKind(kind)) throw new HttpError(400, 'invalid document kind')

  return { public_slug: publicSlug, kind }
}

export function publicationMetadataPath(publicSlug: string): string {
  validatePublicSlug(publicSlug)
  return `publications/${publicSlug}/metadata.json`
}

export function publicationPdfPath(publicSlug: string, kind: MemoKind): string {
  validatePublicSlug(publicSlug)
  const file = kind === 'memo_long' ? 'memo-largo.pdf' : 'memo-corto.pdf'
  return `publications/${publicSlug}/${file}`
}

export function publicationHtmlPath(publicSlug: string, kind: HtmlMemoKind): string {
  validatePublicSlug(publicSlug)
  const file = kind === 'memo_long'
    ? 'memo.html'
    : kind === 'memo_short'
      ? 'resumen.html'
      : 'tesis-completa.html'
  return `publications/${publicSlug}/${file}`
}

export function publicationHtmlFilename(kind: PublishedHtmlDocumentKind): string {
  return publishedHtmlDocumentFilenames[kind]
}

export function publicationViewerPath(publicSlug: string, kind: PublishedHtmlDocumentKind): string {
  validatePublicSlug(publicSlug)
  const params = new URLSearchParams({ slug: publicSlug, kind })
  return `/api/publications/view?${params.toString()}`
}

export function publicationHtmlUrlForKind(
  publication: PublicPublication,
  kind: PublishedHtmlDocumentKind,
): string | null {
  if (kind === 'resumen') return publication.memo_short_url
  if (kind === 'memo') return publication.memo_long_url
  return publication.memo_full_url
}

export function publicationHtmlStoragePathForKind(
  publication: PublicPublication,
  kind: PublishedHtmlDocumentKind,
): string | null {
  if (kind === 'resumen') {
    return publication.memo_short_path ?? null
  }
  if (kind === 'memo') {
    return publication.memo_long_path ?? null
  }
  return publication.memo_full_path ?? null
}

export function publicationHasHtmlDocument(
  publication: PublicPublication,
  kind: PublishedHtmlDocumentKind,
): boolean {
  return Boolean(
    publicationHtmlStoragePathForKind(publication, kind) ||
      publicationHtmlUrlForKind(publication, kind),
  )
}

export function sanitizePublicationsFeedForClient(feed: PublicationsFeed): PublicationsFeed {
  return {
    ...feed,
    publications: feed.publications.map((publication) => {
      const {
        memo_short_path: _memoShortPath,
        memo_long_path: _memoLongPath,
        memo_full_path: _memoFullPath,
        metadata_path: _metadataPath,
        ...clientPublication
      } = publication

      return {
        ...clientPublication,
        memo_short_url: publicationHasHtmlDocument(publication, 'resumen')
          ? publicationViewerPath(publication.public_slug, 'resumen')
          : null,
        memo_long_url: publicationHasHtmlDocument(publication, 'memo')
          ? publicationViewerPath(publication.public_slug, 'memo')
          : null,
        memo_full_url: publicationHasHtmlDocument(publication, 'tesis-completa')
          ? publicationViewerPath(publication.public_slug, 'tesis-completa')
          : null,
        metadata_url: null,
      }
    }),
  }
}

export function inlineHtmlDocumentHeaders(filename: string): Record<string, string> {
  return {
    ...publicCorsHeaders,
    'cache-control': 'private, no-store',
    'content-disposition': `inline; filename="${filename}"`,
    'content-type': 'text/html; charset=utf-8',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    'x-robots-tag': 'noindex',
  }
}

export function publicBlobUrl(pathname: string): string {
  const storeId = (process.env.BLOB_STORE_ID || '').trim()
  if (!storeId) throw new HttpError(500, 'BLOB_STORE_ID is not configured')
  const normalizedStoreId = storeId.replace(/^store_/i, '').toLowerCase()
  const normalizedPathname = pathname.replace(/^\/+/, '')
  return `https://${normalizedStoreId}.public.blob.vercel-storage.com/${normalizedPathname}`
}

export async function readPublicJsonBlob(pathname: string): Promise<unknown | null> {
  const url = new URL(publicBlobUrl(pathname))
  url.searchParams.set('cacheBust', String(Date.now()))
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { accept: 'application/json' },
  })
  if (response.status === 404) return null
  if (!response.ok) {
    throw new HttpError(502, `failed to read public blob ${pathname}: ${response.status}`)
  }
  return response.json()
}

export async function readPrivateJsonBlob(pathname: string): Promise<unknown | null> {
  const result = await get(pathname, {
    access: 'private',
    useCache: false,
  })
  if (!result || result.statusCode !== 200 || !result.stream) return null
  return new Response(result.stream).json()
}

export async function readPublicationIndexBlob(): Promise<unknown | null> {
  const privateFeed = await readPrivateJsonBlob(INDEX_PATH)
  if (privateFeed !== null) return privateFeed
  return readPublicJsonBlob(INDEX_PATH)
}

export function decodeHtmlGzipBase64(value: string, label: string): Buffer {
  const compressed = Buffer.from(value, 'base64')
  if (compressed.length <= 0) throw new HttpError(400, `${label} is empty`)
  if (compressed.length > HTML_GZIP_MAX_BYTES) {
    throw new HttpError(413, `${label} compressed payload exceeds size limit`)
  }
  let data: Buffer
  try {
    data = gunzipSync(compressed)
  } catch {
    throw new HttpError(400, `${label} must be gzip-compressed base64`)
  }
  if (data.length <= 0) throw new HttpError(400, `${label} is empty`)
  if (data.length > HTML_MAX_BYTES) throw new HttpError(413, `${label} exceeds size limit`)
  const prefix = data.subarray(0, 256).toString('utf8').toLowerCase()
  if (!prefix.includes('<html') && !prefix.includes('<!doctype html')) {
    throw new HttpError(400, `${label} is not an HTML document`)
  }
  return data
}

export function decodePdfBase64(value: string, label: string): Buffer {
  let data: Buffer
  try {
    data = Buffer.from(value, 'base64')
  } catch {
    throw new HttpError(400, `${label} must be base64`)
  }
  if (data.length <= 0) throw new HttpError(400, `${label} is empty`)
  if (data.length > PDF_MAX_BYTES) throw new HttpError(413, `${label} exceeds size limit`)
  if (!data.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new HttpError(400, `${label} is not a PDF`)
  }
  return data
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

export function removePublication(
  feed: PublicationsFeed,
  publicSlug: string,
  updatedAt = new Date().toISOString(),
): PublicationsFeed {
  return {
    schema_version: 1,
    updated_at: updatedAt,
    publications: feed.publications.filter((item) => item.public_slug !== publicSlug),
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

function isPublishedHtmlDocumentKind(value: string | null): value is PublishedHtmlDocumentKind {
  return value === 'resumen' || value === 'memo' || value === 'tesis-completa'
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

function blobUrlField(
  obj: Record<string, unknown>,
  key: string,
  publicSlug: string,
  expectedFile: 'memo-largo.pdf' | 'memo-corto.pdf',
): string {
  const value = urlField(obj, key)
  const url = new URL(value)
  if (url.protocol !== 'https:') throw new HttpError(400, `${key} must use https`)
  if (!isAllowedBlobHost(url.hostname)) {
    throw new HttpError(400, `${key} host is not allowed`)
  }
  const path = decodeURIComponent(url.pathname).replace(/^\/+/, '')
  const expectedSuffix = `publications/${publicSlug}/${expectedFile}`
  if (!path.endsWith(expectedSuffix)) {
    throw new HttpError(400, `${key} path does not match the publication slug`)
  }
  return url.toString()
}

function isAllowedBlobHost(hostname: string): boolean {
  const configured = (process.env.DEEPFLOW_BLOB_ALLOWED_HOSTS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  if (configured.length > 0) return configured.includes(hostname.toLowerCase())
  return hostname.toLowerCase().endsWith('.public.blob.vercel-storage.com')
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

function nullableNumberField(obj: Record<string, unknown>, key: string): number | null {
  const value = obj[key]
  if (value === null || value === undefined) return null
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new HttpError(400, `${key} must be a finite number`)
  }
  return value
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'body must be an object')
  }
  return value as Record<string, unknown>
}
