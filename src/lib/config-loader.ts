import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { AuroraConfigSchema, type AuroraConfigValue } from './config-schema.ts'

export type DeepReadonly<T> = T extends (...args: never[]) => unknown ? T
  : T extends readonly (infer U)[] ? readonly DeepReadonly<U>[]
    : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T

export type AuroraConfig = DeepReadonly<AuroraConfigValue>
type RecordValue = Record<string, unknown>
type LoaderOptions = {
  cwd?: string
  configPath?: string
  env?: NodeJS.ProcessEnv
  onWarning?: (message: string) => void
}

const isRecord = (value: unknown): value is RecordValue => value !== null && typeof value === 'object' && !Array.isArray(value)
const own = (object: RecordValue, key: string) => Object.prototype.hasOwnProperty.call(object, key)
const firstDefined = (...values: unknown[]) => values.find((value) => value !== undefined && value !== null)

function setIfMissing(target: RecordValue, key: string, value: unknown) {
  if (!own(target, key) && value !== undefined) target[key] = value
}

function camelToSnakeKeys(value: RecordValue, pairs: Record<string, string>): RecordValue {
  const result = { ...value }
  for (const [oldKey, newKey] of Object.entries(pairs)) {
    if (own(result, oldKey)) {
      setIfMissing(result, newKey, result[oldKey])
      delete result[oldKey]
    }
  }
  return result
}

function normalizeLocale(value: unknown) {
  if (value === 'zh' || value === 'cn' || value === 'zh_CN') return 'zh-CN'
  return value
}

function warnUnsupportedProviderFields(provider: string, settings: RecordValue, warn: (message: string) => void) {
  const unsupported: Record<string, string[]> = {
    valine: ['admin'],
    twikoo: [],
    waline: ['imageUploader', 'image_uploader'],
  }
  for (const key of unsupported[provider] || []) {
    if (own(settings, key)) {
      delete settings[key]
      warn(`Aurora 2 ${provider}.${key} is not supported by the static Aurora 3 client and was not imported.`)
    }
  }
}

