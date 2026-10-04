import { z } from 'zod'

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password
  } catch { return false }
}

const httpUrl = z.string().trim().url().refine(isHttpUrl, 'must be an absolute http(s) URL')
const safeExternalHref = z.string().trim().min(1).refine((value) =>
  isHttpUrl(value) || /^(?:mailto|tel):[^\s]+$/i.test(value),
  'must use http, https, mailto, or tel',
)
const assetReference = z.string().trim().refine((value) => {
  if (!value) return true
  if (/^(?:https?:\/\/)/i.test(value)) return isHttpUrl(value)
  return value.startsWith('/') && !value.startsWith('//') && !/[\u0000-\u001f]/.test(value)
}, 'must be a site-relative path or an absolute http(s) URL')
const color = z.string().regex(/^#[\da-f]{3,4}(?:[\da-f]{2}){0,2}$/i, 'must be a supported hexadecimal color')
const locale = z.enum(['en', 'zh-CN'])
const configDate = z.string().refine((value) => {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}, 'must be a real calendar date in YYYY-MM-DD format')
const siteUrl = httpUrl.refine((value) => {
  const url = new URL(value)
  return url.pathname === '/' && !url.search && !url.hash
}, 'must be an origin without a path, query, or fragment')
const basePath = z.string().refine((value) => {
  if (value === '/') return true
  if (!value.startsWith('/') || !value.endsWith('/') || value.includes('//') || /[?#\\\u0000-\u0020]/.test(value)) return false
  return value.slice(1, -1).split('/').every((segment) => {
    if (!segment) return false
    try {
      const decoded = decodeURIComponent(segment)
      return decoded !== '.' && decoded !== '..' && !decoded.includes('/') && !decoded.includes('\\')
    } catch { return false }
  })
}, 'must be a safe absolute base path ending in /')
const fieldList = z.array(z.enum(['nick', 'mail', 'link'])).max(3)

const siteSchema = z.object({
  title: z.string().trim().min(1).max(120).default('My Aurora Blog'),
  subtitle: z.string().trim().max(240).default(''),
  author: z.string().trim().min(1).max(120).default('Author'),
  description: z.string().trim().max(500).default(''),
  avatar: assetReference.default(''),
  logo: assetReference.default('/favicon.svg'),
  language: locale.default('en'),
  started_date: configDate.default(''),
  url: siteUrl.default('https://example.com'),
  base: basePath.default('/'),
}).strict().default({})

const siteMetaSchema = z.object({ cdn: z.enum(['en', 'cn']).default('en') }).strict().default({})

const themeSchema = z.object({
  feature: z.boolean().default(true),
  dark_mode: z.boolean().default(true),
  profile_shape: z.enum(['circle', 'diamond', 'rounded']).default('diamond'),
  gradient: z.object({
    color_1: color.default('#24c6dc'),
    color_2: color.default('#5433ff'),
    color_3: color.default('#ff0099'),
  }).strict().default({}),
}).strict().default({})

const menuSchema = z.object({
  home: z.boolean().default(true),
  tags: z.boolean().default(true),
  categories: z.boolean().default(true),
  archives: z.boolean().default(true),
  about: z.boolean().default(true),
  links: z.boolean().default(false),
}).strict().default({})

const socialsSchema = z.array(z.object({
  label: z.string().trim().min(1).max(40),
  href: safeExternalHref,
  icon: z.enum(['github', 'link']).default('link'),
}).strict()).max(32).default([])

const giscusSchema = z.object({
  repo: z.string().trim().default(''),
  repo_id: z.string().trim().default(''),
  category: z.string().trim().default(''),
  category_id: z.string().trim().default(''),
  mapping: z.enum(['pathname', 'url', 'title', 'og:title', 'specific', 'number']).default('pathname'),
  term: z.string().trim().max(500).default(''),
  strict: z.boolean().default(false),
  reactions_enabled: z.boolean().default(true),
  emit_metadata: z.boolean().default(false),
  input_position: z.enum(['top', 'bottom']).default('bottom'),
  theme: z.enum(['auto', 'light', 'dark', 'dark_dimmed']).default('auto'),
  lang: z.enum(['auto', 'en', 'zh-CN']).default('auto'),
  loading: z.enum(['eager', 'lazy']).default('eager'),
}).strict().default({})

const valineSchema = z.object({
  app_id: z.string().trim().max(256).default(''),
  app_key: z.string().trim().max(256).default(''),
  avatar: z.enum(['mp', 'identicon', 'monsterid', 'wavatar', 'retro', 'robohash', 'blank', 'mm']).default('mp'),
  placeholder: z.string().trim().max(500).default('Leave your thoughts behind~'),
  visitor: z.boolean().default(false),
  avatar_force: z.boolean().default(false),
  language: z.enum(['auto', 'en', 'zh-CN']).default('auto'),
  meta: fieldList.default(['nick', 'mail']),
  required_fields: fieldList.default(['nick']),
}).strict().default({})

const twikooSchema = z.object({
  env_id: z.string().trim().max(500).default(''),
  region: z.string().trim().max(80).default(''),
  language: z.enum(['auto', 'en', 'zh-CN']).default('auto'),
}).strict().default({})

const walineSchema = z.object({
  server_url: httpUrl.or(z.literal('')).default(''),
  language: z.enum(['auto', 'en', 'zh-CN']).default('auto'),
  reaction: z.boolean().default(false),
  login: z.enum(['enable', 'disable', 'force']).default('disable'),
  meta: fieldList.default(['nick', 'mail']),
  required_meta: fieldList.default(['nick']),
  comment_sorting: z.enum(['latest', 'oldest', 'hottest']).default('latest'),
  word_limit: z.number().int().min(0).max(10000).default(0),
  page_size: z.number().int().min(1).max(100).default(10),
}).strict().default({})

const commentsSchema = z.object({
  provider: z.enum(['giscus', 'valine', 'twikoo', 'waline', 'none']).default('none'),
  recent_comments: z.object({
    enabled: z.boolean().default(true),
    count: z.number().int().min(1).max(20).default(5),
  }).strict().default({}),
  giscus: giscusSchema,
  valine: valineSchema,
  twikoo: twikooSchema,
  waline: walineSchema,
}).strict().superRefine((comments, context) => {
  if (comments.provider !== 'giscus') return
  const settings = comments.giscus
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/.test(settings.repo)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['giscus', 'repo'], message: 'must be a GitHub owner/repository identifier' })
  }
  if (!settings.repo_id) context.addIssue({ code: z.ZodIssueCode.custom, path: ['giscus', 'repo_id'], message: 'is required for giscus' })
  if (settings.mapping !== 'number' && !settings.category_id) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['giscus', 'category_id'], message: 'is required to create discussions' })
  }
  if (settings.mapping === 'specific' && !settings.term) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['giscus', 'term'], message: 'is required when mapping is specific' })
  }
  if (settings.mapping === 'number' && !/^[1-9]\d*$/.test(settings.term)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['giscus', 'term'], message: 'must be a positive discussion number when mapping is number' })
  }
}).default({})

