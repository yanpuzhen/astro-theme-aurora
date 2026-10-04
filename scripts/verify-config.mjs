import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { loadAuroraConfig } from '../src/lib/config-loader.ts'

const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'aurora-config-test-'))
let counter = 0
function load(yaml, env = {}) {
  const configPath = resolve(temporaryRoot, `fixture-${counter++}.yml`)
  writeFileSync(configPath, yaml, 'utf8')
  return loadAuroraConfig({ configPath, cwd: temporaryRoot, env })
}
function throwsWith(callback, expectation) {
  assert.throws(callback, (error) => {
    const message = String(error.message)
    if (expectation instanceof RegExp) {
      assert.match(message, expectation)
    } else {
      assert.equal(typeof expectation, 'function', 'expectation must be a RegExp or predicate')
      assert.equal(expectation(error), true, 'error predicate did not accept the thrown error')
    }
    return true
  })
}

try {
  const missing = loadAuroraConfig({ configPath: resolve(temporaryRoot, 'missing.yml'), cwd: temporaryRoot, env: {} })
  assert.equal(missing.site.title, 'My Aurora Blog')
  assert.equal(missing.comments.provider, 'none')
  assert.equal(missing.siteMeta.cdn, 'en')
  assert.equal(load('site:\n  language: zh-CN\nsite_meta:\n  cdn: en\n').siteMeta.cdn, 'en')
  assert.equal(load('site:\n  language: en\nsite_meta:\n  cdn: cn\n').siteMeta.cdn, 'cn')
  const reactionWarnings = []
  const reactionPath = resolve(temporaryRoot, `fixture-${counter++}.yml`)
  writeFileSync(reactionPath, 'site_meta:\n  cdn: cn\ncomments:\n  waline:\n    reaction: true\n')
  const cnReaction = loadAuroraConfig({ configPath: reactionPath, cwd: temporaryRoot, env: {}, onWarning: (warning) => reactionWarnings.push(warning) })
  assert.equal(cnReaction.comments.waline.reaction, false)
  assert.match(reactionWarnings.join(' '), /reaction: true is unavailable.*cdn: cn/i)
  assert.equal(load('site_meta:\n  cdn: en\ncomments:\n  waline:\n    reaction: true\n').comments.waline.reaction, true)
  for (const bad of ['auto', 'zh-CN', 'true', 'false', '42', 'null', '[]', '{}', '""']) throwsWith(() => load(`site_meta:\n  cdn: ${bad}\n`), /site_meta\.cdn/)
  throwsWith(() => load('site_meta:\n  cdn: cn\n  unknown: value\n'), /site_meta: unknown key: unknown/)
  const migrated = load('site_meta:\n  cdn: cn\n  description: Legacy description\n  keywords: one, two\n')
  assert.equal(migrated.siteMeta.cdn, 'cn')
  assert.equal(migrated.site.description, 'Legacy description')
  assert.deepEqual(migrated.seo.keywords, ['one', 'two'])
  assert.deepEqual(missing.i18n.locales, ['en', 'zh-CN'])
  assert.ok(Object.isFrozen(missing) && Object.isFrozen(missing.theme.gradient))

  const custom = load(`
site:
  title: Config UI Smoke
  subtitle: Visible subtitle
  author: Ada Example
  description: Site configuration is working.
  avatar: /fixtures/aurora-placeholder.svg
  started_date: '2020-02-29'
  url: https://blog.example
  base: /blog/theme/
i18n:
  default_locale: en
  locales: [en, zh-CN]
theme:
  dark_mode: false
  profile_shape: rounded
  gradient:
    color_1: '#102030'
    color_2: '#405060'
    color_3: '#708090'
menu:
  home: true
  tags: false
  categories: true
  archives: true
  about: true
  links: true
socials:
  - label: GitHub
    href: https://github.com/example
    icon: github
comments:
  provider: waline
  waline:
    server_url: https://comments.example
    page_size: 12
dia:
  enabled: true
  locale: zh-CN
  tips: [你好，Dia]
footer:
  show_version: false
  statistics:
    page_views: '120'
links:
  - name: Example
    url: https://example.org
    avatar: /friend.png
    category: Friends
seo:
  keywords: [aurora, astro]
`)
  assert.equal(custom.site.title, 'Config UI Smoke')
  assert.equal(custom.site.subtitle, 'Visible subtitle')
  assert.equal(custom.site.author, 'Ada Example')
  assert.equal(custom.site.startedDate, '2020-02-29')
  assert.equal(custom.site.base, '/blog/theme/')
  assert.equal(custom.theme.profileShape, 'rounded')
  assert.deepEqual(custom.theme.gradient, ['#102030', '#405060', '#708090'])
  assert.equal(custom.menu.tags, false)
  assert.equal(custom.menu.links, true)
  assert.equal(custom.socials[0].href, 'https://github.com/example')
  assert.equal(custom.dia.enabled, true)
  assert.equal(custom.dia.tips[0], '你好，Dia')
  assert.equal(custom.comments.provider, 'waline')
  assert.equal(custom.comments.waline.pageSize, 12)
  assert.equal(custom.footer.showVersion, false)
  assert.equal(custom.links[0].name, 'Example')

  const overridden = load(`
site:
  title: YAML Title
  url: https://yaml.example
  base: /yaml/
comments:
  provider: waline
  waline:
    server_url: https://yaml-comments.example
dia:
  enabled: true
`, {
    PUBLIC_AURORA_TITLE: 'ENV Title', ASTRO_SITE: 'https://env.example', ASTRO_BASE: '/nested/base/',
    PUBLIC_COMMENT_PROVIDER: 'twikoo', PUBLIC_TWIKOO_ENV_ID: 'https://twikoo.example',
    PUBLIC_AURORA_DIA: 'false',
  })
  assert.equal(overridden.site.title, 'ENV Title')
  assert.equal(overridden.site.url, 'https://env.example')
  assert.equal(overridden.site.base, '/nested/base/')
  assert.equal(overridden.comments.provider, 'twikoo')
  assert.equal(overridden.comments.twikoo.envId, 'https://twikoo.example')
  assert.equal(overridden.dia.enabled, false)

  const aliasesWarnings = []
  const aliasPath = resolve(temporaryRoot, 'legacy.yml')
  writeFileSync(aliasPath, `
site:
  title: Legacy site
  startedDate: '2018-01-02'
  language: zh
  beian:
    number: ICP 123
    policeNumber: 公安 123
menu:
  About: true
  Tags: false
  Friends: true
valine:
  enable: true
  appId: legacy-app
  appKey: legacy-key
  recentComment: false
aurora_bot:
  enable: true
  locale: zh-CN
  tips: [Legacy Dia]
`, 'utf8')
  const legacy = loadAuroraConfig({ configPath: aliasPath, cwd: temporaryRoot, env: {}, onWarning: (message) => aliasesWarnings.push(message) })
  assert.equal(legacy.site.startedDate, '2018-01-02')
  assert.equal(legacy.site.language, 'zh-CN')
  assert.equal(legacy.menu.tags, false)
  assert.equal(legacy.menu.links, true)
  assert.equal(legacy.comments.provider, 'valine')
  assert.equal(legacy.comments.valine.appId, 'legacy-app')
  assert.equal(legacy.comments.recentComments.enabled, false)
  assert.equal(legacy.dia.enabled, true)
  assert.equal(legacy.footer.beian.policeNumber, '公安 123')
  assert.ok(aliasesWarnings.some((warning) => warning.includes('aurora_bot')))

  throwsWith(() => load('site:\n  title: [unfinished\n'), /Unable to parse .*line/i)
  throwsWith(() => load('theme:\n  profile_shape: triangle\n'), /theme\.profile_shape/)
  throwsWith(() => load('comments:\n  provider: unknown\n'), /comments\.provider/)
  throwsWith(() => load('comments: not-an-object\n'), /comments: expected object/i)
  throwsWith(() => load('comments:\n  waline: not-an-object\n'), /comments\.waline: expected object/i)
  throwsWith(() => load('comments:\n  provider: waline\n  waline:\n    server_urll: https://example.com\n'), /comments\.waline: unknown key: server_urll/)
  throwsWith(() => load('socials:\n  - label: unsafe\n    href: javascript:alert(1)\n'), /socials\.0\.href/)
  throwsWith(() => load('site:\n  started_date: 2023-02-29\n'), /site\.started_date/)
  throwsWith(() => load('site:\n  base: ../unsafe\n'), /site\.base/)
  throwsWith(() => load('', { PUBLIC_AURORA_DIA: 'sometimes' }), /PUBLIC_AURORA_DIA must be true or false/)

  const giscusYaml = (overrides = '') => `comments:\n  provider: giscus\n  giscus:\n    repo: example/comments\n    repo_id: R_test\n    category: General\n    category_id: DIC_test\n${overrides}`
  const giscus = load(giscusYaml('    mapping: pathname\n'))
  assert.equal(giscus.comments.provider, 'giscus')
  assert.equal(giscus.comments.giscus.repo, 'example/comments')
  assert.equal(giscus.comments.giscus.repoId, 'R_test')
  assert.equal(giscus.comments.giscus.categoryId, 'DIC_test')
  assert.equal(giscus.comments.giscus.mapping, 'pathname')
  assert.equal(giscus.comments.giscus.theme, 'auto')
  assert.equal(giscus.comments.giscus.lang, 'auto')
  assert.equal(giscus.comments.giscus.loading, 'eager')
  assert.equal(giscus.comments.giscus.reactionsEnabled, true)
  for (const mapping of ['url', 'pathname', 'title', 'og:title']) {
    assert.equal(load(giscusYaml(`    mapping: ${mapping}\n`)).comments.giscus.mapping, mapping)
  }
  assert.equal(load(giscusYaml('    mapping: specific\n    term: stable-post-key\n')).comments.giscus.term, 'stable-post-key')
  assert.equal(load(giscusYaml('    mapping: number\n    term: "42"\n')).comments.giscus.term, '42')
  throwsWith(() => load(giscusYaml('    mapping: specific\n')), /comments\.giscus\.term/)
  throwsWith(() => load(giscusYaml('    mapping: number\n')), /comments\.giscus\.term/)
  throwsWith(() => load(giscusYaml('    mapping: number\n    term: "0"\n')), /comments\.giscus\.term/)
  throwsWith(() => load(giscusYaml('    mapping: bogus\n')), /comments\.giscus\.mapping/)
  throwsWith(() => load(giscusYaml('    theme: https:\/\/evil.example\/theme.css\n')), /comments\.giscus\.theme/)
  throwsWith(() => load(giscusYaml().replace('repo: example/comments', 'repo: javascript:alert(1)')), /comments\.giscus\.repo/)
  throwsWith(() => load('comments:\n  provider: giscus\n'), /comments\.giscus\.(?:repo|repo_id|category_id)/)
  throwsWith(() => load('comments:\n  provider: giscus\n  giscus:\n    repo: example/comments\n    repo_id: R_test\n'), /comments\.giscus\.category_id/)
  assert.equal(load('comments:\n  provider: giscus\n  giscus:\n    repo: example/comments\n    repo_id: R_test\n    mapping: number\n    term: "7"\n').comments.giscus.mapping, 'number')

  const gitalkWarnings = []
  const gitalkPath = resolve(temporaryRoot, 'legacy-gitalk.yml')
  const sentinel = 'NEVER-SERIALIZE-GITALK-CREDENTIAL-7f9c'
  writeFileSync(gitalkPath, `gitalk:\n  enable: true\n  id: pathname\n  clientSecret: ${sentinel}\n  client_secret: second-${sentinel}\n`, 'utf8')
  const legacyGitalk = loadAuroraConfig({ configPath: gitalkPath, cwd: temporaryRoot, env: {}, onWarning: (message) => gitalkWarnings.push(message) })
  assert.equal(legacyGitalk.comments.provider, 'none')
  assert.equal('gitalk' in legacyGitalk.comments, false)
  assert.ok(gitalkWarnings.some((warning) => warning.includes('Legacy Aurora 2 Gitalk configuration detected')))
  assert.doesNotMatch(JSON.stringify(legacyGitalk), new RegExp(sentinel))
  assert.ok(gitalkWarnings.every((warning) => !warning.includes(sentinel)))
  const malformedSectionPath = resolve(temporaryRoot, 'legacy-gitalk-malformed-section.yml')
  writeFileSync(malformedSectionPath, `gitalk:\n  clientSecret: ${sentinel}\ncomments: invalid\n`, 'utf8')
  throwsWith(() => loadAuroraConfig({ configPath: malformedSectionPath, cwd: temporaryRoot, env: {}, onWarning: (message) => gitalkWarnings.push(message) }), (error) => {
    assert.doesNotMatch(error.message, new RegExp(sentinel))
    return true
  })
  const malformedLegacyPath = resolve(temporaryRoot, 'malformed-legacy-gitalk.yml')
  writeFileSync(malformedLegacyPath, `gitalk:\n  clientSecret: ${sentinel}\n  broken: [\n`, 'utf8')
  throwsWith(() => loadAuroraConfig({ configPath: malformedLegacyPath, cwd: temporaryRoot, env: {} }), (error) => {
    assert.match(error.message, /Unable to parse/)
    assert.doesNotMatch(error.message, new RegExp(sentinel))
    return true
  })
  throwsWith(() => load('comments:\n  provider: gitalk\n'), /comments\.provider: gitalk is no longer supported.*giscus.*Waline.*Twikoo.*Valine/s)
  throwsWith(() => load('site:\n  language: zh-CN\ncomments:\n  provider: gitalk\n'), /comments\.provider: gitalk.*giscus.*Waline.*Twikoo.*Valine/s)
  throwsWith(() => load(`comments:\n  gitalk:\n    clientSecret: ${sentinel}\n`), (error) => {
    assert.match(error.message, /comments: unknown key: gitalk/)
    assert.doesNotMatch(error.message, new RegExp(sentinel))
    return true
  })
  throwsWith(() => load('', { PUBLIC_COMMENT_PROVIDER: 'gitalk' }), /comments\.provider: gitalk is no longer supported/)
  const ignoredEnvWarnings = []
  const ignoredEnv = loadAuroraConfig({
    configPath: resolve(temporaryRoot, 'missing-env.yml'), cwd: temporaryRoot,
    env: { PUBLIC_GITALK_CLIENT_SECRET: sentinel, PUBLIC_GITALK_ID_MODE: 'pathname' },
    onWarning: (message) => ignoredEnvWarnings.push(message),
  })
  assert.equal(ignoredEnv.comments.provider, 'none')
  assert.equal('gitalk' in ignoredEnv.comments, false)
  assert.ok(ignoredEnvWarnings.some((warning) => warning.includes('Obsolete Gitalk environment settings were ignored')))
  assert.ok(ignoredEnvWarnings.every((warning) => !warning.includes(sentinel)))
  assert.doesNotMatch(JSON.stringify(ignoredEnv), new RegExp(sentinel))

  const envExample = readFileSync('.env.example', 'utf8')
  const exampleConfig = readFileSync('_config.yml', 'utf8')
  assert.doesNotMatch(envExample, /CLIENT_SECRET|clientSecret|client_secret/i)
  assert.doesNotMatch(exampleConfig, /CLIENT_SECRET|clientSecret|client_secret/i)

  console.log('Verified Aurora config defaults, YAML errors, schema paths, environment precedence, giscus validation, Gitalk rejection, and credential non-disclosure.')
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