function normalizeLegacyConfig(input: unknown, warn: (message: string) => void): unknown {
  if (!isRecord(input)) return input ?? {}
  const raw = { ...input }
  // Discard legacy credentials before any early return for malformed sections.
  // Only the presence of the old section is relevant to migration guidance.
  if (own(raw, 'gitalk')) {
    delete raw.gitalk
    warn('Legacy Aurora 2 Gitalk configuration detected and ignored. Migrate GitHub Issues to Discussions and configure giscus; see MIGRATION.md.')
  }
  // Do not coerce malformed canonical sections to empty objects during legacy normalization.
  // Preserve them so Zod can report the original field path instead of silently defaulting.
  for (const key of ['site', 'i18n', 'theme', 'menu', 'comments', 'dia', 'footer', 'seo']) {
    if (own(raw, key) && !isRecord(raw[key])) return raw
  }
  if (own(raw, 'socials') && !Array.isArray(raw.socials) && !isRecord(raw.socials)) return raw
  if (own(raw, 'links') && !Array.isArray(raw.links)) return raw
  if (isRecord(raw.theme) && own(raw.theme, 'gradient') && !isRecord(raw.theme.gradient)) return raw
  if (isRecord(raw.footer)) {
    for (const key of ['statistics', 'beian']) if (own(raw.footer, key) && !isRecord(raw.footer[key])) return raw
  }
  if (isRecord(raw.comments)) {
    for (const key of ['recent_comments', 'giscus', 'valine', 'twikoo', 'waline']) {
      if (own(raw.comments, key) && !isRecord(raw.comments[key])) return raw
    }
  }
  const site = isRecord(raw.site) ? { ...raw.site } : {}
  if (own(site, 'startedDate')) {
    setIfMissing(site, 'started_date', site.startedDate)
    delete site.startedDate
  }
  for (const key of ['nick', 'link', 'multi_language', 'pathSlug']) {
    if (own(site, key)) {
      delete site[key]
      warn(`Aurora 2 site.${key} has no equivalent Aurora 3 setting and was not imported.`)
    }
  }
  site.language = normalizeLocale(site.language)

  const theme = isRecord(raw.theme) ? { ...raw.theme } : {}
  const menu = isRecord(raw.menu) ? { ...raw.menu } : {}
  for (const [legacy, canonical] of Object.entries({ Home: 'home', Tags: 'tags', Categories: 'categories', Archives: 'archives', About: 'about', Friends: 'links' })) {
    if (own(menu, legacy)) {
      setIfMissing(menu, canonical, menu[legacy])
      delete menu[legacy]
    }
  }

  const oldSocials = raw.socials
  let socials: unknown = oldSocials
  if (isRecord(oldSocials)) {
    const values = isRecord(oldSocials.customs) ? { ...oldSocials, ...oldSocials.customs } : oldSocials
    delete (values as RecordValue).customs
    socials = Object.entries(values).flatMap(([label, value]) => {
      const href = typeof value === 'string' ? value : isRecord(value) ? firstDefined(value.href, value.link) : undefined
      if (typeof href !== 'string' || !href.trim()) return []
      const icon = label.toLowerCase() === 'github' ? 'github' : 'link'
      return [{ label, href, icon }]
    })
    warn('Aurora 2 `socials` object was normalized to Aurora 3 social links; custom icon markup is not migrated.')
  }

  const footer = isRecord(raw.footer) ? { ...raw.footer } : {}
  const siteBeian = isRecord(site.beian) ? site.beian : undefined
  const sitePoliceBeian = isRecord(site.police_beian) ? site.police_beian : undefined
  const beian = isRecord(footer.beian) ? { ...footer.beian } : {}
  if (siteBeian) {
    setIfMissing(beian, 'number', siteBeian.number)
    setIfMissing(beian, 'link', siteBeian.link)
    setIfMissing(beian, 'police_number', siteBeian.police_number ?? siteBeian.policeNumber)
    setIfMissing(beian, 'police_link', siteBeian.police_link ?? siteBeian.policeLink)
    delete site.beian
    warn('Aurora 2 `site.beian` was moved to `footer.beian`.')
  }
  if (sitePoliceBeian) {
    setIfMissing(beian, 'police_number', sitePoliceBeian.number)
    setIfMissing(beian, 'police_link', sitePoliceBeian.link)
    delete site.police_beian
    warn('Aurora 2 `site.police_beian` was moved to `footer.beian.police_number` and `footer.beian.police_link`.')
  }
  if (isRecord(raw.busuanzi)) {
    warn('Aurora 2 `busuanzi` is not migrated: Aurora 3 has no analytics backend. Footer statistics accept manual display values only.')
    delete raw.busuanzi
  }
  if (isRecord(raw.site_meta)) {
    const meta = raw.site_meta
    const hasLegacyMetadata = ['description', 'favicon', 'author', 'keywords'].some((key) => own(meta, key))
    setIfMissing(site, 'description', meta.description)
    if (typeof meta.favicon === 'string' && meta.favicon.trim()) setIfMissing(site, 'logo', meta.favicon)
    if (typeof meta.author === 'string' && meta.author.trim()) setIfMissing(site, 'author', meta.author)
    if (typeof meta.keywords === 'string' && meta.keywords.trim()) {
      const seo = isRecord(raw.seo) ? { ...raw.seo } : {}
      setIfMissing(seo, 'keywords', meta.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean))
      raw.seo = seo
    }
    for (const key of ['description', 'favicon', 'author', 'keywords']) delete meta[key]
    raw.site_meta = meta
    if (hasLegacyMetadata) warn('Aurora 2 `site_meta` metadata fields were mapped to site/SEO fields; `cdn` remains the asset delivery setting.')
  }

  const legacyPoliceBeian = isRecord(raw.police_beian) ? raw.police_beian : undefined
  if (legacyPoliceBeian) {
    const current = isRecord(footer.beian) ? { ...footer.beian } : {}
    setIfMissing(current, 'police_number', legacyPoliceBeian.number)
    setIfMissing(current, 'police_link', legacyPoliceBeian.link)
    footer.beian = current
    delete raw.police_beian
    warn('Aurora 2 `police_beian` was moved to `footer.beian.police_number` and `footer.beian.police_link`.')
  }

  const diaLegacy = isRecord(raw.aurora_bot) ? raw.aurora_bot : undefined
  let dia = isRecord(raw.dia) ? { ...raw.dia } : {}
  if (diaLegacy) {
    if (!own(dia, 'enabled') && !own(dia, 'enable')) dia.enabled = diaLegacy.enable ?? diaLegacy.enabled
    if (!own(dia, 'locale')) dia.locale = normalizeLocale(diaLegacy.locale)
    if (!own(dia, 'tips') && Array.isArray(diaLegacy.tips)) dia.tips = diaLegacy.tips
    if (own(dia, 'enable')) { setIfMissing(dia, 'enabled', dia.enable); delete dia.enable }
    if (own(dia, 'bot_type')) {
      delete dia.bot_type
      warn('Aurora 2 aurora_bot.bot_type is not configurable; Aurora 3 includes the Dia character only.')
    }
    delete raw.aurora_bot
    warn('Aurora 2 `aurora_bot` is deprecated; it was normalized to `dia`.')
  }
  if (own(dia, 'locale')) dia.locale = normalizeLocale(dia.locale)

  const comments = isRecord(raw.comments) ? { ...raw.comments } : {}
  const enabledLegacyProviders = ['waline', 'twikoo', 'valine'].filter((provider) =>
    isRecord(raw[provider]) && ((raw[provider] as RecordValue).enable === true || (raw[provider] as RecordValue).enabled === true),
  )
  const providerConfigs: Record<string, RecordValue> = {}
  for (const provider of ['valine', 'twikoo', 'waline']) {
    const current = isRecord(comments[provider]) ? { ...comments[provider] } : {}
    const legacy = isRecord(raw[provider]) ? { ...raw[provider] } : undefined
    const merged = { ...(legacy || {}), ...current }
    const aliases: Record<string, string> = provider === 'valine' ? {
      appId: 'app_id', appKey: 'app_key', avatarForce: 'avatar_force', requiredFields: 'required_fields',
    } : provider === 'twikoo' ? {
      envId: 'env_id', region: 'region',
    } : {
      serverURL: 'server_url', serverUrl: 'server_url', requiredMeta: 'required_meta', commentSorting: 'comment_sorting',
      pageSize: 'page_size', wordLimit: 'word_limit',
    }
    const normalized = camelToSnakeKeys(merged, { ...aliases, recentComment: 'recent_comment' })
    warnUnsupportedProviderFields(provider, normalized, warn)
    if (normalized.lang !== undefined && normalized.language === undefined) normalized.language = normalizeLocale(normalized.lang)
    delete normalized.lang
    providerConfigs[provider] = normalized
    if (legacy) delete raw[provider]
  }

  if (comments.provider === undefined && enabledLegacyProviders.length > 0) {
    comments.provider = enabledLegacyProviders[0]
    if (enabledLegacyProviders.length > 1) warn(`Multiple Aurora 2 comment providers are enabled; using ${enabledLegacyProviders[0]}.`)
  }
  if (comments.provider === undefined) comments.provider = 'none'
  for (const [provider, settings] of Object.entries(providerConfigs)) {
    if (Object.keys(settings).length > 0) comments[provider] = settings
    if (settings.recent_comment !== undefined) {
      const currentRecent = isRecord(comments.recent_comments) ? comments.recent_comments : {}
      if (currentRecent.enabled === undefined) currentRecent.enabled = settings.recent_comment
      comments.recent_comments = currentRecent
      delete settings.recent_comment
    }
    delete settings.enable
    delete settings.enabled
  }
  raw.site = site
  raw.theme = theme
  raw.menu = menu
  raw.socials = socials ?? []
  raw.footer = { ...footer, ...(Object.keys(beian).length ? { beian } : {}) }
  raw.dia = dia
  raw.comments = comments

  for (const unsupported of ['authors', 'copy_protection', 'injects', 'footer_links']) {
    if (own(raw, unsupported)) {
      delete raw[unsupported]
      warn(`Aurora 2 \`${unsupported}\` is not implemented in Aurora 3 and was not imported.`)
    }
  }
  if (isRecord(raw.shiki)) {
    delete raw.shiki
    warn('Aurora 2 `shiki` settings are not migrated; Aurora 3 uses build-time Shiki with a fixed theme.')
  }

  return raw
}

