import { test, expect } from '@playwright/test'

const base = (process.env.PLAYWRIGHT_BASE_PATH || '').replace(/\/$/, '')
const route = (path: string) => `${base}${path}` || '/'
const valineScript = `window.Valine=function(options){window.__valineOptions=options;const node=document.createElement('p');node.dataset.clientMock='valine';node.textContent='Valine mock';options.el.append(node)}`
const twikooScript = `window.twikoo={init:async function(options){window.__twikooOptions=options;const node=document.createElement('p');node.dataset.clientMock='twikoo';node.textContent='Twikoo mock';options.el.append(node)},getRecentComments:async function(options){window.__twikooRecentOptions=options;return [{id:'tw-recent',nick:'Twikoo Reader',commentText:'<img src=x onerror=alert(1)>Welcome <b>reader</b>',url:'/cn/post/recent/',avatar:'https://cdn.example/tw.png',created:1720000000000}]}}`
const walineModule = `export function init(options){window.__walineOptions=options;const node=document.createElement('p');node.dataset.clientMock='waline';node.textContent='Waline mock';options.el.append(node);return {destroy(){}}} export async function RecentComments(options){window.__walineRecentOptions=options;return {comments:[{id:'wa-recent',nick:'Waline Reader',comment:'<svg onload=alert(1)>Hello <em>there</em>',url:'https://config.example/post/recent/',avatar:'javascript:alert(1)',createdAt:1720000000000}],destroy(){}}}`

async function mockProviderAssets(page: import('@playwright/test').Page, brokenTwikoo = false) {
  const css = '/* deterministic preflight mock stylesheet */ .mock-provider { color: #123; }'
  await page.route('https://unpkg.com/valine@1.5.3/dist/Valine.min.js', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: valineScript }))
  await page.route('https://cdn.jsdelivr.net/npm/twikoo@2.0.8/dist/twikoo.min.js', (route) => brokenTwikoo
    ? route.abort()
    : route.fulfill({ status: 200, contentType: 'application/javascript', body: twikooScript }))
  await page.route('https://cdn.jsdelivr.net/npm/twikoo@2.0.8/dist/twikoo.all.min.js', (route) => brokenTwikoo
    ? route.abort()
    : route.fulfill({ status: 200, contentType: 'application/javascript', body: twikooScript }))
  await page.route('https://unpkg.com/@waline/client@3.15.2/dist/waline.css', (route) => route.fulfill({ status: 200, contentType: 'text/css', body: css }))
  await page.route('https://unpkg.com/@waline/client@3.15.2/dist/waline.js', (route) => route.fulfill({
    status: 200, contentType: 'application/javascript', headers: { 'access-control-allow-origin': '*' }, body: walineModule,
  }))
  await page.route('https://giscus.app/**', (route) => route.fulfill({
    status: 200, contentType: 'text/html', headers: { 'access-control-allow-origin': '*' },
    body: '<!doctype html><html><body><script>document.documentElement.dataset.theme=new URL(location.href).searchParams.get("theme")||"";parent.postMessage({giscus:{resizeHeight:120}},new URL(location.href).searchParams.get("origin"));window.addEventListener("message",event=>{const next=event.data&&event.data.giscus&&event.data.giscus.setConfig&&event.data.giscus.setConfig.theme;if(next)document.documentElement.dataset.theme=next})</script><p>Local giscus mock</p></body></html>',
  }))
}

test('EN CloudBase uses the existing bundled Twikoo CDN client', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await mockProviderAssets(page)
  await page.goto(route('/preflight/cloudbase/'))
  await expect.poll(() => requests.some((url) => url === 'https://cdn.jsdelivr.net/npm/twikoo@2.0.8/dist/twikoo.all.min.js')).toBe(true)
  expect(requests.some((url) => /\/twikoo\.min\.js$/.test(url))).toBe(false)
})

