import { del, put } from '@vercel/blob'
import {
  INDEX_PATH,
  emptyFeed,
  errorResponse,
  jsonResponse,
  normalizeFeed,
  optionsResponse,
  parseDeleteBody,
  publicationHtmlPath,
  publicationMetadataPath,
  publicationPdfPath,
  readPublicJsonBlob,
  removePublication,
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
    const body = parseDeleteBody(await readJsonBody(request))
    const feed = await readFeed()
    const existing = feed.publications.find((item) => item.public_slug === body.public_slug)
    const deleteTargets = new Set<string>([
      publicationHtmlPath(body.public_slug, 'memo_long'),
      publicationHtmlPath(body.public_slug, 'memo_short'),
      publicationHtmlPath(body.public_slug, 'memo_full'),
      publicationPdfPath(body.public_slug, 'memo_long'),
      publicationPdfPath(body.public_slug, 'memo_short'),
      publicationMetadataPath(body.public_slug),
    ])
    if (existing) {
      deleteTargets.add(existing.memo_long_url)
      deleteTargets.add(existing.memo_short_url)
      if (existing.memo_full_url) deleteTargets.add(existing.memo_full_url)
      if (existing.metadata_url) deleteTargets.add(existing.metadata_url)
    }

    await del([...deleteTargets])

    const nextFeed = removePublication(feed, body.public_slug)
    const indexBlob = await put(INDEX_PATH, JSON.stringify(nextFeed, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    })

    return sendResponse(response, jsonResponse({
      deleted: true,
      public_slug: body.public_slug,
      index_url: indexBlob.url,
    }, 200, 'write'))
  } catch (error) {
    return sendResponse(response, errorResponse(error, 'write'))
  }
}

async function readFeed(): Promise<PublicationsFeed> {
  const raw = await readPublicJsonBlob(INDEX_PATH)
  return raw === null ? emptyFeed() : normalizeFeed(raw)
}
