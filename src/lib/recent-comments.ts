import { loadProviderClient, type CdnMode, type CommentProvider } from './comment-adapters.ts'
import type { AuroraConfig } from './config-loader.ts'

export interface RecentComment {
  id: string
  author: string
  avatar?: string
  content: string
  href: string
  createdAt?: string
}

type RecentSettings = Pick<AuroraConfig['comments'], 'twikoo' | 'waline'>

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

function asText(...values: unknown[]): string {
  const value = values.find((item) => typeof item === 'string' && item.trim())
  return typeof value === 'string' ? value.replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) : ''
}

function safeAvatar(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password ? url.toString() : undefined
  } catch { return undefined }
}

function safeTarget(value: unknown, base: string, siteOrigin: string): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const candidate = value.trim()
  if (candidate.startsWith('//') || candidate.includes('\\') || /[\u0000-\u001f]/.test(candidate)) return undefined
  if (!candidate.startsWith('/') && !/^https?:\/\//i.test(candidate)) return undefined
  let url: URL
  try { url = new URL(candidate, siteOrigin) } catch { return undefined }
  let origin: URL
  try { origin = new URL(siteOrigin) } catch { return undefined }
  if (url.origin !== origin.origin || url.username || url.password) return undefined
  const normalizedBase = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`
  const pathname = url.pathname
  const withBase = normalizedBase && pathname !== normalizedBase && !pathname.startsWith(`${normalizedBase}/`)
    ? `${normalizedBase}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
    : pathname
  return `${withBase}${url.search}${url.hash}`
}

function asTimestamp(...values: unknown[]): string | undefined {
  const value = values.find((item) => item !== undefined && item !== null && item !== '')
  if (typeof value === 'number' && Number.isFinite(value)) {
    const milliseconds = value < 100000000000 ? value * 1000 : value
    const date = new Date(milliseconds)
    return Number.isNaN(date.valueOf()) ? undefined : date.toISOString()
  }
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.valueOf()) ? undefined : date.toISOString()
  }
  return undefined
}

function rowsFrom(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  const record = asRecord(value)
  if (!record) return []
  if (Array.isArray(record.comments)) return record.comments
  if (Array.isArray(record.comment)) return record.comment
  if (Array.isArray(record.data)) return record.data
  return []
}

export function normalizeRecentComments(value: unknown, base: string, siteOrigin: string): RecentComment[] {
  return rowsFrom(value).flatMap((raw, index) => {
    const row = asRecord(raw)
    if (!row) return []
    const author = asText(row.nick, row.author, row.name) || 'Anonymous'
    const content = asText(row.commentText, row.comment, row.content, row.text)
    const href = safeTarget(row.url, base, siteOrigin) || safeTarget(row.path, base, siteOrigin) || safeTarget(row.href, base, siteOrigin)
    if (!href || !content) return []
    const avatar = safeAvatar(row.avatar || row.avatarUrl)
    const id = asText(row.id, row._id) || `${href}:${index}`
    return [{ id, author, ...(avatar ? { avatar } : {}), content, href, createdAt: asTimestamp(row.created, row.createdAt, row.time, row.date) }]
  })
}

export async function fetchRecentComments(
  provider: CommentProvider,
  settings: RecentSettings,
  count: number,
  base: string,
  siteOrigin: string,
  cdnMode: CdnMode = 'en',
): Promise<RecentComment[]> {
  let result: unknown
  if (provider === 'twikoo') {
    if (!settings.twikoo.envId) return []
    const api = await loadProviderClient('twikoo', { twikooEnvId: settings.twikoo.envId, cdnMode })
    if (typeof api.getRecentComments !== 'function') throw new Error('Twikoo recent-comments API is unavailable')
    result = await (api.getRecentComments as (options: Record<string, unknown>) => Promise<unknown>)({
      envId: settings.twikoo.envId,
      ...(settings.twikoo.region ? { region: settings.twikoo.region } : {}),
      pageSize: count,
      includeReply: false,
    })
  } else if (provider === 'waline') {
    if (!settings.waline.serverUrl) return []
    const api = await loadProviderClient('waline', { cdnMode })
    if (typeof api.RecentComments !== 'function') throw new Error('Waline recent-comments API is unavailable')
    result = await (api.RecentComments as (options: Record<string, unknown>) => Promise<unknown>)({
      serverURL: settings.waline.serverUrl,
      count,
    })
  } else {
    return []
  }
  return normalizeRecentComments(result, base, siteOrigin).slice(0, count)
}