const diaSchema = z.object({
  enabled: z.boolean().default(false),
  locale: z.enum(['auto', 'en', 'zh-CN']).default('auto'),
  tips: z.array(z.string().trim().min(1).max(240)).max(20).default([]),
}).strict().default({})

const beianSchema = z.object({
  number: z.string().trim().max(100).default(''),
  link: httpUrl.or(z.literal('')).default(''),
  police_number: z.string().trim().max(120).default(''),
  police_link: httpUrl.or(z.literal('')).default(''),
}).strict().default({})

const footerSchema = z.object({
  show_version: z.boolean().default(true),
  show_avatar: z.boolean().default(true),
  statistics: z.object({
    page_views: z.string().trim().max(40).default(''),
    unique_visitors: z.string().trim().max(40).default(''),
  }).strict().default({}),
  beian: beianSchema,
}).strict().default({})

const linksSchema = z.array(z.object({
  name: z.string().trim().min(1).max(100),
  url: httpUrl,
  avatar: assetReference.default(''),
  description: z.string().trim().max(500).default(''),
  category: z.string().trim().min(1).max(80).default('Friends'),
  color: color.default('#5433ff'),
}).strict()).max(200).default([])

const inputSchema = z.object({
  site: siteSchema,
  site_meta: siteMetaSchema,
  i18n: z.object({
    default_locale: z.literal('en').default('en'),
    locales: z.tuple([z.literal('en'), z.literal('zh-CN')]).default(['en', 'zh-CN']),
  }).strict().default({}),
  theme: themeSchema,
  menu: menuSchema,
  socials: socialsSchema,
  comments: commentsSchema,
  dia: diaSchema,
  footer: footerSchema,
  links: linksSchema,
  seo: z.object({ keywords: z.array(z.string().trim().min(1).max(80)).max(40).default([]) }).strict().default({}),
}).strict()

