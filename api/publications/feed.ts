import { BlobNotFoundError, get } from '@vercel/blob'
import {
  INDEX_PATH,
  emptyFeed,
  errorResponse,
  jsonResponse,
  normalizeFeed,
  optionsResponse,
  type PublicationsFeed,
} from '../_publicationTypes.js'
import { sendResponse, type NodeRequest, type NodeResponse } from '../_node.js'

export default async function handler(request: NodeRequest, response: NodeResponse): Promise<void> {
  if (request.method === 'OPTIONS') return sendResponse(response, optionsResponse())
  if (request.method !== 'GET') return sendResponse(response, jsonResponse({ error: 'method not allowed' }, 405))

  try {
    return sendResponse(response, jsonResponse(await readFeed()))
  } catch (error) {
    return sendResponse(response, errorResponse(error))
  }
}

async function readFeed(): Promise<PublicationsFeed> {
  try {
    const result = await get(INDEX_PATH, { access: 'public', useCache: false })
    if (!result || result.statusCode !== 200 || !result.stream) return emptyFeed()
    const raw = await new Response(result.stream).json()
    return normalizeFeed(raw)
  } catch (error) {
    if (error instanceof BlobNotFoundError || isMissingFeedBlobError(error)) return emptyFeed()
    throw error
  }
}

function isMissingFeedBlobError(error: unknown): boolean {
  return error instanceof Error && /Failed to fetch blob: 400 Bad Request/i.test(error.message)
}
