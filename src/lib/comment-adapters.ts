import type { AuroraCommentProvider } from './config-schema.ts'

export type CdnMode = 'en' | 'cn'

export type CommentProvider = AuroraCommentProvider
export interface CommentAdapter {
  provider: CommentProvider
  version?: string
  scriptUrl?: string
  cloudBaseScriptUrl?: string
  moduleUrl?: string
  styleUrls: readonly string[]
  identityMode: 'uid' | 'pathname'
  supportsRecentComments: boolean
  supportsCommentCount: boolean
  runtimeStatus: 'ready' | 'disabled'
}

/** Exact upstream client versions are centralized here and never user-overridable. */
export const commentAdapters: Readonly<Record<CommentProvider, CommentAdapter>> = Object.freeze({
  giscus: Object.freeze({
    provider: 'giscus', version: '3.1.1', styleUrls: Object.freeze([]),
    identityMode: 'pathname', supportsRecentComments: false, supportsCommentCount: false, runtimeStatus: 'ready',
  }),
  valine: Object.freeze({
    provider: 'valine', version: '1.5.3',
    scriptUrl: 'https://unpkg.com/valine@1.5.3/dist/Valine.min.js',
    styleUrls: Object.freeze([]),
    identityMode: 'pathname', supportsRecentComments: false, supportsCommentCount: false, runtimeStatus: 'ready',
  }),
  twikoo: Object.freeze({
    provider: 'twikoo', version: '2.0.8',
    scriptUrl: 'https://cdn.jsdelivr.net/npm/twikoo@2.0.8/dist/twikoo.min.js',
    cloudBaseScriptUrl: 'https://cdn.jsdelivr.net/npm/twikoo@2.0.8/dist/twikoo.all.min.js',
    styleUrls: Object.freeze([]),
    identityMode: 'pathname', supportsRecentComments: true, supportsCommentCount: false, runtimeStatus: 'ready',
  }),
  waline: Object.freeze({
    provider: 'waline', version: '3.15.2',
    moduleUrl: 'https://unpkg.com/@waline/client@3.15.2/dist/waline.js',
    styleUrls: Object.freeze(['https://unpkg.com/@waline/client@3.15.2/dist/waline.css']),
    identityMode: 'pathname', supportsRecentComments: true, supportsCommentCount: false, runtimeStatus: 'ready',
  }),
  none: Object.freeze({ provider: 'none', styleUrls: Object.freeze([]), identityMode: 'uid', supportsRecentComments: false, supportsCommentCount: false, runtimeStatus: 'disabled' }),
})

export function adapterFor(provider: CommentProvider): CommentAdapter { return commentAdapters[provider] }

/** CloudBase requires Twikoo's bundled SDK client; self-hosted HTTP endpoints do not. */
export function twikooUsesCloudBase(envId: string): boolean {
  return Boolean(envId) && !/^https?:\/\//i.test(envId)
}

/** One policy for article comments and sidebar recent comments. */
export function providerDelivery(mode: CdnMode): 'remote' | 'local' {
  return mode === 'cn' ? 'local' : 'remote'
}

function localTwikooClient(client: Record<string, unknown>): Record<string, unknown> {
  const prismCdn = `${import.meta.env.BASE_URL}_astro/prismjs/1.28.0`
  return {
    ...client,
    init: (options: Record<string, unknown>) => (client.init as (value: Record<string, unknown>) => Promise<void>)({ ...options, prismCdn }),
  }
}

const scriptLoads = new Map<string, Promise<void>>()
const styleLoads = new Map<string, Promise<void>>()
const moduleLoads = new Map<string, Promise<Record<string, unknown>>>()
const localTwikooLoads = new Map<string, Promise<Record<string, unknown>>>()
let localTwikooQueue: Promise<unknown> = Promise.resolve()

function loadScript(url: string, provider: CommentProvider, force = false): Promise<void> {
  const target = globalThis as typeof globalThis & Record<string, unknown>
  const globals: Partial<Record<CommentProvider, string>> = { valine: 'Valine', twikoo: 'twikoo' }
  const globalName = globals[provider]
  if (!force && globalName && target[globalName]) return Promise.resolve()
  const existing = scriptLoads.get(url)
  if (existing) return existing

  const request = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.referrerPolicy = 'no-referrer'
    script.dataset.auroraCommentProvider = provider
    const timeout = window.setTimeout(() => finish(new Error(`Timed out loading ${provider} client`)), 15000)
    const finish = (error?: Error) => {
      window.clearTimeout(timeout)
      script.onload = null
      script.onerror = null
      if (error) {
        script.remove()
        reject(error)
      } else resolve()
    }
    script.onload = () => finish()
    script.onerror = () => finish(new Error(`Unable to load ${provider} client`))
    document.head.append(script)
  }).catch((error) => {
    scriptLoads.delete(url)
    throw error
  })
  scriptLoads.set(url, request)
  return request
}

