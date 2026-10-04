import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { readBuildConfig } from './build-config.mjs'
import { verifySourceMapInventory, verifyDeployableNotices } from './verify-distribution-inventory.mjs'

const { cdn: mode } = readBuildConfig({ cwd: process.cwd() })
assert.ok(mode === 'en' || mode === 'cn')
const assets = readdirSync('dist/_astro')
for (const provider of ['valine', 'twikoo', 'twikoo-cloudbase', 'waline']) {
  assert.ok(assets.some((name) => new RegExp(`^${provider}\\.[^.]+\\.js$`).test(name)), `${provider} local chunk missing`)
}
assert.ok(assets.some((name) => /^waline\.[^.]+\.css$/.test(name)))
if (mode === 'cn') {
  for (const name of ['twikoo.min.js', 'twikoo.all.min.js', 'owo.json', 'cap.min.js', 'cap_wasm_bg.wasm', 'hashwx.wasm', 'pako_inflate.min.js']) {
    assert.ok(existsSync(`dist/_astro/vendor/twikoo/2.0.8/${name}`), `${name} missing`)
  }
  assert.ok(existsSync('dist/_astro/prismjs/1.28.0/components/prism-javascript.min.js'))
  for (const theme of ['prism.min.css', 'prism-okaidia.min.css', 'prism-tomorrow.min.css']) {
    assert.ok(existsSync(`dist/_astro/prismjs/1.28.0/themes/${theme}`), `${theme} missing`)
  }
} else {
  assert.ok(!existsSync('dist/_astro/prismjs/1.28.0'), 'EN build must not copy Prism runtime assets')
  assert.ok(!existsSync('dist/_astro/vendor/twikoo/2.0.8'), 'EN build must not copy Twikoo runtime assets')
}
verifySourceMapInventory()
verifyDeployableNotices()
const html = readFileSync('dist/index.html', 'utf8')
assert.doesNotMatch(html, /<(?:script|link)[^>]+(?:src|href)=["']https?:\/\/(?:unpkg\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com)/i)
console.log(`Verified ${mode.toUpperCase()} build artifacts and no public-CDN script/style tags in generated home page.`)
