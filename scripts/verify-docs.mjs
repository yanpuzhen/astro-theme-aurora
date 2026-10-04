import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { strict as assert } from 'node:assert'
import { join, relative, resolve } from 'node:path'

const root = resolve(new URL('../docs-site', import.meta.url).pathname)
const english = resolve(root, 'en')
const chinese = resolve(root, 'cn')
const intentionalEnglishOnly = new Set(['index.md'])

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? markdownFiles(path) : entry.name.endsWith('.md') ? [path] : []
  })
}

const englishPages = markdownFiles(english).map((path) => relative(english, path)).sort()
const chinesePages = new Set(markdownFiles(chinese).map((path) => relative(chinese, path)))
for (const page of englishPages) {
  if (intentionalEnglishOnly.has(page)) continue
  assert.ok(chinesePages.has(page), `Missing Chinese Docs counterpart: ${page}`)
}
for (const page of chinesePages) {
  assert.ok(englishPages.includes(page), `Missing English Docs counterpart: ${page}`)
}

const requiredPages = [
  'guide/getting-started.md', 'guide/configuration.md', 'guide/writing-content.md',
  'guide/internationalization.md', 'configs/general.md',
  'deploy/index.md', 'deploy/vercel.md', 'deploy/cloudflare-pages.md',
  'deploy/github-pages.md', 'deploy/domains-and-base.md',
  'comments/index.md', 'comments/giscus.md', 'comments/waline.md',
  'comments/twikoo.md', 'comments/valine.md', 'comments/gitalk-migration.md',
  'reference/frontmatter.md', 'reference/environment.md',
  'reference/seo-feeds.md', 'reference/troubleshooting.md',
  'upgrade/from-aurora-2.md',
]
for (const page of requiredPages) {
  assert.ok(englishPages.includes(page), `Missing English core Docs page: ${page}`)
  assert.ok(chinesePages.has(page), `Missing Chinese core Docs page: ${page}`)
}

const config = resolve(root, '.vitepress/config.mts')
assert.ok(existsSync(config), 'VitePress configuration is missing')
const configText = readFileSync(config, 'utf8')
assert.match(configText, /rewrites: \{ 'en\/:path\*': ':path\*' \}/, 'English canonical rewrite changed')

const sourceFiles = [resolve(root, 'index.md'), ...markdownFiles(english), ...markdownFiles(chinese)]
for (const localeRoot of [english, chinese]) {
  const guidance = readFileSync(resolve(localeRoot, 'guide/configuration.md'), 'utf8')
  const waline = readFileSync(resolve(localeRoot, 'comments/waline.md'), 'utf8')
  assert.match(guidance + waline, /@waline\/emojis@1\.1\.0[\s\S]*GPL-3\.0-or-later/)
  assert.doesNotMatch(guidance + waline, /GPL-3\.0-only|GPL-3\.0-or-later[^\n]*(?:incompatible|不兼容)/)
}
assert.doesNotMatch(readFileSync(resolve(root, '..', 'CHANGELOG.md'), 'utf8').split('## [3.0.0]')[0], /GPL-3\.0-only/)
const links = new Set()
for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(/(?<!!)\[[^\]]+\]\((\/(?!\/)[^\s)#]+)\/?(?:#[^)]*)?\)/g)) links.add(match[1])
}
for (const match of configText.matchAll(/link: '(\/(?!\/)[^']+)'/g)) links.add(match[1])
for (const link of links) {
  const normalized = link.replace(/\/$/, '')
  const relative = normalized === '/cn' ? '' : normalized.startsWith('/cn/') ? normalized.slice(4) : normalized.slice(1)
  const localeRoot = normalized.startsWith('/cn') ? chinese : english
  const target = relative ? resolve(localeRoot, `${relative}.md`) : resolve(root, normalized.startsWith('/cn') ? 'cn/index.md' : 'index.md')
  const indexTarget = relative ? resolve(localeRoot, relative, 'index.md') : target
  assert.ok(existsSync(target) || existsSync(indexTarget), `Broken Docs link: ${link}`)
}
console.log(`Verified bilingual Docs parity: ${englishPages.length} English and ${chinesePages.size} Chinese Markdown pages`)
