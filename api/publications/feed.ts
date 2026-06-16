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

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return optionsResponse()
  if (request.method !== 'GET') return jsonResponse({ error: 'method not allowed' }, 405)

  try {
    return jsonResponse(await readFeed())
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
