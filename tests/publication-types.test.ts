import assert from 'node:assert/strict'
import { test } from 'node:test'
import { gzipSync } from 'node:zlib'

import {
  decodeHtmlGzipBase64,
  inlineHtmlDocumentHeaders,
  parsePublishedHtmlDocumentRequest,
  publicationHtmlPath,
  publicationHtmlStoragePathForKind,
  publicationHtmlUrlForKind,
  publicationsFeedFromMetadata,
  removePublication,
  parseDeleteBody,
  parsePublishBody,
  sanitizePublicationsFeedForClient,
} from '../api/_publicationTypes.ts'

function gzipBase64(value: string): string {
  return gzipSync(Buffer.from(value, 'utf8')).toString('base64')
}

test('parsePublishBody accepts gzipped public HTML documents', () => {
  const body = parsePublishBody({
    run_id: 'NOW-20260616T192437-2dc50a',
    ticker: 'NOW',
    company_name: 'ServiceNow',
    public_slug: '2026/now/NOW-20260616T192437-2dc50a',
    publishability_status: 'Publicado',
    confidence: null,
    system_label: 'Comprar',
    editor_note: null,
    memo_price: 101.57,
    memo_price_currency: 'USD',
    memo_price_as_of: null,
    memo_long_html_gzip_base64: gzipBase64('<!doctype html><html><body>memo</body></html>'),
    memo_short_html_gzip_base64: gzipBase64('<html><body>resumen</body></html>'),
    memo_full_html_gzip_base64: gzipBase64('<html><body>tesis</body></html>'),
  })

  assert.equal(body.memo_long_url, '')
  assert.equal(body.memo_short_url, '')
  assert.equal(
    decodeHtmlGzipBase64(body.memo_long_html_gzip_base64, 'memo').toString('utf8'),
    '<!doctype html><html><body>memo</body></html>',
  )
  assert.equal(
    decodeHtmlGzipBase64(body.memo_full_html_gzip_base64!, 'tesis').toString('utf8'),
    '<html><body>tesis</body></html>',
  )
})

test('publicationHtmlPath uses stable public document filenames', () => {
  assert.equal(
    publicationHtmlPath('2026/now/RUN', 'memo_long'),
    'publications/2026/now/RUN/memo.html',
  )
  assert.equal(
    publicationHtmlPath('2026/now/RUN', 'memo_short'),
    'publications/2026/now/RUN/resumen.html',
  )
  assert.equal(
    publicationHtmlPath('2026/now/RUN', 'memo_full'),
    'publications/2026/now/RUN/tesis-completa.html',
  )
})

test('parsePublishedHtmlDocumentRequest accepts only known published HTML documents', () => {
  assert.deepEqual(
    parsePublishedHtmlDocumentRequest('/api/publications/view?slug=2026%2Fnow%2FRUN-1&kind=memo'),
    { public_slug: '2026/now/RUN-1', kind: 'memo' },
  )

  assert.throws(
    () => parsePublishedHtmlDocumentRequest('/api/publications/view?slug=2026%2Fnow%2FRUN-1&kind=download'),
    /invalid document kind/,
  )
  assert.throws(
    () => parsePublishedHtmlDocumentRequest('/api/publications/view?slug=../secret&kind=memo'),
    /invalid public slug/,
  )
})

test('publicationHtmlUrlForKind selects the existing document url', () => {
  const publication = {
    run_id: 'RUN-1',
    ticker: 'NOW',
    company_name: 'ServiceNow',
    public_slug: '2026/now/RUN-1',
    published_at: '2026-06-16T20:00:00.000Z',
    publishability_status: 'Publicado',
    confidence: null,
    system_label: 'Comprar',
    memo_long_url: 'https://blob/memo.html',
    memo_short_url: 'https://blob/resumen.html',
    memo_full_url: null,
    metadata_url: 'https://blob/metadata.json',
    editor_note: null,
    memo_price: null,
    memo_price_currency: null,
    memo_price_as_of: null,
  }

  assert.equal(publicationHtmlUrlForKind(publication, 'resumen'), 'https://blob/resumen.html')
  assert.equal(publicationHtmlUrlForKind(publication, 'memo'), 'https://blob/memo.html')
  assert.equal(publicationHtmlUrlForKind(publication, 'tesis-completa'), null)
})

test('publicationHtmlStoragePathForKind resolves private blob paths before urls', () => {
  const publication = {
    run_id: 'RUN-1',
    ticker: 'NOW',
    company_name: 'ServiceNow',
    public_slug: '2026/now/RUN-1',
    published_at: '2026-06-16T20:00:00.000Z',
    publishability_status: 'Publicado',
    confidence: null,
    system_label: 'Comprar',
    memo_long_path: 'publications/2026/now/RUN-1/memo.html',
    memo_short_path: 'publications/2026/now/RUN-1/resumen.html',
    memo_full_path: null,
    memo_long_url: 'https://blob/memo.html',
    memo_short_url: 'https://blob/resumen.html',
    memo_full_url: 'https://blob/tesis-completa.html',
    metadata_url: 'https://blob/metadata.json',
    editor_note: null,
    memo_price: null,
    memo_price_currency: null,
    memo_price_as_of: null,
  }

  assert.equal(
    publicationHtmlStoragePathForKind(publication, 'resumen'),
    'publications/2026/now/RUN-1/resumen.html',
  )
  assert.equal(
    publicationHtmlStoragePathForKind(publication, 'memo'),
    'publications/2026/now/RUN-1/memo.html',
  )
  assert.equal(
    publicationHtmlStoragePathForKind(publication, 'tesis-completa'),
    null,
  )
})

