import { expect, test } from '@playwright/test'
import { createHash } from 'node:crypto'

const base = (process.env.PLAYWRIGHT_BASE_PATH || '').replace(/\/$/, '')
const forbidden = /(?:unpkg\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|img\.t\.sinajs\.cn|owo\.imaegoo\.com|cdn\.jsdmirror\.com)/i

test('CN provider static clients are same-origin and lazy', async ({ page }) => {
  const requests: string[] = []
  const missingLocalAssets: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  page.on('response', (response) => {
    if (response.status() === 404 && new URL(response.url()).pathname.startsWith(`${base}/_astro/`)) missingLocalAssets.push(response.url())
  })
  await page.route(/https:\/\/(?:twikoo|waline)\.example\/.*/, (route) => {
    const request = route.request()
    const recentTwikoo = request.postDataJSON()?.event === 'GET_RECENT_COMMENTS'
    const recentWaline = request.url().includes('type=recent')
    const rows = recentTwikoo
      ? [{ id: 'tw-cn', nick: 'Twikoo CN Reader', commentText: 'Local recent comment', url: '/post/preflight/' }]
      : recentWaline
        ? [{ id: 'wa-cn', nick: 'Waline CN Reader', comment: 'Local recent comment', url: '/post/preflight/' }]
        : []
    const body = recentWaline ? rows : { code: 0, data: rows, comments: rows }
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) })
  })
  await page.route('https://giscus.app/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>giscus mock</title>' }))
  await page.goto(`${base}/`)
  expect(requests.filter((url) => /(?:valine|twikoo|waline)/i.test(url))).toEqual([])
  await page.goto(`${base}/preflight/comments/`)
  await expect.poll(() => requests.some((url) => /\/valine\.[^/]+\.js/.test(url))).toBe(true)
  await expect.poll(() => requests.some((url) => /\/_astro\/vendor\/twikoo\/2\.0\.8\/twikoo\.min\.js/.test(url))).toBe(true)
  await expect.poll(() => requests.some((url) => /\/_astro\/vendor\/twikoo\/2\.0\.8\/twikoo\.all\.min\.js/.test(url))).toBe(true)
  await expect.poll(() => requests.some((url) => /\/waline\.[^/]+\.js/.test(url))).toBe(true)
  await expect.poll(() => requests.some((url) => /\/waline\.[^/]+\.css/.test(url))).toBe(true)
  await expect(page.locator('section[aria-label="Twikoo recent comments"]')).toContainText('Twikoo CN Reader')
  await expect(page.locator('section[aria-label="Waline recent comments"]')).toContainText('Waline CN Reader')
  const runtimeAssets = requests.filter((url) => /(?:valine|twikoo|waline)[^/]*\.(?:js|css)(?:\?|$)/i.test(url))
  expect(runtimeAssets.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true)
  expect(requests.filter((url) => forbidden.test(url))).toEqual([])
  const apiShapes = await page.evaluate(async () => {
    const files = performance.getEntriesByType('resource').map((entry) => entry.name)
    const moduleFor = async (name: string) => import(/* @vite-ignore */ files.find((url) => new RegExp(`/${name}\\.[^/]+\\.js$`).test(url))!)
    const [valine, waline] = await Promise.all([moduleFor('valine'), moduleFor('waline')])
    const twikoo = (window as any).twikoo
    return {
      valine: typeof valine.default,
      twikooInit: typeof twikoo?.init,
      twikooRecent: typeof twikoo?.getRecentComments,
      walineInit: typeof waline.init,
      walineRecent: typeof waline.RecentComments,
    }
  })
  expect(apiShapes).toEqual({
    valine: 'function', twikooInit: 'function', twikooRecent: 'function',
    walineInit: 'function', walineRecent: 'function',
  })
  requests.length = 0
  await page.route('https://preflight-cloudbase-env.api.tcloudbasegateway.com/**', (route) => route.fulfill({ status: 401, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"code":"MOCK_AUTH_BOUNDARY"}' }))
  await page.goto(`${base}/preflight/cloudbase/`)
  await expect.poll(() => requests.some((url) => /\/_astro\/vendor\/twikoo\/2\.0\.8\/twikoo\.all\.min\.js$/.test(url))).toBe(true)
  await expect.poll(() => requests.some((url) => url.includes('preflight-cloudbase-env.api.tcloudbasegateway.com/auth/v1/signin/anonymously'))).toBe(true)
  expect(requests.some((url) => /\/_astro\/vendor\/twikoo\/2\.0\.8\/twikoo\.min\.js$/.test(url))).toBe(false)
  expect(requests.filter((url) => forbidden.test(url))).toEqual([])
  expect(missingLocalAssets).toEqual([])
})

