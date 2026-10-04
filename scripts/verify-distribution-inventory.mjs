import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { distributionInventory, inventoryLabel, inventoryLicenseTarget, incompleteNotices } from './third-party-distribution.mjs'
import { embeddedSourceNotices, embeddedNoticeTarget } from './embedded-source-notices.mjs'

const root = resolve(import.meta.dirname, '..')
const drift = 'Third-party redistribution inventory needs review'

export function verifySourceMapInventory(read = path => readFileSync(resolve(root, path), 'utf8')) {
  for (const name of ['valine', 'twikoo', '@waline/client', 'leancloud-storage', '@cap.js/widget', '@cap.js/wasm', 'pako', '@fortawesome/fontawesome-free']) {
    const manifest = JSON.parse(read(`node_modules/${name}/package.json`))
    assert.ok(distributionInventory.some(item => item.name === name && item.version === manifest.version && item.license === manifest.license), `${drift}: direct redistributed ${name} metadata changed`)
  }
  const prism = JSON.parse(read('node_modules/prismjs/package.json'))
  assert.ok(distributionInventory.some(item => item.name === 'prismjs' && item.version === prism.version && item.license === prism.license && item.origin.includes('copied')), `${drift}: copied dynamic Prism metadata changed`)
  const maps = new Map()
  for (const item of distributionInventory.filter(item => item.sourceMap)) {
    if (!maps.has(item.sourceMap)) maps.set(item.sourceMap, JSON.parse(read(item.sourceMap)))
    const map = maps.get(item.sourceMap)
    const entries = map.sources.flatMap((source, index) => source.startsWith(item.sourcePrefix) ? [[source, map.sourcesContent[index]]] : [])
    assert.ok(entries.length, `${drift}: ${item.origin} no longer identifies ${item.name}`)
    assert.equal(createHash('sha256').update(JSON.stringify(entries)).digest('hex'), item.sourceHash, `${drift}: embedded ${item.name} source/license provenance drifted`)
  }
  for (const [path, map] of maps) {
    const covered = distributionInventory.filter(item => item.sourceMap === path)
    for (const source of map.sources.filter(source => /\/node_modules\/|\/~\//.test(source))) {
      assert.ok(covered.some(item => source.startsWith(item.sourcePrefix)), `${drift}: uninventoried source ${source}`)
    }
  }
  const waline = JSON.parse(read('node_modules/@waline/client/dist/waline.js.map'))
  const versioned = new Map([
    ['vue', '3.5.35'], ['@vue/shared', '3.5.35'], ['@vue/reactivity', '3.5.35'],
    ['@vue/runtime-core', '3.5.35'], ['@vue/runtime-dom', '3.5.35'],
    ['@vueuse/core', '14.3.0'], ['@vueuse/shared', '14.3.0'], ['marked', '18.0.4'],
    ['marked-highlight', '2.2.4'], ['recaptcha-v3', '1.11.3'], ['autosize', '6.0.1'],
  ])
  for (const [name, version] of versioned) {
    const inventoryName = name.startsWith('@vue/') || name === 'vue' ? 'Vue' : name
    assert.ok(distributionInventory.some(item => item.name === inventoryName && item.version === version && /waline/i.test(item.origin)), `${drift}: ${name} artifact version differs from inventory`)
    const paths = waline.sources.filter(source => source.includes(`/node_modules/${name}/`))
    assert.ok(paths.length, `${drift}: Waline embedded ${name} disappeared`)
    assert.ok(paths.every(source => source.includes(`/${version}/`)), `${drift}: Waline embedded ${name} version changed`)
  }
  for (const source of waline.sources.filter(source => source.includes('/node_modules/'))) {
    assert.ok([...versioned.keys()].some(name => source.includes(`/node_modules/${name}/`)), `${drift}: new Waline component ${source}`)
  }
  for (const name of ['twikoo.min.js', 'twikoo.all.min.js']) {
    const text = read(`node_modules/twikoo/dist/${name}`)
    assert.match(text, /\.version=`3\.4\.15`/, `${drift}: Twikoo DOMPurify version changed`)
    assert.ok(text.includes('3.5.43'), `${drift}: Twikoo Vue marker changed`)
  }
  for (const [name, version] of [['DOMPurify', '3.4.15'], ['Vue', '3.5.43'], ['prismjs', '1.30.0'], ['marked', '18.0.13'], ['blueimp-md5', '2.19.0']]) {
    assert.ok(distributionInventory.some(item => item.name === name && item.version === version && /twikoo/i.test(item.origin)), `${drift}: Twikoo ${name} provenance differs from inventory`)
  }
  assert.ok(read('node_modules/twikoo/dist/twikoo.all.min.js').includes('3.10.0'), `${drift}: CloudBase marker changed`)
  const wasm = readFileSync(resolve(root, 'node_modules/@cap.js/wasm/browser/hashwx.wasm'))
  assert.equal(createHash('sha256').update(wasm).digest('hex'), 'b1a0dbb3ef444d3c7069e0a5e0a0273ffa4cf8fef62cbbe43761c02f7cd6aff5', `${drift}: hashwx source provenance changed`)
  const cargo = read('node_modules/@cap.js/wasm/rust/Cargo.lock')
  for (const name of ['wasm-bindgen', 'cfg-if', 'once_cell']) {
    const item = distributionInventory.find(item => item.name === name)
    assert.ok(cargo.includes(`name = "${name}"\nversion = "${item.version}"`), `${drift}: Cap runtime binding ${name} changed`)
  }
}

export function verifyDeployableNotices(dist = resolve(root, 'dist')) {
  const lines = readFileSync(resolve(dist, 'THIRD_PARTY_NOTICES.txt'), 'utf8').split('\n')
  for (const item of distributionInventory) {
    const label = inventoryLabel(item)
    const targets = item.licenseSources.map(source => inventoryLicenseTarget(item, source))
    const embedded = embeddedSourceNotices(item)
    if (embedded) targets.push(embeddedNoticeTarget(item))
    const prefix = `${label} | ${item.license} | ${targets.join(', ')} | ${item.origin};`
    assert.ok(lines.some(line => line.startsWith(prefix)), `${label} identity/version/license/provenance missing from deployable notices`)
    if (item.upstreamLicenseTextSupplied === false) {
      assert.ok(item.licenseSources.some(source => source.endsWith('package.json')), `${label} original upstream declaration must be retained`)
      assert.ok(item.licenseSources.some(source => source.endsWith(`/${item.license}.txt`)), `${label} normative license reference must accompany the declaration`)
      assert.ok(item.licenseSources.some(source => source.endsWith('/README.txt')), `${label} reference provenance/copyright caveat must be retained`)
    }
    for (let index = 0; index < item.licenseSources.length; index++) {
      assert.ok(existsSync(resolve(dist, targets[index])), `${label} deployable material missing`)
      const source = item.licenseSources[index]
      const expected = source.endsWith('.b64') ? Buffer.from(readFileSync(resolve(root, source), 'utf8'), 'base64') : readFileSync(resolve(root, source))
      assert.deepEqual(readFileSync(resolve(dist, targets[index])), expected, `${label} license/source material was altered`)
    }
    if (embedded) assert.deepEqual(readFileSync(resolve(dist, embeddedNoticeTarget(item))), embedded, `${label} embedded copyright notices were altered/omitted`)
  }
  const hashwx = distributionInventory.find(item => item.name === 'hashwx')
  const source = hashwx.licenseSources.find(source => source.endsWith('.b64'))
  const archive = inventoryLicenseTarget(hashwx, source)
  assert.ok(archive.endsWith('.tar.gz'), 'Deployable corresponding source must be a real gzip archive, not base64 text')
  const tar = gunzipSync(readFileSync(resolve(dist, archive))).toString('utf8')
  for (const path of ['CMakeLists.txt', 'src/compiler_wasm.c', 'src/hashwx.c', 'LICENSE']) assert.ok(tar.includes(path), `hashwx corresponding source lacks ${path}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifySourceMapInventory()
  verifyDeployableNotices()
  console.log(`Verified ${distributionInventory.length} artifact-oriented inventory entries and verbatim deployable material.`)
  if (process.argv.includes('--require-complete')) {
    assert.equal(incompleteNotices.length, 0, `R1 acceptance blocked: incomplete upstream notice/source material for ${incompleteNotices.map(inventoryLabel).join(', ')}`)
  }
}