test('sanitizePublicationsFeedForClient removes blob storage urls from the client feed', () => {
  const feed = sanitizePublicationsFeedForClient({
    schema_version: 1,
    updated_at: '2026-06-16T21:00:00.000Z',
    publications: [
      {
        run_id: 'RUN-1',
        ticker: 'NOW',
        company_name: 'ServiceNow',
        public_slug: '2026/now/RUN-1',
        published_at: '2026-06-16T20:00:00.000Z',
        publishability_status: 'Publicado',
        confidence: null,
        system_label: 'Comprar',
        memo_long_path: 'publications/2026/now/RUN-1/memo.html',
        memo_short_path: 'publications/2026/now/RUN-1/resumen.html',
        memo_full_path: 'publications/2026/now/RUN-1/tesis-completa.html',
        memo_long_url: 'https://store.public.blob.vercel-storage.com/publications/2026/now/RUN-1/memo.html',
        memo_short_url: 'https://store.public.blob.vercel-storage.com/publications/2026/now/RUN-1/resumen.html',
        memo_full_url: 'https://store.public.blob.vercel-storage.com/publications/2026/now/RUN-1/tesis-completa.html',
        metadata_url: 'https://store.public.blob.vercel-storage.com/publications/2026/now/RUN-1/metadata.json',
        editor_note: null,
        memo_price: null,
        memo_price_currency: null,
        memo_price_as_of: null,
      },
    ],
  })

  assert.equal(feed.publications[0].memo_short_url, '/api/publications/view?slug=2026%2Fnow%2FRUN-1&kind=resumen')
  assert.equal(feed.publications[0].memo_long_url, '/api/publications/view?slug=2026%2Fnow%2FRUN-1&kind=memo')
  assert.equal(
    feed.publications[0].memo_full_url,
    '/api/publications/view?slug=2026%2Fnow%2FRUN-1&kind=tesis-completa',
  )
  assert.equal(feed.publications[0].metadata_url, null)
  assert.equal('memo_long_path' in feed.publications[0], false)
})

test('inlineHtmlDocumentHeaders forces browser rendering instead of attachment download', () => {
  assert.deepEqual(inlineHtmlDocumentHeaders('memo.html'), {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
    'cache-control': 'private, no-store',
    'content-security-policy': "default-src 'none'; script-src 'none'; connect-src 'none'; img-src data: https:; style-src 'unsafe-inline'; font-src data: https:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; sandbox allow-downloads",
    'content-disposition': 'inline; filename="memo.html"',
    'content-type': 'text/html; charset=utf-8',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    'x-robots-tag': 'noindex',
  })
})

test('removePublication removes the slug from the public feed', () => {
  const feed = removePublication({
    schema_version: 1,
    updated_at: 'old',
    publications: [
      {
        run_id: 'RUN-1',
        ticker: 'NOW',
        company_name: 'ServiceNow',
        public_slug: '2026/now/RUN-1',
        published_at: '2026-06-16T20:00:00.000Z',
        publishability_status: 'Publicado',
        confidence: null,
        system_label: 'Comprar',
        memo_long_url: 'https://blob/memo.html',
        memo_short_url: 'https://blob/resumen.html',
        memo_full_url: 'https://blob/tesis-completa.html',
        metadata_url: 'https://blob/metadata.json',
        editor_note: null,
        memo_price: null,
        memo_price_currency: null,
        memo_price_as_of: null,
      },
    ],
  }, '2026/now/RUN-1', '2026-06-16T21:00:00.000Z')

  assert.equal(feed.updated_at, '2026-06-16T21:00:00.000Z')
  assert.deepEqual(feed.publications, [])
})

test('publicationsFeedFromMetadata builds the feed from per-publication blobs', () => {
  const feed = publicationsFeedFromMetadata([
    {
      run_id: 'RUN-OLD',
      ticker: 'MSFT',
      company_name: 'Microsoft',
      public_slug: '2026/msft/RUN-OLD',
      published_at: '2026-06-15T20:00:00.000Z',
      publishability_status: 'Publicado',
      confidence: null,
      system_label: 'Comprar',
      memo_long_url: 'https://blob/memo.html',
      memo_short_url: 'https://blob/resumen.html',
      memo_full_url: null,
      metadata_url: 'https://blob/old/metadata.json',
      editor_note: null,
      memo_price: null,
      memo_price_currency: null,
      memo_price_as_of: null,
    },
    {
      run_id: 'RUN-NEW',
      ticker: 'NOW',
      company_name: 'ServiceNow',
      public_slug: '2026/now/RUN-NEW',
      published_at: '2026-06-16T20:00:00.000Z',
      publishability_status: 'Publicado',
      confidence: null,
      system_label: 'Comprar',
      memo_long_url: 'https://blob/memo.html',
      memo_short_url: 'https://blob/resumen.html',
      memo_full_url: null,
      metadata_url: 'https://blob/new/metadata.json',
      editor_note: null,
      memo_price: null,
      memo_price_currency: null,
      memo_price_as_of: null,
    },
  ])

  assert.equal(feed.updated_at, '2026-06-16T20:00:00.000Z')
  assert.deepEqual(feed.publications.map((item) => item.run_id), ['RUN-NEW', 'RUN-OLD'])
})

test('parseDeleteBody requires a public slug', () => {
  assert.deepEqual(parseDeleteBody({ public_slug: '2026/now/RUN-1' }), {
    public_slug: '2026/now/RUN-1',
  })
  assert.throws(() => parseDeleteBody({}), /public_slug is required/)
})
