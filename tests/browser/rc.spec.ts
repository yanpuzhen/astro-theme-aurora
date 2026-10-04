import { test, expect } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const basePath = (process.env.PLAYWRIGHT_BASE_PATH || '').replace(/\/$/, '')
const route = (path: string) => `${basePath}${path}` || '/'

test.beforeAll(() => mkdirSync('output/playwright/visual', { recursive: true }))

test('home, article, taxonomy, archive and ordinary navigation load', async ({ page }) => {
  test.skip(Boolean(process.env.PLAYWRIGHT_PAGES), 'The RC suite targets the standalone Astro build.')
  await page.goto(route('/'))
  await expect(page).toHaveTitle(/Aurora/)
  await expect(page.locator('main')).toContainText(/Latest articles|最新文章/)
  expect(await page.locator('nav[aria-label="Primary navigation"] a').allTextContents()).toEqual(['Home', 'Tags', 'Categories', 'Archives', 'About'])

  const imageSources = await page.locator('img').evaluateAll((images) =>
    [...new Set(images.map((image) => image.getAttribute('src')).filter((src): src is string => typeof src === 'string' && src.startsWith('/')))],
  )
  expect(imageSources.length).toBeGreaterThan(0)
  for (const source of imageSources) {
    expect(source).not.toMatch(/\.[a-z0-9]+\/$/i)
    expect((await page.request.get(source)).ok()).toBeTruthy()
  }

  await page.goto(route('/post/legacy-markdown-parity/'))
  await expect(page.locator('article[data-pagefind-body]')).toContainText('Static HTML')
  await expect(page.locator('.post-html table')).toBeVisible()
  await expect(page.locator('.post-html pre')).toHaveAttribute('data-code-title', 'example.ts')
  const jsonLd = await page.locator('script[type="application/ld+json"]').evaluate((element) => element.textContent || '')
  expect(jsonLd).toContain('BlogPosting')

  for (const path of ['/tags/', '/tags/中文/', '/categories/', '/categories/engineering/frontend/', '/archives/', '/about/', '/links/']) {
    await page.goto(route(path))
    await expect(page.locator('main')).toBeVisible()
  }
})

test('Pagefind search returns a real result and navigates with the configured base', async ({ page }) => {
  test.skip(Boolean(process.env.PLAYWRIGHT_PAGES), 'The RC suite targets the standalone Astro build.')
  await page.goto(route('/search/'))
  const input = page.getByRole('searchbox', { name: 'Search' })
  await expect(page.locator('astro-island:has(input.search-input)')).not.toHaveAttribute('ssr', '')
  for (const query of ['Aurora', 'architecture', 'migration']) {
    await input.fill(query)
    await expect.poll(async () => page.locator('.search-result').count(), { message: `Pagefind query: ${query}` }).toBeGreaterThan(0)
  }
  await input.fill('Aurora')
  const href = await page.locator('.search-result').first().getAttribute('href')
  expect(href).toContain(basePath)
  await page.locator('.search-result').first().click()
  await expect(page.locator('.article-title, .page-heading').first()).toBeVisible()
})

