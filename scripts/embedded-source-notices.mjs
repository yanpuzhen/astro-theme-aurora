import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { inventoryLabel } from './third-party-distribution.mjs'

const root = resolve(import.meta.dirname, '..')

export function embeddedNoticeTarget(item) {
  return `_licenses/${inventoryLabel(item).replaceAll('/', '__')}/EMBEDDED_SOURCE_NOTICES.txt`
}

/** Preserve the artifact's own notices, including dates differing from a
 * standalone license-source release. Do not rewrite upstream comment text. */
export function embeddedSourceNotices(item) {
  if (!item.sourceMap) return null
  const map = JSON.parse(readFileSync(resolve(root, item.sourceMap), 'utf8'))
  const sections = []
  for (let index = 0; index < map.sources.length; index++) {
    if (!map.sources[index].startsWith(item.sourcePrefix)) continue
    const comments = map.sourcesContent[index].match(/\/\*[\s\S]*?\*\/|(?:^[ \t]*\/\/[^\n]*(?:\n|$))+/gm) || []
    const notices = comments.filter(comment => /copyright|licen[cs]e|permission notice|all rights reserved/i.test(comment))
    if (notices.length) sections.push(`${map.sources[index]}\n${notices.join('\n')}`)
  }
  return Buffer.from(`Embedded source notice material for ${inventoryLabel(item)}\nSource: ${item.sourceMap}\n\n${sections.join('\n\n')}\n`)
}
