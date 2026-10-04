import { expect, test } from '@playwright/test'

// The same assertions run on real Astro dev and production static output.
const base = (process.env.PLAYWRIGHT_BASE_PATH || '').replace(/\/$/, '')
const forbidden = /(?:unpkg\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.(?:googleapis|gstatic)\.com|img\.t\.sinajs\.cn|owo\.imaegoo\.com|cdn\.jsdmirror\.com)/i

test('local CN asset parity: complete fixed namespaces and MIME types', async ({ page }) => {
  const requests: string[] = []
  const errors: string[] = []
  page.on('request', request => requests.push(request.url()))
  page.on('pageerror', error => errors.push(error.message))
  await page.route('https://twikoo.example/**', route => {
    const event = route.request().postDataJSON()?.event
    const body = event === 'GET_CONFIG'
      ? { code: 0, config: { SHOW_EMOTION: 'true', CAPTCHA_PROVIDER: 'Cap', CAP_BUILTIN: true } }
      : { code: 0, data: [], count: 0, more: false }
    return route.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) })
  })
  await page.goto(`${base}/preflight/twikoo-interactions/`)
  await expect(page.locator('[data-provider-test="twikoo"] textarea')).toBeVisible()
  await expect(page.locator('[data-provider-test="twikoo"]')).not.toContainText('Unable to load')
  const files = [
    ['vendor/twikoo/2.0.8/twikoo.min.js', 'javascript'],
    ['vendor/twikoo/2.0.8/twikoo.all.min.js', 'javascript'],
    ['vendor/twikoo/2.0.8/owo.json', 'application/json'],
    ['vendor/twikoo/2.0.8/cap.min.js', 'javascript'],
    ['vendor/twikoo/2.0.8/cap_wasm_bg.wasm', 'application/wasm'],
    ['vendor/twikoo/2.0.8/hashwx.wasm', 'application/wasm'],
    ['vendor/twikoo/2.0.8/pako_inflate.min.js', 'javascript'],
    ['prismjs/1.28.0/components/prism-python.js', 'javascript'],
    ['prismjs/1.28.0/components/prism-python.min.js', 'javascript'],
    ['prismjs/1.28.0/themes/prism-okaidia.css', 'text/css'],
    ['prismjs/1.28.0/themes/prism-okaidia.min.css', 'text/css'],
  ]
  for (const [file, mime] of files) {
    const result = await page.evaluate(async path => {
      const response = await fetch(path)
      return { status: response.status, type: response.headers.get('content-type'), size: (await response.arrayBuffer()).byteLength }
    }, `${base}/_astro/${file}`)
    expect(result.status, file).toBe(200)
    expect(result.type, file).toContain(mime)
    expect(result.size, file).toBeGreaterThan(0)
  }
  expect(requests.filter(url => forbidden.test(url))).toEqual([])
  expect(errors).toEqual([])
})

test('dev middleware rejects raw traversal and non-approved package files', async ({ request }) => {
  test.skip(process.env.PLAYWRIGHT_DEV !== 'true', 'Dev-only filesystem boundary')
  for (const path of [
    'prismjs/1.28.0/components/%2e%2e%2fpackage.json',
    'prismjs/1.28.0/components/%2e%2e%5cpackage.json',
    'prismjs/1.28.0/components/prism-python.min.js%00',
    'prismjs/1.28.0/package.json',
    'vendor/twikoo/2.0.8/%2e%2e%2fpackage.json',
  ]) {
    const response = await request.get(`${base}/_astro/${path}`)
    expect(response.status(), path).not.toBe(200)
  }
})
