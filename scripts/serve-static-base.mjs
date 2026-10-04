import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)))
const args = new Map()
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1])
const base = `/${(args.get('--base') || process.env.PLAYWRIGHT_BASE_PATH || 'aurora').replace(/^\/+|\/+$/g, '')}`
const port = Number(args.get('--port') || 4321)

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.wasm': 'application/wasm',
}

function filePath(requestPath) {
  if (requestPath !== base && !requestPath.startsWith(`${base}/`)) return undefined
  const relative = requestPath.slice(base.length) || '/'
  const pathname = decodeURIComponent(relative)
  const candidate = normalize(join(root, pathname === '/' ? 'index.html' : pathname.replace(/\/$/, '/index.html')))
  return candidate === root || candidate.startsWith(`${root}/`) ? candidate : undefined
}

const server = createServer((request, response) => {
  try {
    const requestPath = new URL(request.url || '/', 'http://127.0.0.1').pathname
    const target = filePath(requestPath)
    if (!target || !existsSync(target) || !statSync(target).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }
    response.writeHead(200, { 'content-type': contentTypes[extname(target)] || 'application/octet-stream' })
    if (request.method === 'HEAD') response.end()
    else createReadStream(target).pipe(response)
  } catch {
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Bad request')
  }
})

server.listen(port, '127.0.0.1', () => console.log(`Serving ${root} at http://127.0.0.1:${port}${base}/`))