export const AuroraConfigSchema = inputSchema.transform((value) => ({
  siteMeta: { cdn: value.site_meta.cdn },
  site: {
    title: value.site.title,
    subtitle: value.site.subtitle,
    author: value.site.author,
    description: value.site.description,
    avatar: value.site.avatar,
    logo: value.site.logo,
    language: value.site.language,
    startedDate: value.site.started_date,
    url: value.site.url,
    base: value.site.base,
  },
  i18n: { defaultLocale: value.i18n.default_locale, locales: value.i18n.locales },
  theme: {
    feature: value.theme.feature,
    darkMode: value.theme.dark_mode,
    profileShape: value.theme.profile_shape,
    gradient: [value.theme.gradient.color_1, value.theme.gradient.color_2, value.theme.gradient.color_3] as const,
  },
  menu: value.menu,
  socials: value.socials,
  comments: {
    provider: value.comments.provider,
    enabled: value.comments.provider !== 'none',
    recentComments: value.comments.recent_comments,
    giscus: {
      repo: value.comments.giscus.repo, repoId: value.comments.giscus.repo_id,
      category: value.comments.giscus.category, categoryId: value.comments.giscus.category_id,
      mapping: value.comments.giscus.mapping, term: value.comments.giscus.term,
      strict: value.comments.giscus.strict, reactionsEnabled: value.comments.giscus.reactions_enabled,
      emitMetadata: value.comments.giscus.emit_metadata, inputPosition: value.comments.giscus.input_position,
      theme: value.comments.giscus.theme, lang: value.comments.giscus.lang, loading: value.comments.giscus.loading,
    },
    valine: {
      appId: value.comments.valine.app_id, appKey: value.comments.valine.app_key, avatar: value.comments.valine.avatar,
      placeholder: value.comments.valine.placeholder, visitor: value.comments.valine.visitor,
      avatarForce: value.comments.valine.avatar_force, language: value.comments.valine.language,
      meta: value.comments.valine.meta, requiredFields: value.comments.valine.required_fields,
    },
    twikoo: { envId: value.comments.twikoo.env_id, region: value.comments.twikoo.region, language: value.comments.twikoo.language },
    waline: {
      serverUrl: value.comments.waline.server_url, language: value.comments.waline.language,
      reaction: value.comments.waline.reaction, login: value.comments.waline.login,
      meta: value.comments.waline.meta, requiredMeta: value.comments.waline.required_meta,
      commentSorting: value.comments.waline.comment_sorting, wordLimit: value.comments.waline.word_limit,
      pageSize: value.comments.waline.page_size,
    },
  },
  dia: value.dia,
  footer: {
    showVersion: value.footer.show_version,
    showAvatar: value.footer.show_avatar,
    statistics: { pageViews: value.footer.statistics.page_views, uniqueVisitors: value.footer.statistics.unique_visitors },
    beian: {
      number: value.footer.beian.number, link: value.footer.beian.link,
      policeNumber: value.footer.beian.police_number, policeLink: value.footer.beian.police_link,
    },
  },
  links: value.links,
  seo: value.seo,
}))

export type AuroraConfigValue = z.infer<typeof AuroraConfigSchema>
export type AuroraLocaleConfig = z.infer<typeof locale>
export type ProfileShape = z.infer<typeof themeSchema>['profile_shape']
export type AuroraCommentProvider = z.infer<typeof commentsSchema>['provider']