test('Chinese Pagefind search stays inside the Chinese locale', async ({ page }) => {
  test.skip(Boolean(process.env.PLAYWRIGHT_PAGES), 'The RC suite targets the standalone Astro build.')
  await page.goto(route('/cn/search/'))
  const input = page.getByRole('searchbox', { name: '搜索' })
  await expect(page.locator('astro-island:has(input.search-input)')).not.toHaveAttribute('ssr', '')
  for (const query of ['迁移', '中文', 'Aurora 迁移']) {
    await input.fill(query)
    await expect.poll(async () => page.locator('.search-result').count(), { message: `Chinese Pagefind query: ${query}` }).toBeGreaterThan(0)
    await expect(page.locator('.search-result').first()).toHaveAttribute('href', /\/cn\//)
  }
})

test('header search keeps a static fallback and opens the Aurora modal', async ({ browser, page }) => {
  test.skip(Boolean(process.env.PLAYWRIGHT_PAGES), 'The RC suite targets the standalone Astro build.')
  await page.goto(route('/'))
  const trigger = page.getByRole('link', { name: 'Open search' })
  await expect(trigger).toHaveAttribute('href', `${basePath}/search/`)
  await expect(page.locator('astro-island:has(a.header-search-trigger)')).not.toHaveAttribute('ssr', '')
  await trigger.click()
  await expect(page.locator('.search-modal')).toBeVisible()
  const input = page.getByRole('searchbox', { name: 'Search' })
  await expect(input).toBeFocused()
  await input.fill('Aurora')
  await expect.poll(() => page.locator('.search-modal .search-result').count()).toBeGreaterThan(0)
  await page.keyboard.press('Escape')
  await expect(page.locator('.search-modal')).toHaveCount(0)

  const noJs = await browser.newContext({ javaScriptEnabled: false })
  const noJsPage = await noJs.newPage()
  await noJsPage.goto(route('/'))
  await expect(noJsPage.getByRole('link', { name: 'Open search' })).toHaveAttribute('href', `${basePath}/search/`)
  await noJs.close()
})

test('lightbox, code copy, mobile menu and persisted theme work', async ({ browser, page }) => {
  test.skip(Boolean(process.env.PLAYWRIGHT_PAGES), 'The RC suite targets the standalone Astro build.')
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(route('/post/legacy-markdown-parity/'))

  await page.locator('.post-html pre').scrollIntoViewIfNeeded()
  await expect(page.locator('.code-copy-button')).toBeVisible()
  await page.locator('.code-copy-button').click()
  await expect(page.locator('.code-copy-button')).not.toHaveText('Unavailable')

  await page.locator('.post-html img').click({ force: true })
  await expect(page.getByRole('button', { name: 'Close image' })).toBeVisible()
  await page.getByRole('button', { name: 'Close image' }).click()

  const menuTrigger = page.getByRole('button', { name: 'Open menu' })
  await menuTrigger.click()
  await expect(page.locator('#mobile-navigation')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#mobile-navigation')).toHaveCount(0)

  const html = page.locator('html')
  const before = await html.getAttribute('data-theme')
  await page.getByRole('button', { name: before === 'dark' ? 'Use light theme' : 'Use dark theme' }).click()
  const after = await html.getAttribute('data-theme')
  expect(after).not.toBe(before)
  await page.reload()
  await expect(html).toHaveAttribute('data-theme', after || '')

  await page.screenshot({ path: 'output/playwright/visual/article-mobile.png', fullPage: true })
  const visualPages = [
    ['home', '/'],
    ['article', '/post/legacy-markdown-parity/'],
    ['unicode', '/cn/post/unicode-torture/'],
    ['tags', '/tags/'],
    ['categories', '/categories/'],
    ['archives', '/archives/'],
    ['search', '/search/'],
  ] as const
  const viewports = [
    [1440, 900], [1280, 800], [768, 1024], [390, 844], [375, 812],
  ] as const
  for (const [width, height] of viewports) {
    const visual = await browser.newPage({ viewport: { width, height } })
    for (const [name, path] of visualPages) {
      await visual.goto(route(path))
      await expect(visual.locator('main')).toBeVisible()
      expect(await visual.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await visual.screenshot({
        path: `output/playwright/visual/${name}-${width}x${height}.png`,
        fullPage: true,
      })
    }
    await visual.close()
  }
})

test('comment mount exposes the stable identity manifest without submitting', async ({ page }) => {
  test.skip(Boolean(process.env.PLAYWRIGHT_PAGES), 'The RC suite targets the standalone Astro build.')
  const response = await page.request.get(route('/route-manifest.json'))
  expect(response.ok()).toBeTruthy()
  const manifest = await response.json()
  const legacy = manifest.find((entry: { id: string }) => entry.id === 'legacy-compatibility')
  expect(legacy).toMatchObject({
    canonicalPath: '/cn/legacy/custom-route/',
    legacyUid: 'legacy-fixture-uid-001',
    commentPath: '/post/legacy-compatibility/',
  })
})

test('static article and navigation remain readable with JavaScript disabled', async ({ browser }) => {
  test.skip(Boolean(process.env.PLAYWRIGHT_PAGES), 'The RC suite targets the standalone Astro build.')
  const noJs = await browser.newContext({ javaScriptEnabled: false })
  const page = await noJs.newPage()
  for (const path of ['/', '/post/legacy-markdown-parity/', '/cn/post/unicode-torture/', '/tags/', '/categories/', '/archives/']) {
    await page.goto(route(path))
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('The search index is unavailable')
  }
  await expect(page.locator('nav[aria-label="Primary navigation"]')).toBeVisible()
  await noJs.close()
})