function envBoolean(value: string, name: string): boolean {
  if (/^(?:true|1|yes|on)$/i.test(value.trim())) return true
  if (/^(?:false|0|no|off)$/i.test(value.trim())) return false
  throw new Error(`Aurora configuration error\nEnvironment variable ${name} must be true or false; received ${JSON.stringify(value)}.`)
}

function applyEnvironmentOverrides(raw: unknown, env: NodeJS.ProcessEnv, warn: (message: string) => void): unknown {
  if (Object.keys(env).some((key) => key.startsWith('PUBLIC_GITALK_') || key.startsWith('GITALK_'))) {
    warn('Obsolete Gitalk environment settings were ignored. Configure giscus in _config.yml; no values were read or serialized.')
  }
  if (!isRecord(raw)) return raw
  const root = raw
  for (const key of ['site', 'footer', 'comments', 'dia']) {
    if (own(root, key) && !isRecord(root[key])) return root
  }
  if (isRecord(root.footer)) {
    for (const key of ['statistics', 'beian']) if (own(root.footer, key) && !isRecord(root.footer[key])) return root
  }
  if (isRecord(root.comments)) {
    for (const key of ['recent_comments', 'giscus', 'valine', 'twikoo', 'waline']) {
      if (own(root.comments, key) && !isRecord(root.comments[key])) return root
    }
  }
  const site = isRecord(root.site) ? { ...root.site } : {}
  const footer = isRecord(root.footer) ? { ...root.footer } : {}
  const statistics = isRecord(footer.statistics) ? { ...footer.statistics } : {}
  const beian = isRecord(footer.beian) ? { ...footer.beian } : {}
  const comments = isRecord(root.comments) ? { ...root.comments } : {}
  const dia = isRecord(root.dia) ? { ...root.dia } : {}
  const providerKeys: Record<string, Record<string, string>> = {
    valine: { app_id: 'PUBLIC_VALINE_APP_ID', app_key: 'PUBLIC_VALINE_APP_KEY' },
    twikoo: { env_id: 'PUBLIC_TWIKOO_ENV_ID', region: 'PUBLIC_TWIKOO_REGION' },
    waline: { server_url: 'PUBLIC_WALINE_SERVER_URL' },
  }
  for (const [key, value] of Object.entries({
    title: env.PUBLIC_AURORA_TITLE, subtitle: env.PUBLIC_AURORA_SUBTITLE, author: env.PUBLIC_AURORA_AUTHOR,
    description: env.PUBLIC_AURORA_DESCRIPTION, avatar: env.PUBLIC_AURORA_AVATAR, logo: env.PUBLIC_AURORA_LOGO,
    language: env.PUBLIC_AURORA_LOCALE ? normalizeLocale(env.PUBLIC_AURORA_LOCALE) : undefined, started_date: env.PUBLIC_AURORA_STARTED_DATE,
    url: env.ASTRO_SITE, base: env.ASTRO_BASE,
  })) if (value !== undefined && value !== '') site[key] = value
  if (env.PUBLIC_AURORA_DIA !== undefined && env.PUBLIC_AURORA_DIA !== '') dia.enabled = envBoolean(env.PUBLIC_AURORA_DIA, 'PUBLIC_AURORA_DIA')
  if (env.PUBLIC_COMMENT_PROVIDER !== undefined && env.PUBLIC_COMMENT_PROVIDER !== '') comments.provider = env.PUBLIC_COMMENT_PROVIDER
  for (const [key, variable] of Object.entries({ page_views: 'PUBLIC_AURORA_PAGE_VIEWS', unique_visitors: 'PUBLIC_AURORA_UNIQUE_VISITORS' })) {
    if (env[variable] !== undefined && env[variable] !== '') statistics[key] = env[variable]
  }
  for (const [key, variable] of Object.entries({
    number: 'PUBLIC_AURORA_BEIAN_NUMBER', link: 'PUBLIC_AURORA_BEIAN_LINK',
    police_number: 'PUBLIC_AURORA_POLICE_BEIAN_NUMBER', police_link: 'PUBLIC_AURORA_POLICE_BEIAN_LINK',
  })) if (env[variable] !== undefined && env[variable] !== '') beian[key] = env[variable]
  for (const [provider, keys] of Object.entries(providerKeys)) {
    const section = isRecord(comments[provider]) ? { ...comments[provider] } : {}
    for (const [key, variable] of Object.entries(keys)) if (env[variable] !== undefined && env[variable] !== '') section[key] = env[variable]
    comments[provider] = section
  }
  return { ...root, site, footer: { ...footer, statistics, beian }, comments, dia }
}