for (const plugin of ['none', 'showLanguage', 'copyButton']) test(`CN Twikoo delayed Prism ${plugin} resources use the configured base`, async ({ page }) => {
  const responses = new Map<string, { status: number; contentType: string; body: string }>()
  const requests: string[] = []
  const pageErrors: string[] = []
  const component = `${base}/_astro/prismjs/1.28.0/components/prism-python.min.js`
  const theme = `${base}/_astro/prismjs/1.28.0/themes/prism-okaidia.min.css`
  page.on('request', (request) => requests.push(request.url()))
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('response', async (response) => {
    const pathname = new URL(response.url()).pathname
    if (pathname === component || pathname === theme) {
      responses.set(pathname, {
        status: response.status(),
        contentType: response.headers()['content-type'] || '',
        body: await response.text(),
      })
    }
  })
  await page.route('https://twikoo.example/**', (route) => {
    const event = route.request().postDataJSON()?.event
    const payload = event === 'GET_CONFIG'
      ? { code: 0, config: { HIGHLIGHT: 'true', HIGHLIGHT_THEME: 'okaidia', HIGHLIGHT_PLUGIN: plugin } }
      : event === 'COMMENT_GET'
        ? { code: 0, data: [{ _id: 'python-comment', nick: 'Tester', comment: '<pre><code class="language-python">print(123)</code></pre>', created: Date.now(), replies: [], likes: [], dislikes: [], url: '/post/preflight/' }], count: 1, more: false }
        : { code: 0, data: [] }
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(payload) })
  })
  await page.goto(`${base}/preflight/twikoo-highlight/`)
  await expect(page.locator('[data-provider-test="twikoo"] code.language-python')).toContainText('print(123)')
  await expect(page.locator('[data-provider-test="twikoo"] code.language-python .token')).not.toHaveCount(0)
  await expect.poll(() => responses.has(component)).toBe(true)
  await expect.poll(() => responses.has(theme)).toBe(true)
  expect(responses.get(component)?.status).toBe(200)
  expect(responses.get(component)?.contentType).toMatch(/(?:javascript)/)
  expect(responses.get(theme)?.status).toBe(200)
  expect(responses.get(theme)?.contentType).toContain('text/css')
  expect(responses.get(theme)?.body).toMatch(/\.token|\.language-python/)
  expect([component, theme].every((path) => requests.includes(new URL(path, page.url()).href))).toBe(true)
  expect(requests.filter((url) => /prismjs/i.test(url)).every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true)
  expect(requests.filter((url) => /\/_astro\/(?:valine|waline)[^/]*\.(?:js|css)$/.test(url))).toEqual([])
  expect(requests.filter((url) => forbidden.test(url))).toEqual([])
  expect(pageErrors).toEqual([])
})

test('CN Twikoo does not load optional assets when emotion and Cap are disabled', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.route('https://twikoo.example/**', (route) => {
    const event = route.request().postDataJSON()?.event
    const payload = event === 'GET_CONFIG'
      ? { code: 0, config: { SHOW_EMOTION: 'false', CAPTCHA_PROVIDER: '', CAP_BUILTIN: false, HIGHLIGHT: 'false' } }
      : event === 'COMMENT_GET'
        ? { code: 0, data: [], count: 0, more: false }
        : { code: 0, data: [] }
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(payload) })
  })
  await page.goto(`${base}/preflight/twikoo-interactions/`)
  await expect(page.locator('[data-provider-test="twikoo"] textarea')).toBeVisible()
  expect(requests.filter((url) => /(?:owo\.json|cap\.min\.js|prism-python)/.test(url))).toEqual([])
  expect(requests.filter((url) => forbidden.test(url))).toEqual([])
})

