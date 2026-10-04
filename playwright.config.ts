import { defineConfig, devices } from '@playwright/test'

const origin = process.env.PLAYWRIGHT_ORIGIN || 'http://127.0.0.1:4321'
const basePath = (process.env.PLAYWRIGHT_BASE_PATH || '').replace(/\/$/, '')
const pagesBuild = process.env.PLAYWRIGHT_PAGES === 'true'
const devServer = process.env.PLAYWRIGHT_DEV === 'true'
const serverCommand = devServer
  ? 'pnpm dev --host 127.0.0.1 --port 4321'
  : pagesBuild
  ? 'node scripts/serve-pages.mjs --port 4321'
  : basePath
  ? 'node scripts/serve-static-base.mjs --port 4321'
  : 'pnpm exec astro preview --host 127.0.0.1 --port 4321'

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'output/playwright/report', open: 'never' }]],
  use: { baseURL: origin, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    command: serverCommand,
    env: { ...(devServer ? { ASTRO_BASE: `${basePath}/` } : {}), PLAYWRIGHT_BASE_PATH: basePath },
    url: `${origin}${pagesBuild ? '/astro-theme-aurora/' : `${basePath}/`}`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
