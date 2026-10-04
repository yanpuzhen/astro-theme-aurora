import { expect, test } from '@playwright/test'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'

const base = (process.env.PLAYWRIGHT_BASE_PATH || '').replace(/\/$/, '')

for (const [suffix, host] of [['', 'leancloud.cn'], ['-9Nh9j0Va', 'tab.leancloud.cn'], ['-MdYXbMMI', 'us.leancloud.cn']]) {
  test(`Valine EN/CN backend parity for ${suffix || 'default'} region`, async ({ page }) => {
    const appId = `parity-app${suffix}`
    const key = 'public-parity-key'
    const results: { url: string; headers: Record<string, string> }[] = []
    await page.route('https://**/1.1/**', route => {
      results.push({ url: route.request().url(), headers: route.request().headers() })
      return route.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"results":[]}' })
    })
    await page.route('https://unpkg.com/valine@1.5.3/dist/Valine.min.js', route => route.fulfill({ contentType: 'application/javascript', body: readFileSync('node_modules/valine/dist/Valine.min.js', 'utf8') }))
    await page.route('https://cdn.jsdelivr.net/npm/leancloud-storage@3.15.0/dist/av-min.js', route => route.fulfill({ contentType: 'application/javascript', body: readFileSync('node_modules/leancloud-storage/dist/av-min.js', 'utf8') }))
    const local = readdirSync('dist/_astro').find(name => /^valine\.[^.]+\.js$/.test(name))!
    for (const mode of ['en', 'cn']) {
      results.length = 0
      await page.goto(`${base}/preflight/provider-none/`)
      if (mode === 'en') {
        // The real upstream distribution, with deterministic local delivery of
        // its CDN files. Service request construction is not mocked.
        await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/leancloud-storage@3.15.0/dist/av-min.js' })
        await page.addScriptTag({ url: 'https://unpkg.com/valine@1.5.3/dist/Valine.min.js' })
      }
      await page.evaluate(async ({ mode, path, appId, key }) => {
        const host = document.createElement('div')
        document.body.append(host)
        const Constructor = mode === 'cn' ? (await import(/* @vite-ignore */ path)).default : (window as any).Valine
        new Constructor({ el: host, appId, appKey: key })
      }, { mode, path: `${base}/_astro/${local}`, appId, key })
      await expect.poll(() => results.some(result => result.url.includes('/1.1/classes/Comment'))).toBe(true)
      const request = results.find(result => result.url.includes('/1.1/classes/Comment'))!
      expect(new URL(request.url).host, mode).toBe(host)
      expect(request.headers['x-lc-id'], mode).toBe(appId)
      const [signature, timestamp] = request.headers['x-lc-sign'].split(',')
      expect(signature, mode).toBe(createHash('md5').update(`${timestamp}${key}`).digest('hex'))
    }
  })
}
