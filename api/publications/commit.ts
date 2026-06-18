import { put } from '@vercel/blob'
import {
  INDEX_PATH,
  emptyFeed,
  errorResponse,
  jsonResponse,
  normalizeFeed,
  optionsResponse,
  parseCommitBody,
  publicationMetadataPath,
  readPublicationIndexBlob,
  upsertPublication,
  type PublicationsFeed,
} from '../_publicationTypes.js'
import { readJsonBody, sendResponse, type NodeRequest, type NodeResponse } from '../_node.js'
import { assertRateLimit } from '../_rateLimit.js'
import { assertPublishTokenOrSupabaseAdmin } from '../_supabaseAuth.js'

export default async function handler(request: NodeRequest, response: NodeResponse): Promise<void> {
  if (request.method === 'OPTIONS') return sendResponse(response, optionsResponse('write'))
  if (request.method !== 'POST') {
    return sendResponse(response, jsonResponse({ error: 'method not allowed' }, 405, 'write'))
  }

  try {
    assertRateLimit(request, { scope: 'publication-write', limit: 60, windowMs: 60_000 })
    await assertPublishTokenOrSupabaseAdmin(request)
    const body = parseCommitBody(await readJsonBody(request))
    const publishedAt = new Date().toISOString()
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
      memo_long_url: body.memo_long_url,
      memo_short_url: body.memo_short_url,
      memo_full_url: null,
      metadata_url: null,
      metadata_path: metadataPath,
      editor_note: body.editor_note,
      memo_price: body.memo_price,
      memo_price_currency: body.memo_price_currency,
      memo_price_as_of: body.memo_price_as_of,
    }

    const metadataBlob = await put(metadataPath, JSON.stringify(publication, null, 2), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    })
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