test('validated YAML settings reach the rendered static UI and none loads no provider assets', async ({ page }) => {
  const providerRequests: string[] = []
  page.on('request', (request) => {
    if (/giscus|gitalk|valine|twikoo|waline/i.test(request.url())) providerRequests.push(request.url())
  })
  await page.goto(route('/'))
  await expect(page).toHaveTitle('Config UI Smoke')
  await expect(page.locator('.site-logo strong')).toHaveText('Ada Example')
  await expect(page.locator('.site-logo small')).toHaveText('Visible subtitle from YAML')
  await expect(page.locator('.profile-card h2')).toHaveText('Ada Example')
  await expect(page.locator('.profile-card__avatar')).toHaveClass(/profile-shape-circle/)
  await expect(page.locator('.desktop-navigation a[data-menu="Tags"]')).toHaveCount(0)
  await expect(page.locator('.desktop-navigation a[data-menu="Links"]')).toHaveCount(1)
  await expect(page.locator('.profile-socials a')).toHaveCount(2)
  expect(await page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--gradient-color-1').trim())).toBe('#123456')
  await expect(page.locator('#Aurora-Dia')).toBeVisible()
  await expect(page.locator('.footer-stats')).toContainText('42')
  await expect(page.locator('.footer-attribution')).toBeVisible()
  await expect(page.locator('.site-footer__copy a[href="/config-smoke/"]')).toHaveText('Aurora')
  expect(providerRequests).toEqual([])
  await page.goto(route('/post/architecture-smoke/'))
  await expect(page.locator('section.comments, giscus-widget')).toHaveCount(0)
  expect(providerRequests).toEqual([])
  await page.goto(route('/search/'))
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('h1.page-heading')).toHaveText('Search')
  await page.getByRole('searchbox', { name: 'Search' }).fill('architecture')
  await expect(page.locator('.search-result').first()).toHaveAttribute('href', `${base}/post/architecture-smoke/`)
})

test('supported comment clients and Recent Comments render safely from deterministic mocks', async ({ page }) => {
  const providerRequests: string[] = []
  page.on('request', (request) => {
    if (/gitalk|valine|twikoo|waline/i.test(request.url())) providerRequests.push(request.url())
  })
  await mockProviderAssets(page)
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(message.text()) })
  await page.goto(route('/preflight/comments/'))
  for (const provider of ['valine', 'twikoo', 'waline']) {
    await expect(page.locator(`[data-provider-test="${provider}"] [data-client-mock="${provider}"]`)).toBeVisible()
  }
  await expect(page.locator('[data-provider-test="giscus"] giscus-widget')).toHaveAttribute('repo', 'example/comments')
  await expect(page.locator('[data-provider-test="giscus"] giscus-widget')).toHaveAttribute('mapping', 'pathname')
  await expect(page.locator('[data-provider-test="giscus"] giscus-widget')).toHaveAttribute('lang', 'en')
  await expect(page.locator('[data-provider-test="giscus-zh"] giscus-widget')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('[data-provider-test="giscus-specific"] giscus-widget')).toHaveAttribute('term', 'preflight-legacy-uid')
  await expect(page.locator('[data-provider-test="giscus-escaped-term"] giscus-widget')).toHaveAttribute('term', '<img src=x onerror=alert(1)>')
  await expect(page.locator('[data-provider-test="giscus-escaped-term"] img[onerror]')).toHaveCount(0)
  await expect(page.locator('[data-provider-test="incomplete"]')).toContainText('not fully configured')
  await expect(page.locator('section[aria-label="Twikoo recent comments"]')).toContainText('Twikoo Reader')
  await expect(page.locator('section[aria-label="Twikoo recent comments"]')).toContainText('Welcome reader')
  await expect(page.locator('section[aria-label="Waline recent comments"]')).toContainText('Waline Reader')
  await expect(page.locator('section[aria-label="Waline recent comments"]')).toContainText('Hello there')
  await expect(page.locator('img[onerror], svg[onload]')).toHaveCount(0)
  await expect(page.locator('section[aria-label="Twikoo recent comments"] a')).toHaveAttribute('href', `${base}/cn/post/recent/`)
  await expect(page.locator('section[aria-label="Waline recent comments"] a')).toHaveAttribute('href', `${base}/post/recent/`)
  expect(await page.locator('link[data-aurora-comment-style]').count()).toBe(1)
  expect(await page.locator('[data-aurora-comment-provider="gitalk"], [data-aurora-comment-style="gitalk"]').count()).toBe(0)
  expect(providerRequests.filter((url) => /gitalk/i.test(url))).toEqual([])
  expect(await page.locator('script[data-aurora-comment-provider="twikoo"]').count()).toBe(1)
  expect(pageErrors).toEqual([])
  const options = await page.evaluate(() => ({
    valine: (window as any).__valineOptions,
    twikoo: (window as any).__twikooOptions,
    waline: (window as any).__walineOptions,
    recent: (window as any).__twikooRecentOptions,
    walineRecent: (window as any).__walineRecentOptions,
  }))
  expect(options.valine.path).toBe('/post/preflight')
  expect(options.twikoo.path).toBe('/post/preflight/')
  expect(options.waline.path).toBe('/post/preflight/')
  expect(options.waline.dark).toBe("html[data-theme='dark']")
  expect(options.recent).toEqual({ envId: 'https://twikoo.example', pageSize: 3, includeReply: false })
  expect(options.walineRecent).toEqual({ serverURL: 'https://comments.example', count: 3 })
  const valineHost = page.locator('[data-provider-test="valine"] .comment-provider-host')
  await expect(valineHost).not.toHaveClass(/night/)
  await page.locator('html').evaluate((element) => { element.dataset.theme = 'dark' })
  await expect(valineHost).toHaveClass(/night/)
  await expect(page.locator('[data-provider-test="giscus"] giscus-widget')).toHaveAttribute('theme', 'dark')
  await page.locator('html').evaluate((element) => { element.dataset.theme = 'light' })
  await expect(valineHost).not.toHaveClass(/night/)
  await expect(page.locator('[data-provider-test="giscus"] giscus-widget')).toHaveAttribute('theme', 'light')
})

