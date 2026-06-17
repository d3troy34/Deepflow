import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  formatPublicationDate,
  formatPublicationPrice,
  publicationDocumentLinks,
} from '../app/src/lib/publicationPresentation.ts'

test('formatPublicationDate renders stable dd/mm/yyyy dates', () => {
  assert.equal(formatPublicationDate('2026-06-17T03:55:24.000Z'), '17/06/2026')
  assert.equal(formatPublicationDate('not-a-date'), 'n/d')
})

test('formatPublicationPrice uses USD symbol and keeps two decimals', () => {
  assert.equal(formatPublicationPrice(101.333, 'USD'), '$101.33')
  assert.equal(formatPublicationPrice(88, 'EUR'), 'EUR 88.00')
  assert.equal(formatPublicationPrice(null, 'USD'), 'n/d')
})

test('publicationDocumentLinks returns separated HTML document destinations', () => {
  assert.deepEqual(
    publicationDocumentLinks({
      memo_short_url: 'https://example.com/resumen.html',
      memo_long_url: 'https://example.com/memo.html',
      memo_full_url: 'https://example.com/tesis-completa.html',
    }),
    [
      { label: 'Resumen', url: 'https://example.com/resumen.html' },
      { label: 'Memo', url: 'https://example.com/memo.html' },
      { label: 'Tesis completa', url: 'https://example.com/tesis-completa.html' },
    ],
  )
})
