import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { readCdnModeForBuild } from './build-config.mjs'

// Twikoo resolves language components and theme stylesheets under prismCdn.
// Its supported highlight plugins are bundled in the Twikoo client.
const cdn = readCdnModeForBuild()
rmSync(resolve('dist/_astro/prismjs/1.28.0'), { recursive: true, force: true })
if (cdn === 'cn') {
  const source = resolve('node_modules/prismjs')
  const target = resolve('dist/_astro/prismjs/1.28.0')
  mkdirSync(target, { recursive: true })
  for (const directory of ['components', 'themes']) {
    cpSync(resolve(source, directory), resolve(target, directory), { recursive: true })
  }
}
