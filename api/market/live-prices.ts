import YahooFinance from 'yahoo-finance2'
import { corsHeaders, errorResponse, jsonResponse, optionsResponse } from '../_publicationTypes.js'
import { nodeRequestUrl, sendResponse, type NodeRequest, type NodeResponse } from '../_node.js'
import { assertRateLimit } from '../_rateLimit.js'

const CACHE_SECONDS = 120
const yahoo = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

interface YahooQuote {
  regularMarketPrice?: number | null
  postMarketPrice?: number | null
  preMarketPrice?: number | null
  regularMarketPreviousClose?: number | null
}

export default async function handler(request: NodeRequest, response: NodeResponse): Promise<void> {
  if (request.method === 'OPTIONS') return sendResponse(response, optionsResponse())
  if (request.method !== 'GET') return sendResponse(response, jsonResponse({ error: 'method not allowed' }, 405))

  try {
    assertRateLimit(request, { scope: 'live-prices', limit: 120, windowMs: 60_000 })

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
          const quote = (await yahoo.quote(ticker)) as YahooQuote | null
          prices[ticker] = quotePrice(quote)
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
  } catch (error) {
    return sendResponse(response, errorResponse(error))
  }
}

function quotePrice(quote: YahooQuote | null): number | null {
  if (!quote) return null
  return firstFiniteNumber(
    quote.regularMarketPrice,
    quote.postMarketPrice,
    quote.preMarketPrice,
    quote.regularMarketPreviousClose,
  )
}

function firstFiniteNumber(...values: Array<number | null | undefined>): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return null
}
