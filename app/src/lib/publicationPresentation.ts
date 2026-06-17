export type PublicationDocumentLink = {
  label: string
  url: string
}

type PublicationDocumentSource = {
  public_slug: string
  memo_short_url?: string | null
  memo_long_url?: string | null
  memo_full_url?: string | null
}

type PublicationDocumentKind = 'resumen' | 'memo' | 'tesis-completa'

export function formatPublicationDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return 'n/d'

  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

export function formatPublicationPrice(
  value: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (value == null) return 'n/d'

  const code = (currency || 'USD').trim().toUpperCase()
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return code === 'USD' ? `$${formatted}` : `${code} ${formatted}`
}

export function publicationDocumentLinks(
  publication: PublicationDocumentSource,
): PublicationDocumentLink[] {
  return [
    {
      label: 'Resumen',
      url: documentViewerUrl(publication.public_slug, 'resumen'),
      available: publication.memo_short_url,
    },
    {
      label: 'Memo',
      url: documentViewerUrl(publication.public_slug, 'memo'),
      available: publication.memo_long_url,
    },
    {
      label: 'Tesis completa',
      url: documentViewerUrl(publication.public_slug, 'tesis-completa'),
      available: publication.memo_full_url,
    },
  ]
    .filter((link) => Boolean(link.available))
    .map(({ label, url }) => ({ label, url }))
}

function documentViewerUrl(publicSlug: string, kind: PublicationDocumentKind): string {
  const params = new URLSearchParams({ slug: publicSlug, kind })
  return `/api/publications/view?${params.toString()}`
}