function loadLocalTwikoo(url: string): Promise<Record<string, unknown>> {
  const existing = localTwikooLoads.get(url)
  if (existing) return existing
  // Both official UMD distributions assign window.twikoo. Capture each API
  // before the other distribution can replace that global.
  const request = localTwikooQueue.catch(() => {}).then(async () => {
    await loadScript(url, 'twikoo', true)
    const client = (globalThis as typeof globalThis & Record<string, unknown>).twikoo
    if (!client || typeof client !== 'object') throw new Error('Twikoo client did not expose its public API')
    return localTwikooClient(client as Record<string, unknown>)
  })
  localTwikooQueue = request
  localTwikooLoads.set(url, request)
  request.catch(() => localTwikooLoads.delete(url))
  return request
}

function loadStyle(url: string, provider: CommentProvider): Promise<void> {
  const existing = styleLoads.get(url)
  if (existing) return existing
  const link = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].find((node) => node.href === url)
  if (link?.dataset.auroraLoaded === 'true') return Promise.resolve()
  const request = new Promise<void>((resolve, reject) => {
    const element = link || document.createElement('link')
    element.rel = 'stylesheet'
    element.href = url
    element.referrerPolicy = 'no-referrer'
    element.dataset.auroraCommentStyle = provider
    const timeout = window.setTimeout(() => finish(new Error(`Timed out loading ${provider} styles`)), 15000)
    const finish = (error?: Error) => {
      window.clearTimeout(timeout)
      element.onload = null
      element.onerror = null
      if (error) {
        if (!link) element.remove()
        reject(error)
      } else {
        element.dataset.auroraLoaded = 'true'
        resolve()
      }
    }
    element.onload = () => finish()
    element.onerror = () => finish(new Error(`Unable to load ${provider} styles`))
    if (!link) document.head.append(element)
  }).catch((error) => {
    styleLoads.delete(url)
    throw error
  })
  styleLoads.set(url, request)
  return request
}

function loadModule(url: string): Promise<Record<string, unknown>> {
  const existing = moduleLoads.get(url)
  if (existing) return existing
  const request = import(/* @vite-ignore */ url) as Promise<Record<string, unknown>>
  moduleLoads.set(url, request)
  request.catch(() => moduleLoads.delete(url))
  return request
}

export async function loadProviderClient(
  provider: Exclude<CommentProvider, 'none' | 'giscus'>,
  options: { twikooEnvId?: string; cdnMode?: CdnMode } = {},
): Promise<Record<string, unknown>> {
  const adapter = adapterFor(provider)
  if (adapter.runtimeStatus !== 'ready') {
    throw new Error(`${provider} client is blocked by Aurora's static security policy`)
  }
  if (providerDelivery(options.cdnMode || 'en') === 'local') {
    if (provider === 'valine') {
      const { default: Valine } = await import('./comment-clients/local/valine.ts')
      return Valine as unknown as Record<string, unknown>
    }
    if (provider === 'waline') {
      const client = await import('./comment-clients/local/waline.ts')
      await loadStyle(client.styleUrl, provider)
      return client as Record<string, unknown>
    }
    if (twikooUsesCloudBase(options.twikooEnvId || '')) {
      const { cloudBaseUrl } = await import('./comment-clients/local/twikoo-cloudbase.ts')
      return loadLocalTwikoo(cloudBaseUrl)
    }
    const { scriptUrl } = await import('./comment-clients/local/twikoo.ts')
    return loadLocalTwikoo(scriptUrl)
  }
  await Promise.all(adapter.styleUrls.map((url) => loadStyle(url, provider)))
  if (adapter.moduleUrl) return loadModule(adapter.moduleUrl)
  const scriptUrl = provider === 'twikoo' && twikooUsesCloudBase(options.twikooEnvId || '')
    ? adapter.cloudBaseScriptUrl : adapter.scriptUrl
  if (scriptUrl) await loadScript(scriptUrl, provider)
  const globals: Partial<Record<CommentProvider, string>> = { valine: 'Valine', twikoo: 'twikoo' }
  const globalName = globals[provider]
  if (!globalName) throw new Error(`${provider} client did not expose a supported public API`)
  const client = (globalThis as typeof globalThis & Record<string, unknown>)[globalName]
  if (!client || (typeof client !== 'object' && typeof client !== 'function')) throw new Error(`${provider} client did not expose its public API`)
  return client as Record<string, unknown>
}
