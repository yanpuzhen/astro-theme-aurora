import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const remote = {
  valine: 'https://unpkg.com/valine@1.5.3/dist/Valine.min.js',
  twikoo: 'https://cdn.jsdelivr.net/npm/twikoo@2.0.8/dist/twikoo.min.js',
  cloudbase: 'https://cdn.jsdelivr.net/npm/twikoo@2.0.8/dist/twikoo.all.min.js',
  walineJs: 'https://unpkg.com/@waline/client@3.15.2/dist/waline.js',
  walineCss: 'https://unpkg.com/@waline/client@3.15.2/dist/waline.css',
}

test('EN keeps 3.0.0 public-CDN provider delivery independently of Chinese site language', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.route(remote.valine, (route) => route.fulfill({ contentType: 'application/javascript', body: 'window.Valine=function(){}' }))
  const twikoo = 'window.twikoo={init:async()=>{},getRecentComments:async()=>[]}'
  await page.route(remote.twikoo, (route) => route.fulfill({ contentType: 'application/javascript', body: twikoo }))
  await page.route(remote.cloudbase, (route) => route.fulfill({ contentType: 'application/javascript', body: twikoo }))
  await page.route(remote.walineCss, (route) => route.fulfill({ contentType: 'text/css', body: '' }))
  await page.route(remote.walineJs, (route) => route.fulfill({ contentType: 'application/javascript', headers: { 'access-control-allow-origin': '*' }, body: 'export const init=()=>{};export const RecentComments=async()=>({comments:[]})' }))
  await page.route('https://giscus.app/**', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>giscus</title>' }))
  await page.goto('/')
  expect(requests.filter((url) => /(?:valine|twikoo|waline)/i.test(url))).toEqual([])
  await page.goto('/preflight/comments/')
  for (const url of [remote.valine, remote.twikoo, remote.walineJs, remote.walineCss]) {
    await expect.poll(() => requests.includes(url)).toBe(true)
  }
  expect(requests.some((url) => /\/_astro\/(?:valine|twikoo|waline)[^/]*\.(?:js|css)$/.test(url))).toBe(false)
  requests.length = 0
  await page.goto('/preflight/cloudbase/')
  await expect.poll(() => requests.includes(remote.cloudbase)).toBe(true)
})

test('EN Valine upstream client selects the LeanCloud endpoint for the fixture', async ({ page }) => {
  const requests: { url: string; headers: Record<string, string> }[] = []
  const staticRequests: string[] = []
  page.on('request', (request) => staticRequests.push(request.url()))
  await page.route(remote.valine, (route) => route.fulfill({ contentType: 'application/javascript', body: readFileSync('node_modules/valine/dist/Valine.min.js', 'utf8') }))
  await page.route(/https?:\/\/cdn\.jsdelivr\.net\/npm\/leancloud-storage@3\/dist\/av-min\.js/, (route) => route.fulfill({ contentType: 'application/javascript', body: readFileSync('node_modules/leancloud-storage/dist/av-min.js', 'utf8') }))
  await page.route('https://**/1.1/**', (route) => {
    requests.push({ url: route.request().url(), headers: route.request().headers() })
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"results":[]}' })
  })
  await page.route(remote.twikoo, (route) => route.fulfill({ contentType: 'application/javascript', body: 'window.twikoo={init:async()=>{},getRecentComments:async()=>[]}' }))
  await page.route(remote.walineCss, (route) => route.fulfill({ contentType: 'text/css', body: '' }))
  await page.route(remote.walineJs, (route) => route.fulfill({ contentType: 'application/javascript', headers: { 'access-control-allow-origin': '*' }, body: 'export const init=()=>{};export const RecentComments=async()=>({comments:[]})' }))
  await page.goto('/preflight/provider-valine/')
  await expect.poll(() => requests.some((item) => item.url.includes('/1.1/classes/Comment')), { timeout: 10_000 }).toBe(true)
  const comment = requests.find((item) => item.url.includes('/1.1/classes/Comment'))!
  expect(new URL(comment.url).host).toBe('leancloud.cn')
  expect(comment.headers['x-lc-id']).toBe('preflight-app-id')
  const [signature, timestamp] = comment.headers['x-lc-sign'].split(',')
  expect(signature).toBe(createHash('md5').update(`${timestamp}preflight-public-app-key`).digest('hex'))
  await expect(page.locator('[data-provider-test="valine"] .vemoji-btn')).toBeVisible()
  await page.locator('[data-provider-test="valine"] .vemoji-btn').click()
  await expect.poll(() => staticRequests.some((url) => new URL(url).host === 'img.t.sinajs.cn')).toBe(true)
})

test('EN Waline keeps upstream reaction assets', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.route(remote.valine, (route) => route.fulfill({ contentType: 'application/javascript', body: 'window.Valine=function(){}' }))
  await page.route(remote.twikoo, (route) => route.fulfill({ contentType: 'application/javascript', body: 'window.twikoo={init:async()=>{},getRecentComments:async()=>[]}' }))
  await page.route(remote.walineCss, (route) => route.fulfill({ contentType: 'text/css', body: readFileSync('node_modules/@waline/client/dist/waline.css', 'utf8') }))
  await page.route(remote.walineJs, (route) => route.fulfill({ contentType: 'application/javascript', headers: { 'access-control-allow-origin': '*' }, body: readFileSync('node_modules/@waline/client/dist/waline.js', 'utf8') }))
  await page.route('https://waline.example/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"code":0,"data":[],"comments":[]}' }))
  await page.goto('/preflight/comments/')
  await expect(page.locator('[data-provider-test="waline"] .wl-reaction')).toBeVisible()
  await expect.poll(() => requests.some((url) => /unpkg\.com\/@waline\/emojis\/tieba\//.test(url))).toBe(true)
})

test('EN Twikoo retains upstream OwO and Cap loading', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.route(remote.twikoo, (route) => route.fulfill({ contentType: 'application/javascript', body: readFileSync('node_modules/twikoo/dist/twikoo.min.js', 'utf8') }))
  await page.route('https://owo.imaegoo.com/owo.json', (route) => route.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: readFileSync('src/assets/twikoo-owo.json', 'utf8') }))
  await page.route('https://cdn.jsdmirror.com/npm/@cap.js/widget', (route) => route.fulfill({ contentType: 'application/javascript', body: 'window.Cap=function(){};customElements.define("cap-widget",class extends HTMLElement{})' }))
  await page.route('https://twikoo.example/**', (route) => {
    const event = route.request().postDataJSON()?.event
    const payload = event === 'GET_CONFIG'
      ? { code: 0, config: { SHOW_EMOTION: 'true', CAPTCHA_PROVIDER: 'Cap', CAP_BUILTIN: true } }
      : event === 'COMMENT_GET'
        ? { code: 0, data: [], count: 0, more: false }
        : { code: 0, data: [] }
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(payload) })
  })
  await page.goto('/preflight/twikoo-interactions/')
  await expect.poll(() => requests.includes('https://owo.imaegoo.com/owo.json')).toBe(true)
  await expect.poll(() => requests.includes('https://cdn.jsdmirror.com/npm/@cap.js/widget')).toBe(true)
  await expect(page.locator('.OwO-logo')).toBeVisible()
})
