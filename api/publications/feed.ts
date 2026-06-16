import {
  INDEX_PATH,
  emptyFeed,
  errorResponse,
  jsonResponse,
  normalizeFeed,
  optionsResponse,
  readPublicJsonBlob,
  type PublicationsFeed,
} from '../_publicationTypes.js'
import { sendResponse, type NodeRequest, type NodeResponse } from '../_node.js'
import { assertSupabaseUser } from '../_supabaseAuth.js'

export default async function handler(request: NodeRequest, response: NodeResponse): Promise<void> {
  if (request.method === 'OPTIONS') return sendResponse(response, optionsResponse())
  if (request.method !== 'GET') return sendResponse(response, jsonResponse({ error: 'method not allowed' }, 405))

  try {
    await assertSupabaseUser(request)
    return sendResponse(response, jsonResponse(await readFeed()))
  } catch (error) {
    return sendResponse(response, errorResponse(error))
  }
}

async function readFeed(): Promise<PublicationsFeed> {
  const raw = await readPublicJsonBlob(INDEX_PATH)
  return raw === null ? emptyFeed() : normalizeFeed(raw)
}
