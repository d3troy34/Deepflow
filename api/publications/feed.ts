import {
  emptyFeed,
  errorResponse,
  jsonResponse,
  normalizeFeed,
  optionsResponse,
  readPublicationIndexBlob,
  sanitizePublicationsFeedForClient,
  type PublicationsFeed,
} from '../_publicationTypes.js'
import { sendResponse, type NodeRequest, type NodeResponse } from '../_node.js'
import { assertRateLimit } from '../_rateLimit.js'
import { assertSupabaseUser } from '../_supabaseAuth.js'

export default async function handler(request: NodeRequest, response: NodeResponse): Promise<void> {
  if (request.method === 'OPTIONS') return sendResponse(response, optionsResponse())
  if (request.method !== 'GET') return sendResponse(response, jsonResponse({ error: 'method not allowed' }, 405))

  try {
    assertRateLimit(request, { scope: 'publication-read', limit: 240, windowMs: 60_000 })
    await assertSupabaseUser(request)
    return sendResponse(response, jsonResponse(sanitizePublicationsFeedForClient(await readFeed())))
  } catch (error) {
    return sendResponse(response, errorResponse(error))
  }
}

async function readFeed(): Promise<PublicationsFeed> {
  const raw = await readPublicationIndexBlob()
  return raw === null ? emptyFeed() : normalizeFeed(raw)
}
