import yahooFinance from 'yahoo-finance2'
import { corsHeaders, jsonResponse, optionsResponse } from '../_publicationTypes.js'
import { nodeRequestUrl, sendResponse, type NodeRequest, type NodeResponse } from '../_node.js'

const CACHE_SECONDS = 120

export default async function handler(request: NodeRequest, response: NodeResponse): Promise<void> {
  if (request.method === 'OPTIONS') return sendResponse(response, optionsResponse())
  if (request.method !== 'GET') return sendResponse(response, jsonResponse({ error: 'method not allowed' }, 405))

  const url = new URL(nodeRequestUrl(request))
  const tickersParam = url.searchParams.get('tickers') ?? ''
  const tickers = tickersParam
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 20)

  if (tickers.length === 0) {
    return sendResponse(response, jsonResponse({ prices: {} }))
  }

  const prices: Record<string, number | null> = {}
  await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const quote = (await yahooFinance.quote(ticker)) as { regularMarketPrice?: number | null } | null
        prices[ticker] = quote?.regularMarketPrice ?? null
      } catch {
        prices[ticker] = null
      }
    }),
  )

  return sendResponse(response, new Response(JSON.stringify({ prices }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json',
      'cache-control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30`,
    },
  }))
}
