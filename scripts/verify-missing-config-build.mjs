import assert from 'node:assert/strict'
import { mkdtempSync, existsSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const temporary = mkdtempSync(join(tmpdir(), 'aurora-missing-config-'))
const configPath = join(temporary, 'nonexistent.yml')
assert.equal(existsSync(configPath), false)
const env = { ...process.env, ASTRO_CONFIG_FILE: configPath }
// Force default behavior even if invoked from a CN/demo/browser fixture shell.
for (const key of ['ASTRO_BASE', 'ASTRO_SITE', 'ASTRO_DEMO_BUILD', 'ASTRO_PREFLIGHT_TESTS', 'PUBLIC_COMMENT_PROVIDER']) delete env[key]
try {
  const build = spawnSync('pnpm', ['build'], { cwd: root, env, stdio: 'inherit' })
  assert.equal(build.status, 0, 'Missing-config complete build (including copy scripts and Pagefind)')
  assert.ok(existsSync(join(root, 'dist/pagefind/pagefind.js')), 'Pagefind final phase completed')
  assert.match(readFileSync(join(root, 'dist/index.html'), 'utf8'), /My Aurora Blog/)
  const verify = spawnSync(process.execPath, ['scripts/verify-cdn.mjs'], { cwd: root, env, stdio: 'inherit' })
  assert.equal(verify.status, 0, 'Missing-config artifact uses EN defaults, with no copied CN runtime assets')
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
console.log('Missing-config complete build and EN/default output: PASS')
