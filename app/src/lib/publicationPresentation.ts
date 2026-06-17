export type PublicationDocumentLink = {
  label: string
  url: string
}

type PublicationDocumentSource = {
  memo_short_url?: string | null
  memo_long_url?: string | null
  memo_full_url?: string | null
}

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
    { label: 'Resumen', url: publication.memo_short_url },
    { label: 'Memo', url: publication.memo_long_url },
    { label: 'Tesis completa', url: publication.memo_full_url },
  ].filter((link): link is PublicationDocumentLink => Boolean(link.url))
}
