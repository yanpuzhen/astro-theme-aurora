import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { Script } from 'node:vm'
import { localTwikooAssets } from './local-twikoo-assets.mjs'
import { localCommentDevAsset, createLocalCommentAssetMiddleware } from './local-comment-assets.mjs'
import { readBuildConfig } from './build-config.mjs'
import { distributionInventory } from './third-party-distribution.mjs'
import { verifySourceMapInventory } from './verify-distribution-inventory.mjs'
import { AuroraConfigSchema } from '../src/lib/config-schema.ts'

for (const base of ['/tick`/', '/cash$&/', '/space%20ok/', '/uni-中文/', '/dollar$1/', '/double$$/']) {
  assert.equal(AuroraConfigSchema.safeParse({ site: { base } }).success, true, `Schema must accept tested base ${base}`)
  for (const [name, body] of localTwikooAssets(base)) {
    if (!name.endsWith('.js')) continue
    assert.doesNotThrow(() => new Script(body.toString(), { filename: name }), `${base} generated ${name} must parse`)
    if (/^twikoo/.test(name)) {
      for (const suffix of ['owo.json', 'cap.min.js']) assert.ok(body.includes(JSON.stringify(`${base}_astro/vendor/twikoo/2.0.8/${suffix}`)))
      assert.ok(body.includes(JSON.stringify(`${base}_astro/prismjs/1.28.0`)))
    }
    if (name === 'cap.min.js') {
      for (const suffix of ['pako_inflate.min.js', 'cap_wasm_bg.wasm', 'hashwx.wasm']) assert.ok(body.includes(JSON.stringify(`${base}_astro/vendor/twikoo/2.0.8/${suffix}`)))
    }
  }
}

const assets = localTwikooAssets('/')
for (const [path, mime] of [
  ['vendor/twikoo/2.0.8/twikoo.min.js', 'application/javascript; charset=utf-8'],
  ['vendor/twikoo/2.0.8/owo.json', 'application/json; charset=utf-8'],
  ['vendor/twikoo/2.0.8/cap_wasm_bg.wasm', 'application/wasm'],
  ['prismjs/1.28.0/components/prism-python.min.js', 'application/javascript; charset=utf-8'],
  ['prismjs/1.28.0/themes/prism-okaidia.min.css', 'text/css; charset=utf-8'],
]) assert.equal(localCommentDevAsset(`/_astro/${path}`, assets)?.contentType, mime)
const unsafe = [
  '/_astro/prismjs/1.28.0/../package.json',
  '/_astro/prismjs/1.28.0/%2e%2e/%2e%2e/package.json',
  '/_astro/prismjs/1.28.0/components/%2e%2e%2fpackage.json',
  '/_astro/prismjs/1.28.0/components/%2e%2e%5cpackage.json',
  '/%5fastro/prismjs/1.28.0/components/%2e%2e%2fpackage.json',
  '/_astro/prismjs/1.28.0/components/prism-python.min.js%00',
  '/_astro/prismjs/1.28.0/components/prism-python.min.css',
  '/_astro/prismjs/1.28.0/themes/prism-python.min.js',
  '/_astro/prismjs/1.28.0/components/%ZZ.js',
  '/_astro/vendor/twikoo/2.0.8/%2e%2e/%2e%2e/package.json',
  '/_astro/vendor/twikoo/2.0.8/../../../../package.json',
]
const middleware = createLocalCommentAssetMiddleware('/')
for (const url of unsafe) {
  assert.equal(localCommentDevAsset(url, assets), null, `Traversal/type boundary must be rejected: ${url}`)
  let fellThrough = false
  const response = { statusCode: 0, end() {} }
  middleware({ url }, response, () => { fellThrough = true })
  assert.equal(response.statusCode, 404)
  assert.equal(fellThrough, false, 'Invalid namespace request must not fall through to Vite filesystem serving')
}

const directory = mkdtempSync(join(tmpdir(), 'aurora-cdn-config-'))
try {
  const missing = readBuildConfig({ cwd: directory, env: { ASTRO_CONFIG_FILE: join(directory, 'missing.yml') } })
  assert.equal(missing.cdn, 'en')
  assert.deepEqual(missing.input, {})
  const configPath = join(directory, 'config.yml')
  for (const value of ['auto', 'zh-CN', 'true', 'false', '42', 'null', '[]', '{}', '""']) {
    writeFileSync(configPath, `site_meta:\n  cdn: ${value}\n`)
    assert.throws(() => readBuildConfig({ env: { ASTRO_CONFIG_FILE: configPath } }), /Invalid site_meta.cdn/)
  }
  for (const section of ['null', 'true', '42', '[]']) {
    writeFileSync(configPath, `site_meta: ${section}\n`)
    assert.throws(() => readBuildConfig({ env: { ASTRO_CONFIG_FILE: configPath } }), /Invalid site_meta/)
  }
  writeFileSync(configPath, 'private_key: [never-echo-this-secret\n')
  assert.throws(() => readBuildConfig({ env: { ASTRO_CONFIG_FILE: configPath } }), error => {
    assert.match(error.message, /invalid YAML syntax/)
    assert.doesNotMatch(error.message, /never-echo-this-secret/)
    return true
  })
  assert.throws(() => readBuildConfig({ env: { ASTRO_CONFIG_FILE: directory } }), error => error.code === 'EISDIR')
} finally {
  rmSync(directory, { recursive: true, force: true })
}

for (const name of ['DOMPurify', 'object-assign', 'is-buffer', 'Vue', '@fortawesome/fontawesome-free']) assert.ok(distributionInventory.some(item => item.name === name))
verifySourceMapInventory()
assert.throws(() => verifySourceMapInventory(path => readFileSync(path, 'utf8').replaceAll('3.5.35', '3.5.36')), /inventory needs review/i)
assert.throws(() => verifySourceMapInventory(path => readFileSync(path, 'utf8').replaceAll('.version=`3.4.15`', '.version=`3.4.16`')), /inventory needs review/i)
assert.throws(() => verifySourceMapInventory(path => readFileSync(path, 'utf8').replaceAll('object-assign/index.js', 'new-helper/index.js')), /inventory needs review/i)
// A known version/source drift must fail loudly, not silently retain obsolete notices.
console.log('R2/R3 namespace boundaries, R4 six schema-valid serialized bases, R5 strict helper fallback: PASS; inventory coverage is checked separately from complete license acceptance.')