function configError(error: unknown): string {
  if (error instanceof Error && 'issues' in error && Array.isArray((error as { issues?: unknown }).issues)) {
    const issues = (error as { issues: Array<{ path?: (string | number)[]; message?: string; code?: string; keys?: string[] }> }).issues
    return `Aurora configuration error:\n${issues.map((issue) => {
      const path = issue.path?.length ? issue.path.join('.') : '<root>'
      const message = issue.code === 'unrecognized_keys'
        ? `unknown key${(issue.keys?.length || 0) > 1 ? 's' : ''}: ${(issue.keys || []).join(', ')}`
        : issue.message || 'invalid value'
      return `  ${path}: ${message}`
    }).join('\n')}`
  }
  return error instanceof Error ? error.message : String(error)
}

function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child)
  }
  return value as DeepReadonly<T>
}

export function loadAuroraConfig(options: LoaderOptions = {}): AuroraConfig {
  const cwd = options.cwd || process.cwd()
  const env = options.env || process.env
  const configuredPath = options.configPath || env.ASTRO_CONFIG_FILE || '_config.yml'
  const configPath = isAbsolute(configuredPath) ? configuredPath : resolve(cwd, configuredPath)
  let text: string | undefined
  try { text = readFileSync(configPath, 'utf8') } catch (error) {
    if (!isRecord(error) || error.code !== 'ENOENT') throw error
  }
  let parsed: unknown = {}
  if (text !== undefined) {
    try { parsed = parseYaml(text, { uniqueKeys: true, maxAliasCount: 20 }) ?? {} } catch (error) {
      const location = isRecord(error) && Array.isArray(error.linePos) && isRecord(error.linePos[0])
        ? ` (line ${error.linePos[0].line}, column ${error.linePos[0].col})` : ''
      // YAML parser messages include source excerpts. Never echo configuration
      // text here because a malformed legacy file may contain OAuth secrets.
      throw new Error(`Aurora configuration error\nUnable to parse ${configPath}${location}: invalid YAML syntax.`)
    }
  }
  const warn = (message: string) => (options.onWarning || console.warn)(`Aurora configuration warning: ${message}`)
  const compatible = normalizeLegacyConfig(parsed, warn)
  const overridden = applyEnvironmentOverrides(compatible, env, warn)
  const requestedProvider = isRecord(overridden) && isRecord(overridden.comments) ? overridden.comments.provider : undefined
  if (requestedProvider === 'gitalk') {
    const site = isRecord(overridden) && isRecord(overridden.site) ? overridden.site : {}
    const chinese = site.language === 'zh-CN'
    const message = chinese
      ? 'Aurora 配置错误：\ncomments.provider: gitalk 已不受 Aurora 3 支持。上游浏览器运行时依赖 Aurora 不会暴露的 OAuth 客户端密钥。GitHub 评论请迁移到 giscus；也可使用 Waline、Twikoo 或 Valine。参见 MIGRATION.md。'
      : 'Aurora configuration error:\ncomments.provider: gitalk is no longer supported in Aurora 3. Its upstream browser runtime requires an OAuth client secret that Aurora does not expose. For GitHub-hosted comments, migrate to giscus; Waline, Twikoo, and Valine are also available. See MIGRATION.md.'
    throw new Error(message)
  }
  const result = AuroraConfigSchema.safeParse(overridden)
  if (!result.success) throw new Error(configError(result.error))
  if (result.data.siteMeta.cdn === 'cn' && result.data.comments.waline.reaction) {
    warn('comments.waline.reaction: true is unavailable with site_meta.cdn: cn; Waline reaction is disabled because its default images load from a public static CDN.')
    result.data.comments.waline.reaction = false
  }
  return deepFreeze(result.data)
}
