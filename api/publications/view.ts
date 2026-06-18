import { get } from '@vercel/blob'
import {
  HTML_MAX_BYTES,
  HttpError,
  emptyFeed,
  errorResponse,
  inlineHtmlDocumentHeaders,
  jsonResponse,
  normalizeFeed,
  optionsResponse,
  parsePublishedHtmlDocumentRequest,
  publicationHtmlFilename,
  publicationHtmlStoragePathForKind,
  publicationHtmlUrlForKind,
  readPublicationIndexBlob,
} from '../_publicationTypes.js'
import { nodeRequestUrl, sendResponse, type NodeRequest, type NodeResponse } from '../_node.js'
import { assertRateLimit } from '../_rateLimit.js'
import { assertSupabaseUser } from '../_supabaseAuth.js'

export default async function handler(request: NodeRequest, response: NodeResponse): Promise<void> {
  if (request.method === 'OPTIONS') return sendResponse(response, optionsResponse())
  if (request.method !== 'GET') {
    return sendResponse(response, jsonResponse({ error: 'method not allowed' }, 405))
  }

  try {
    assertRateLimit(request, { scope: 'publication-read', limit: 240, windowMs: 60_000 })
    await assertSupabaseUser(request, { allowCookie: true })
    const { public_slug: publicSlug, kind } = parsePublishedHtmlDocumentRequest(nodeRequestUrl(request))
    const rawFeed = await readPublicationIndexBlob()
    const feed = rawFeed === null ? emptyFeed() : normalizeFeed(rawFeed)
    const publication = feed.publications.find((item) => item.public_slug === publicSlug)
    if (!publication) throw new HttpError(404, 'publication not found')

    const document = await readPublishedHtmlDocument(
      publicationHtmlStoragePathForKind(publication, kind),
      publicationHtmlUrlForKind(publication, kind),
    )
    if (!document) throw new HttpError(404, 'document not found')

    const contentType = document.contentType.toLowerCase()
    if (!contentType.includes('text/html')) {
      throw new HttpError(502, 'document is not HTML')
    }

    const body = document.body
    if (body.byteLength > HTML_MAX_BYTES) throw new HttpError(502, 'document exceeds size limit')

    return sendResponse(response, new Response(body, {
      headers: inlineHtmlDocumentHeaders(publicationHtmlFilename(kind)),
    }))
  } catch (error) {
    return sendResponse(response, errorResponse(error))
  }
}

async function readPublishedHtmlDocument(
  privatePath: string | null,
  fallbackUrl: string | null,
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  if (privatePath) {
    const result = await get(privatePath, {
      access: 'private',
      useCache: false,
    })
    if (result?.statusCode === 200 && result.stream) {
      return {
        body: await new Response(result.stream).arrayBuffer(),
        contentType: result.blob.contentType,
      }
    }
  }

  if (!fallbackUrl) return null
  const upstream = await fetch(fallbackUrl, {
    cache: 'no-store',
    headers: { accept: 'text/html' },
  })
  if (upstream.status === 404) return null
  if (!upstream.ok) throw new HttpError(502, `failed to read document: ${upstream.status}`)
  return {
    body: await upstream.arrayBuffer(),
    contentType: upstream.headers.get('content-type') ?? '',
  }
}
