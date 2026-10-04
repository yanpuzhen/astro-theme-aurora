import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { localTwikooAssets, twikooAssetDirectory } from './local-twikoo-assets.mjs'
import { readBuildConfig } from './build-config.mjs'
import { distributionInventory, inventoryLabel, inventoryLicenseTarget, incompleteNotices } from './third-party-distribution.mjs'
import { embeddedSourceNotices, embeddedNoticeTarget } from './embedded-source-notices.mjs'

const root = resolve(import.meta.dirname, '..')
const { version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const { input, cdn } = readBuildConfig({ cwd: root })
const base = process.env.ASTRO_BASE || input.site?.base || '/'
const dist = resolve(root, 'dist')
rmSync(resolve(dist, '_licenses'), { recursive: true, force: true })
rmSync(resolve(dist, 'THIRD_PARTY_NOTICES.txt'), { force: true })

function copy(source, target) {
  const destination = resolve(dist, target)
  mkdirSync(dirname(destination), { recursive: true })
  const contents = source.endsWith('.b64') ? Buffer.from(readFileSync(resolve(root, source), 'utf8'), 'base64') : readFileSync(resolve(root, source))
  const previous = usedTargets.get(target)
  if (previous && !previous.equals(contents)) throw new Error(`Conflicting redistribution notice target: ${target}`)
  if (!previous) writeFileSync(destination, contents)
  usedTargets.set(target, contents)
}

if (cdn === 'cn') {
  for (const [name, body] of localTwikooAssets(base)) {
    const destination = resolve(dist, twikooAssetDirectory, name)
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, body)
  }
}

const notices = [
  `Aurora ${version} third-party distribution notices`,
  '===========================================',
  '',
  'This inventory records material present in Aurora deployable output.',
  'Versions marked version-not-stated are not claimed by the published upstream artifact.',
  'License files are copied verbatim from the pinned package or checked-in audit source.',
  'License-source release versions do not assert unversioned embedded code versions.',
  'Declaration-only upstream packages include original metadata and identified SPDX reference text.',
  'Reference placeholders are not an attribution of an unknown copyright holder/year.',
  '',
]
const usedTargets = new Map()
for (const item of distributionInventory) {
  const label = inventoryLabel(item)
  const targets = item.licenseSources.map((source) => {
    const target = inventoryLicenseTarget(item, source)
    copy(source, target)
    return target
  })
  const embedded = embeddedSourceNotices(item)
  if (embedded) {
    const target = embeddedNoticeTarget(item)
    mkdirSync(dirname(resolve(dist, target)), { recursive: true })
    writeFileSync(resolve(dist, target), embedded)
    targets.push(target)
  }
  notices.push(`${label} | ${item.license} | ${targets.join(', ')} | ${item.origin}; evidence: ${item.evidence}; license source: ${item.licenseProvenance || item.licenseSources.join(', ')}${item.upstreamLicenseTextSupplied === false ? '; upstream supplied a license declaration but no full copyright/license file; see reference README' : ''}${item.noticeStatus ? '; INCOMPLETE upstream notice/source material' : ''}`)
}

writeFileSync(resolve(dist, 'THIRD_PARTY_NOTICES.txt'), `${notices.join('\n')}\n`)
if (incompleteNotices.length) console.warn(`Distribution audit remains incomplete: ${incompleteNotices.map(inventoryLabel).join(', ')}`)
