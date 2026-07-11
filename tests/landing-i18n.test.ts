import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import vm from 'node:vm'

const root = process.cwd()

class FakeElement {
  attributes = new Map<string, string>()
  textContent = ''
  innerHTML = ''
  content = ''

  constructor(attrs: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(attrs)) {
      this.attributes.set(key, value)
    }
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value)
    if (name === 'content') this.content = value
  }
}

class FakeDocument {
  documentElement = new FakeElement()
  title = ''
  textEls = [new FakeElement({ 'data-i18n': 'nav.product' })]
  htmlEls = [new FakeElement({ 'data-i18n-html': 'hero.title' })]
  attrEls = [new FakeElement({ 'data-i18n-attrs': 'aria-label:nav.aria;title:theme.toDark' })]
  langButtons = [
    new FakeElement({ 'data-lang-option': 'es' }),
    new FakeElement({ 'data-lang-option': 'en' }),
  ]
  metas = new Map<string, FakeElement>([
    ['meta[name="description"]', new FakeElement()],
    ['meta[property="og:title"]', new FakeElement()],
    ['meta[property="og:description"]', new FakeElement()],
  ])

  querySelectorAll(selector: string) {
    if (selector === '[data-i18n]') return this.textEls
    if (selector === '[data-i18n-html]') return this.htmlEls
    if (selector === '[data-i18n-attrs]') return this.attrEls
    if (selector === '[data-lang-option]') return this.langButtons
    return []
  }

  querySelector(selector: string) {
    return this.metas.get(selector) ?? null
  }
}

async function loadLandingI18n() {
  const source = await readFile(join(root, 'js', 'landing-i18n.js'), 'utf8')
  const sandbox: Record<string, unknown> = {
    console,
    globalThis: undefined,
  }
  sandbox.globalThis = sandbox
  vm.runInNewContext(source, sandbox, { filename: 'landing-i18n.js' })
  return sandbox.DeepFlowI18n as {
    applyLandingLanguage: (document: FakeDocument, lang: string) => void
    normalizeLanguage: (lang: string | null | undefined) => 'es' | 'en'
    t: (key: string, lang: string) => string
  }
}

test('landing markup exposes the language switch before the landing script', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8')

  assert.match(html, /id="language-toggle"/)
  assert.match(html, /data-lang-option="en"/)
  assert.match(html, /data-i18n-html="hero\.title"/)
  assert.match(html, /data-i18n="contact\.submit"/)
  assert.match(html, /class="skip-link"/)
  assert.match(html, /id="nav-toggle"/)
  assert.match(html, /class="hero-brief__stage"/)
  assert.match(html, /data-hero-brief-stage/)
  assert.match(html, /data-tab-index="01"/)
  assert.match(html, /data-scrub-accent=/)
  assert.match(html, /data-i18n="sample\.summary\.thesis"/)
  assert.match(html, /aria-controls="roadmap-body-1 roadmap-guard-1"/)
  assert.match(html, /data-roadmap-image="portfolio"/)
  assert.match(html, /data-roadmap-image="tracking"/)
  assert.match(html, /data-roadmap-image="macro"/)
  assert.match(html, /data-roadmap-image="execution"/)
  assert.doesNotMatch(html, /href="\/app\/"/)
  assert.doesNotMatch(html, /deepflow-evidence-optimized\.webp/)
  assert.doesNotMatch(html, /[—–]/)
  assert.match(html, /<script src="js\/landing-i18n\.js(?:\?[^\"]*)?"><\/script>\s*<script src="js\/main\.js(?:\?[^\"]*)?"><\/script>/)
})

test('landing i18n applies English text, attributes, and metadata', async () => {
  const i18n = await loadLandingI18n()
  const document = new FakeDocument()

  i18n.applyLandingLanguage(document, 'en-US')

  assert.equal(i18n.normalizeLanguage('en-US'), 'en')
  assert.equal(document.documentElement.getAttribute('lang'), 'en')
  assert.equal(document.textEls[0].textContent, 'Product')
  assert.match(document.htmlEls[0].innerHTML, /defensible thesis/)
  assert.equal(document.attrEls[0].getAttribute('aria-label'), 'Primary navigation')
  assert.equal(document.attrEls[0].getAttribute('title'), 'Switch to dark theme')
  assert.equal(document.langButtons[0].getAttribute('aria-pressed'), 'false')
  assert.equal(document.langButtons[1].getAttribute('aria-pressed'), 'true')
  assert.match(document.title, /auditable evidence/)
  assert.match(document.metas.get('meta[name="description"]')?.getAttribute('content') ?? '', /Turn a ticker/)
  assert.equal(i18n.t('contact.submit', 'en'), 'Request a sample')
})

test('landing translations cover every key used by the markup', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8')
  const source = await readFile(join(root, 'js', 'landing-i18n.js'), 'utf8')
  const i18n = await loadLandingI18n()
  const textKeys = [...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map((match) => match[1])
  const attributeKeys = [...html.matchAll(/data-i18n-attrs="([^"]+)"/g)].flatMap((match) =>
    match[1].split(';').map((pair) => pair.split(':').slice(1).join(':').trim()),
  )
  const keys = [...new Set([...textKeys, ...attributeKeys])]

  for (const lang of ['es', 'en']) {
    for (const key of keys) {
      assert.notEqual(i18n.t(key, lang), key, `missing ${lang} translation for ${key}`)
    }
  }

  assert.doesNotMatch(source, /[—–]/)
})

test('legal page exposes the same Spanish and English language control', async () => {
  const html = await readFile(join(root, 'legal.html'), 'utf8')

  assert.match(html, /id="language-toggle"/)
  assert.match(html, /data-lang-option="en"/)
  assert.match(html, /data-legal-i18n-root/)
  assert.match(html, /class="nav nav--legal"/)
  assert.match(html, /prefers-color-scheme: dark/)
  assert.match(html, /<script src="js\/legal-i18n\.js"><\/script>/)
})

test('app shell exposes a persisted language switch with English copy', async () => {
  const source = await readFile(join(root, 'app', 'src', 'App.tsx'), 'utf8')

  assert.match(source, /const APP_TEXT/)
  assert.match(source, /function LanguageToggle/)
  assert.match(source, /localStorage\.setItem\('df-lang'/)
  assert.match(source, /Research platform for institutional asset monitoring/)
  assert.match(source, /Terms/)
  assert.match(source, /Privacy/)
  assert.doesNotMatch(source, /\{t\('nav\.tracker'\)\}/)
})
