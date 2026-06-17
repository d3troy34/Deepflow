import { put } from '@vercel/blob'
import {
  INDEX_PATH,
  decodeHtmlGzipBase64,
  emptyFeed,
  errorResponse,
  jsonResponse,
  normalizeFeed,
  optionsResponse,
  parsePublishBody,
  publicationHtmlPath,
  publicationMetadataPath,
  readPublicationIndexBlob,
  upsertPublication,
  type PublicationsFeed,
} from '../_publicationTypes.js'
import { readJsonBody, sendResponse, type NodeRequest, type NodeResponse } from '../_node.js'
import { assertPublishTokenOrSupabaseAdmin } from '../_supabaseAuth.js'

export default async function handler(request: NodeRequest, response: NodeResponse): Promise<void> {
  if (request.method === 'OPTIONS') return sendResponse(response, optionsResponse('write'))
  if (request.method !== 'POST') {
    return sendResponse(response, jsonResponse({ error: 'method not allowed' }, 405, 'write'))
  }

  try {
    await assertPublishTokenOrSupabaseAdmin(request)
    const body = parsePublishBody(await readJsonBody(request))
    const memoLong = decodeHtmlGzipBase64(
      body.memo_long_html_gzip_base64,
      'memo_long_html_gzip_base64',
    )
    const memoShort = decodeHtmlGzipBase64(
      body.memo_short_html_gzip_base64,
      'memo_short_html_gzip_base64',
    )
    const memoFull = body.memo_full_html_gzip_base64
      ? decodeHtmlGzipBase64(body.memo_full_html_gzip_base64, 'memo_full_html_gzip_base64')
      : null
    const publishedAt = new Date().toISOString()
    const memoLongPath = publicationHtmlPath(body.public_slug, 'memo_long')
    const memoShortPath = publicationHtmlPath(body.public_slug, 'memo_short')
    const memoFullPath = memoFull ? publicationHtmlPath(body.public_slug, 'memo_full') : null

    const longBlob = await put(memoLongPath, memoLong, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: 'text/html; charset=utf-8',
      cacheControlMaxAge: 60,
    })
    const shortBlob = await put(memoShortPath, memoShort, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: 'text/html; charset=utf-8',
      cacheControlMaxAge: 60,
    })
    const fullBlob = memoFull
      ? await put(memoFullPath!, memoFull, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: 'text/html; charset=utf-8',
        cacheControlMaxAge: 60,
      })
      : null
    const metadataPath = publicationMetadataPath(body.public_slug)

    const publication = {
      run_id: body.run_id,
      ticker: body.ticker,
      company_name: body.company_name,
      public_slug: body.public_slug,
      published_at: publishedAt,
      publishability_status: body.publishability_status,
      confidence: body.confidence,
      system_label: body.system_label,
      memo_long_url: longBlob.url,
      memo_short_url: shortBlob.url,
      memo_full_url: fullBlob?.url ?? null,
      memo_long_path: memoLongPath,
      memo_short_path: memoShortPath,
      memo_full_path: memoFullPath,
      metadata_url: null,
      metadata_path: metadataPath,
      editor_note: body.editor_note,
      memo_price: body.memo_price,
      memo_price_currency: body.memo_price_currency,
      memo_price_as_of: body.memo_price_as_of,
    }

    const metadataBlob = await put(
      metadataPath,
      JSON.stringify(publication, null, 2),
      {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: 'application/json',
        cacheControlMaxAge: 60,
      },
    )
    const item = { ...publication, metadata_url: metadataBlob.url }
    const feed = upsertPublication(await readFeed(), item)
    const indexBlob = await put(INDEX_PATH, JSON.stringify(feed, null, 2), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    })

    return sendResponse(response, jsonResponse({
      publication: item,
      metadata_url: metadataBlob.url,
      index_url: indexBlob.url,
    }, 200, 'write'))
  } catch (error) {
    return sendResponse(response, errorResponse(error, 'write'))
  }
}

async function readFeed(): Promise<PublicationsFeed> {
  const raw = await readPublicationIndexBlob()
  return raw === null ? emptyFeed() : normalizeFeed(raw)
}