test('CN Waline and Valine do not expose remote reaction or emoji assets', async ({ page }) => {
  const requests: string[] = []
  const leanCloud: { url: string; headers: Record<string, string> }[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.route('https://**/1.1/**', (route) => {
    leanCloud.push({ url: route.request().url(), headers: route.request().headers() })
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"results":[]}' })
  })
  await page.route('https://waline.example/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ code: 0, data: [], comments: [] }) }))
  await page.goto(`${base}/preflight/comments/`)
  await expect(page.locator('[data-provider-test="valine"] textarea')).toBeVisible()
  await expect(page.locator('[data-provider-test="valine"] .vemoji-btn')).toHaveCount(0)
  await expect(page.locator('[data-provider-test="waline"] .wl-reaction')).toHaveCount(0)
  await expect.poll(() => leanCloud.some((item) => item.url.includes('/1.1/classes/Comment'))).toBe(true)
  const comment = leanCloud.find((item) => item.url.includes('/1.1/classes/Comment'))!
  expect(new URL(comment.url).host).toBe('leancloud.cn')
  expect(comment.headers['x-lc-id']).toBe('preflight-app-id')
  const [signature, timestamp] = comment.headers['x-lc-sign'].split(',')
  expect(signature).toBe(createHash('md5').update(`${timestamp}preflight-public-app-key`).digest('hex'))
  expect(requests.filter((url) => forbidden.test(url))).toEqual([])
})

test('CN Twikoo keeps OwO and Cap local without bypassing CAPTCHA', async ({ page }) => {
  const requests: string[] = []
  const events: string[] = []
  const errors: string[] = []
  const assetStatuses = new Map<string, number>()
  page.on('request', (request) => requests.push(request.url()))
  page.on('response', (response) => assetStatuses.set(new URL(response.url()).pathname, response.status()))
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('https://twikoo.example/**', (route) => {
    const event = route.request().postDataJSON()?.event
    events.push(event || '')
    const payload = event === 'GET_CONFIG'
      ? { code: 0, config: { SHOW_EMOTION: 'true', CAPTCHA_PROVIDER: 'Cap', CAP_BUILTIN: true } }
      : event === 'COMMENT_GET'
        ? { code: 0, data: [], count: 0, more: false }
        : { code: 0, data: [] }
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(payload) })
  })
  await page.goto(`${base}/preflight/twikoo-interactions/`)
  const prefix = `${base}/_astro/vendor/twikoo/2.0.8/`
  await expect.poll(() => requests.some((url) => new URL(url).pathname === `${prefix}owo.json`)).toBe(true)
  await expect.poll(() => requests.some((url) => new URL(url).pathname === `${prefix}cap.min.js`)).toBe(true)
  await expect.poll(() => assetStatuses.get(`${prefix}cap_wasm_bg.wasm`)).toBe(200)
  await expect.poll(() => page.evaluate(() => Boolean(customElements.get('cap-widget')))).toBe(true)
  await expect(page.locator('.OwO-logo')).toBeVisible()
  await page.locator('.OwO-logo').click()
  await expect(page.locator('.OwO-body')).toBeVisible()
  await expect(page.locator('.OwO-item')).not.toHaveCount(0)
  await page.locator('[data-provider-test="twikoo"] input').nth(0).fill('Tester')
  await page.locator('[data-provider-test="twikoo"] input').nth(1).fill('tester@example.com')
  await page.locator('[data-provider-test="twikoo"] textarea').fill('Cap must verify this comment')
  await page.getByRole('button', { name: 'Send' }).click()
  // This HTTP fixture cannot provide Twikoo's built-in CloudBase challenge.
  // Submission must fail visibly instead of sending an unverified comment.
  await expect(page.getByText('出现未知错误')).toBeVisible()
  expect(events).not.toContain('COMMENT_SUBMIT')
  const local = requests.filter((url) => /\/(?:owo\.json|cap\.min\.js|cap_wasm_bg\.wasm)$/.test(url))
  expect(local.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true)
  expect(requests.filter((url) => forbidden.test(url))).toEqual([])
  expect(errors).toEqual([])
})

test('CN comment providers load only their selected client', async ({ page }) => {
  const cases = [
    ['provider-valine', /\/valine\.[^/]+\.js$/, /(?:\/waline\.[^/]+\.js$|\/vendor\/twikoo\/)/],
    ['twikoo-interactions', /\/vendor\/twikoo\/2\.0\.8\/twikoo\.min\.js$/, /(?:\/valine\.[^/]+\.js$|\/waline\.[^/]+\.js$)/],
    ['provider-waline', /\/waline\.[^/]+\.js$/, /(?:\/valine\.[^/]+\.js$|\/vendor\/twikoo\/)/],
    ['provider-giscus', /\/giscus-[^/]+\.js$/, /(?:\/valine\.[^/]+\.js$|\/waline\.[^/]+\.js$|\/vendor\/twikoo\/)/],
    ['provider-none', null, /(?:\/valine\.[^/]+\.js$|\/waline\.[^/]+\.js$|\/vendor\/twikoo\/)/],
  ] as const
  await page.route('https://**/*', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"code":0,"data":[],"results":[],"config":{}}' }))
  for (const [suite, selected, excluded] of cases) {
    const requests: string[] = []
    const listener = (request: import('@playwright/test').Request) => requests.push(request.url())
    page.on('request', listener)
    await page.goto(`${base}/preflight/${suite}/`)
    if (selected) await expect.poll(() => requests.some((url) => selected.test(url))).toBe(true)
    else await expect(page.getByText('No provider')).toBeVisible()
    expect(requests.filter((url) => excluded.test(url)), suite).toEqual([])
    page.off('request', listener)
  }
})
