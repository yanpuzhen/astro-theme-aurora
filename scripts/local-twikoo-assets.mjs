import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
export const twikooAssetDirectory = '_astro/vendor/twikoo/2.0.8'

function replaceExactly(source, before, replacement, description) {
  const count = source.split(before).length - 1
  if (count !== 1) throw new Error(`Expected one ${description}; found ${count}`)
  return source.replace(before, () => replacement)
}

/** Return exact files served by both the static build and Astro's dev server. */
export function localTwikooAssets(base) {
  const prefix = `${base}${twikooAssetDirectory}/`
  const assets = new Map()
  const replacements = [
    ['String(i.config.EMOTION_CDN||`https://owo.imaegoo.com/owo.json`)', `String(${JSON.stringify(`${prefix}owo.json`)})`],
    ['`https://cdn.jsdmirror.com/npm/@cap.js/widget`', JSON.stringify(`${prefix}cap.min.js`)],
    ['`https://cdn.jsdelivr.net/npm/prismjs@1.28.0`', JSON.stringify(`${base}_astro/prismjs/1.28.0`)],
  ]
  for (const name of ['twikoo.min.js', 'twikoo.all.min.js']) {
    let source = readFileSync(resolve(root, 'node_modules/twikoo/dist', name), 'utf8')
    for (const [before, after] of replacements) {
      source = replaceExactly(source, before, after, `Twikoo 2.0.8 ${before} in ${name}`)
    }
    assets.set(name, source)
  }

  assets.set('owo.json', readFileSync(resolve(root, 'src/assets/twikoo-owo.json')))
  let cap = readFileSync(resolve(root, 'node_modules/@cap.js/widget/cap.min.js'), 'utf8')
  for (const [before, after] of [
    ['window.CAP_PAKO_URL||"https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako_inflate.min.js"', JSON.stringify(`${prefix}pako_inflate.min.js`)],
    ['window.CAP_CUSTOM_WASM_URL||`https://cdn.jsdelivr.net/npm/@cap.js/wasm@${e}/browser/cap_wasm_bg.wasm`', JSON.stringify(`${prefix}cap_wasm_bg.wasm`)],
    ['window.CAP_CUSTOM_HASHWX_URL||`https://cdn.jsdelivr.net/npm/@cap.js/wasm@${e}/browser/hashwx.wasm`', JSON.stringify(`${prefix}hashwx.wasm`)],
  ]) {
    cap = replaceExactly(cap, before, after, `Cap widget 0.1.58 ${before}`)
  }
  assets.set('cap.min.js', cap)
  for (const [name, source] of [
    ['cap_wasm_bg.wasm', 'node_modules/@cap.js/wasm/browser/cap_wasm_bg.wasm'],
    ['hashwx.wasm', 'node_modules/@cap.js/wasm/browser/hashwx.wasm'],
    ['pako_inflate.min.js', 'node_modules/pako/dist/pako_inflate.min.js'],
  ]) assets.set(name, readFileSync(resolve(root, source)))
  return assets
}
