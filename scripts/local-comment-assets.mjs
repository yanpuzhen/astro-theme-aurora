import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { localTwikooAssets, twikooAssetDirectory } from './local-twikoo-assets.mjs'

const root = resolve(import.meta.dirname, '..')
const twikooPrefix = `/${twikooAssetDirectory}/`
const prismPrefix = '/_astro/prismjs/1.28.0/'
const prismRequest = /^(components|themes)\/([a-z0-9][a-z0-9-]*\.(?:min\.)?(?:js|css))$/i

function requestPathname(url) {
  try {
    if (!url?.startsWith('/')) return null
    const raw = url.split(/[?#]/, 1)[0]
    const decoded = decodeURIComponent(raw)
    if (decoded.includes('\\') || decoded.includes('\0') || decoded.split('/').some((segment) => segment === '.' || segment === '..')) return null
    return decoded
  } catch {
    return null
  }
}

function ownsNamespace(url) {
  let path = url?.split(/[?#]/, 1)[0] || ''
  try { path = decodeURIComponent(path) } catch { /* Reject malformed encoded paths in the raw namespace too. */ }
  return path.startsWith(twikooPrefix) || path.startsWith(prismPrefix)
}

/** Resolve only fixed Aurora namespaces; never expose arbitrary node_modules files. */
export function localCommentDevAsset(url, twikooAssets) {
  const pathname = requestPathname(url)
  if (!pathname) return null
  if (pathname.startsWith(twikooPrefix)) {
    const name = pathname.slice(twikooPrefix.length)
    if (!/^[a-z0-9][a-z0-9_.-]*$/i.test(name)) return null
    const body = twikooAssets.get(name)
    if (!body) return null
    const contentType = name.endsWith('.wasm') ? 'application/wasm'
      : name.endsWith('.json') ? 'application/json; charset=utf-8'
        : 'application/javascript; charset=utf-8'
    return { body, contentType }
  }
  if (!pathname.startsWith(prismPrefix)) return null
  const match = prismRequest.exec(pathname.slice(prismPrefix.length))
  if (!match) return null
  const [, directory, filename] = match
  if (directory === 'components' && !filename.endsWith('.js')) return null
  if (directory === 'themes' && !filename.endsWith('.css')) return null
  const file = resolve(root, 'node_modules/prismjs', directory, filename)
  if (!existsSync(file)) return null
  return {
    body: readFileSync(file),
    contentType: filename.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8',
  }
}

export function createLocalCommentAssetMiddleware(base) {
  const twikooAssets = localTwikooAssets(base)
  return (request, response, next) => {
    const asset = localCommentDevAsset(request.url, twikooAssets)
    if (!asset) {
      // Do not let malformed requests in our namespace fall through to Vite's
      // broader development filesystem handlers.
      if (ownsNamespace(request.url)) {
        response.statusCode = 404
        response.end('Not found')
        return
      }
      return next()
    }
    response.statusCode = 200
    response.setHeader('Content-Type', asset.contentType)
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.end(asset.body)
  }
}
