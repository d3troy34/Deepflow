import {
  HTML_MAX_BYTES,
  INDEX_PATH,
  HttpError,
  emptyFeed,
  errorResponse,
  inlineHtmlDocumentHeaders,
  jsonResponse,
  normalizeFeed,
  optionsResponse,
  parsePublishedHtmlDocumentRequest,
  publicationHtmlFilename,
  publicationHtmlUrlForKind,
  readPublicJsonBlob,
} from '../_publicationTypes.js'
import { nodeRequestUrl, sendResponse, type NodeRequest, type NodeResponse } from '../_node.js'

export default async function handler(request: NodeRequest, response: NodeResponse): Promise<void> {
  if (request.method === 'OPTIONS') return sendResponse(response, optionsResponse())
  if (request.method !== 'GET') {
    return sendResponse(response, jsonResponse({ error: 'method not allowed' }, 405))
  }

  try {
    const { public_slug: publicSlug, kind } = parsePublishedHtmlDocumentRequest(nodeRequestUrl(request))
    const rawFeed = await readPublicJsonBlob(INDEX_PATH)
    const feed = rawFeed === null ? emptyFeed() : normalizeFeed(rawFeed)
    const publication = feed.publications.find((item) => item.public_slug === publicSlug)
    if (!publication) throw new HttpError(404, 'publication not found')

    const documentUrl = publicationHtmlUrlForKind(publication, kind)
    if (!documentUrl) throw new HttpError(404, 'document not found')

    const upstream = await fetch(documentUrl, {
      cache: 'no-store',
      headers: { accept: 'text/html' },
    })
    if (!upstream.ok) {
      throw new HttpError(502, `failed to read document: ${upstream.status}`)
    }

    const contentType = upstream.headers.get('content-type')?.toLowerCase() ?? ''
    if (!contentType.includes('text/html')) {
      throw new HttpError(502, 'document is not HTML')
    }

    const body = await upstream.arrayBuffer()
    if (body.byteLength > HTML_MAX_BYTES) throw new HttpError(502, 'document exceeds size limit')

    return sendResponse(response, new Response(body, {
      headers: inlineHtmlDocumentHeaders(publicationHtmlFilename(kind)),
    }))
  } catch (error) {
    return sendResponse(response, errorResponse(error))
  }
}
