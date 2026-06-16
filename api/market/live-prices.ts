import yahooFinance from 'yahoo-finance2'
import { corsHeaders, jsonResponse, optionsResponse } from '../_publicationTypes.js'

const CACHE_SECONDS = 120

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return optionsResponse()
  if (request.method !== 'GET') return jsonResponse({ error: 'method not allowed' }, 405)

  const url = new URL(request.url)
  const tickersParam = url.searchParams.get('tickers') ?? ''
  const tickers = tickersParam
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 20)

  if (tickers.length === 0) {
    return jsonResponse({ prices: {} })
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

  return new Response(JSON.stringify({ prices }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json',
      'cache-control': `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=30`,
    },
  })
}
