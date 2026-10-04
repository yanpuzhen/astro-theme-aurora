import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { parse } from 'yaml'

/** Preserve the canonical loader's missing-file fallback for post-build scripts. */
export function readBuildConfig({ cwd = process.cwd(), env = process.env } = {}) {
  const configuredPath = env.ASTRO_CONFIG_FILE || '_config.yml'
  const configPath = isAbsolute(configuredPath) ? configuredPath : resolve(cwd, configuredPath)
  let text
  try {
    text = readFileSync(configPath, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return { input: {}, cdn: 'en', configPath }
    throw error
  }
  let input
  try {
    input = parse(text, { uniqueKeys: true, maxAliasCount: 20 }) ?? {}
  } catch {
    // Parser diagnostics contain source excerpts, which can expose credentials.
    throw new Error(`Unable to parse ${configPath}: invalid YAML syntax.`)
  }
  const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
  if (!isRecord(input)) throw new Error(`Invalid Aurora YAML object in ${configPath}`)
  if (Object.hasOwn(input, 'site_meta') && !isRecord(input.site_meta)) {
    throw new Error(`Invalid site_meta in ${configPath}; expected an object`)
  }
  const cdn = input.site_meta && Object.hasOwn(input.site_meta, 'cdn') ? input.site_meta.cdn : 'en'
  if (cdn !== 'en' && cdn !== 'cn') {
    throw new Error(`Invalid site_meta.cdn in ${configPath}; expected "en" or "cn"`)
  }
  return { input, cdn, configPath }
}

export function readCdnModeForBuild(options) {
  return readBuildConfig(options).cdn
}
