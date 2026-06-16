import { BlobNotFoundError, get, put } from '@vercel/blob'
import {
  INDEX_PATH,
  assertPublishToken,
  emptyFeed,
  errorResponse,
  jsonResponse,
  normalizeFeed,
  optionsResponse,
  parseCommitBody,
  publicationMetadataPath,
  upsertPublication,
  type PublicationsFeed,
} from '../_publicationTypes.js'

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return optionsResponse()
  if (request.method !== 'POST') return jsonResponse({ error: 'method not allowed' }, 405)

  try {
    assertPublishToken(request)
    const body = parseCommitBody(await request.json())
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
      metadata_url: null,
      editor_note: body.editor_note,
      memo_price: body.memo_price,
      memo_price_currency: body.memo_price_currency,
      memo_price_as_of: body.memo_price_as_of,
    }

    const metadataBlob = await put(metadataPath, JSON.stringify(publication, null, 2), {
      access: 'public',
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    })
    const item = { ...publication, metadata_url: metadataBlob.url }
    const feed = upsertPublication(await readFeed(), item)
    const indexBlob = await put(INDEX_PATH, JSON.stringify(feed, null, 2), {
      access: 'public',
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    })

    return jsonResponse({
      publication: item,
      metadata_url: metadataBlob.url,
      index_url: indexBlob.url,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

async function readFeed(): Promise<PublicationsFeed> {
  try {
    const result = await get(INDEX_PATH, { access: 'public', useCache: false })
    if (!result || result.statusCode !== 200 || !result.stream) return emptyFeed()
    const raw = await new Response(result.stream).json()
    return normalizeFeed(raw)
  } catch (error) {
    if (error instanceof BlobNotFoundError) return emptyFeed()
    throw error
  }
}