test('giscus uses local iframe mocks, updates theme, and fits responsive widths', async ({ page }) => {
  await mockProviderAssets(page)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(route('/preflight/comments/'))
  const widget = page.locator('[data-provider-test="giscus"] giscus-widget')
  await expect(widget).toHaveAttribute('theme', 'light')
  await expect(widget).toHaveAttribute('reactionsenabled', '1')
  await expect(widget).toHaveAttribute('strict', '0')
  await expect(widget).toHaveAttribute('loading', 'eager')
  await expect(page.locator('[data-provider-test="giscus"] .giscus-comment-host > .comment-status')).toHaveCount(0)
  for (const width of [1440, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await widget.evaluate((element) => element.getBoundingClientRect().right <= innerWidth + 1)).toBe(true)
  }
  await page.locator('html').evaluate((element) => { element.dataset.theme = 'dark' })
  await expect(widget).toHaveAttribute('theme', 'dark')
  await expect(widget).toHaveCount(1)
  const iframe = page.locator('[data-provider-test="giscus"] giscus-widget iframe')
  await expect(iframe).toHaveCount(1)
  await expect(page.frameLocator('[data-provider-test="giscus"] giscus-widget iframe').locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.locator('html').evaluate((element) => { delete element.dataset.theme })
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(widget).toHaveAttribute('theme', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(widget).toHaveAttribute('theme', 'dark')
  await page.evaluate(() => {
    window.postMessage({ giscus: { error: 'untrusted message' } }, location.origin)
  })
  await expect(page.locator('[data-provider-test="giscus"] .giscus-comment-host > .comment-status')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('a blocked provider asset produces a localized status without an Aurora page error', async ({ page }) => {
  await mockProviderAssets(page, true)
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto(route('/preflight/comments/'))
  await expect(page.locator('[data-provider-test="twikoo"]')).toContainText('Comments could not be loaded')
  expect(pageErrors).toEqual([])
})

test('a failed giscus iframe leaves article content and shows a localized status', async ({ page }) => {
  await mockProviderAssets(page)
  await page.route('https://giscus.app/**', (request) => request.abort())
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto(route('/preflight/comments/'))
  await expect(page.locator('[data-provider-test="giscus"]')).toContainText('Comments could not be loaded', { timeout: 20000 })
  expect(pageErrors).toEqual([])
})
