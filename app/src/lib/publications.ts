export interface PublicPublication {
  run_id: string
  ticker: string
  company_name: string | null
  public_slug: string
  published_at: string
  publishability_status: string
  confidence: string | null
  system_label: string | null
  memo_long_url: string
  memo_short_url: string
  memo_full_url: string | null
  metadata_url: string | null
  memo_price: number | null
  memo_price_currency: string | null
  memo_price_as_of: string | null
}

export interface PublicationsFeed {
  schema_version: 1
  updated_at: string | null
  publications: PublicPublication[]
}

export async function fetchPublicationsFromIndex(
  indexUrl: string,
  init: RequestInit = {},
): Promise<PublicPublication[]> {
  const response = await fetch(indexUrl, { ...init, cache: 'no-store' })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  const raw = (await response.json()) as unknown
  const feed = normalizeFeed(raw)
  return feed.publications.map((item) => normalizePublication(item, indexUrl))
}

function normalizeFeed(raw: unknown): PublicationsFeed {
  if (!raw || typeof raw !== 'object') {
    return { schema_version: 1, updated_at: null, publications: [] }
  }
  const obj = raw as Partial<PublicationsFeed> & { items?: PublicPublication[] }
  const publications = Array.isArray(obj.publications)
    ? obj.publications
    : Array.isArray(obj.items)
      ? obj.items
      : []
  return {
    schema_version: 1,
    updated_at: typeof obj.updated_at === 'string' ? obj.updated_at : null,
    publications,
  }
}

function normalizePublication(item: PublicPublication, indexUrl: string): PublicPublication {
  return {
    ...item,
    company_name: item.company_name ?? null,
    confidence: item.confidence ?? null,
    system_label: item.system_label ?? null,
    metadata_url: item.metadata_url ? absoluteUrl(item.metadata_url, indexUrl) : null,
    memo_long_url: absoluteUrl(item.memo_long_url, indexUrl),
    memo_short_url: absoluteUrl(item.memo_short_url, indexUrl),
    memo_full_url: item.memo_full_url ? absoluteUrl(item.memo_full_url, indexUrl) : null,
    memo_price: item.memo_price ?? null,
    memo_price_currency: item.memo_price_currency ?? null,
    memo_price_as_of: item.memo_price_as_of ?? null,
  }
}

function absoluteUrl(value: string, indexUrl: string): string {
  if (/^https?:\/\//i.test(value)) return value
  return new URL(value, indexUrl).toString()
}
