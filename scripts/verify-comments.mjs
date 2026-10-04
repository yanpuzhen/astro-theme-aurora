import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { commentAdapters, providerDelivery, twikooUsesCloudBase } from '../src/lib/comment-adapters.ts'
import { commentIdentity, commentIdentityAliases } from '../src/lib/comments.ts'
import { legacyGitalkIdentity, legacyGitalkIdentityAliases } from '../src/lib/migration/gitalk.ts'
import { normalizeRecentComments } from '../src/lib/recent-comments.ts'

assert.deepEqual(Object.keys(commentAdapters).sort(), ['giscus', 'none', 'twikoo', 'valine', 'waline'])
assert.equal('gitalk' in commentAdapters, false, 'Gitalk must not be represented as a bundled adapter')
assert.equal(commentAdapters.giscus.version, '3.1.1')
assert.equal(commentAdapters.giscus.supportsRecentComments, false)
assert.equal(commentAdapters.giscus.supportsCommentCount, false)
assert.equal(commentAdapters.valine.runtimeStatus, 'ready')
assert.equal(commentAdapters.twikoo.runtimeStatus, 'ready')
assert.equal(commentAdapters.waline.runtimeStatus, 'ready')
assert.equal(twikooUsesCloudBase('env-123'), true)
assert.equal(twikooUsesCloudBase('https://comments.example'), false)
assert.equal(twikooUsesCloudBase(''), false)
assert.equal(providerDelivery('en'), 'remote')
assert.equal(providerDelivery('cn'), 'local')
assert.equal(commentAdapters.valine.version, '1.5.3')
assert.equal(commentAdapters.twikoo.version, '2.0.8')
assert.equal(commentAdapters.waline.version, '3.15.2')
assert.equal(commentAdapters.waline.supportsRecentComments, true)
assert.equal(commentAdapters.twikoo.supportsRecentComments, true)
assert.equal(commentAdapters.valine.supportsRecentComments, false)
assert.equal(commentAdapters.none.scriptUrl, undefined)
assert.equal(commentAdapters.none.styleUrls.length, 0)
assert.equal(commentAdapters.none.runtimeStatus, 'disabled')

const identity = { legacyUid: 'legacy-uid', canonicalPath: '/cn/post/a/', legacyPath: '/post/a.html', providerId: 'uid' }
assert.equal(legacyGitalkIdentity(identity), 'legacy-uid')
assert.equal(legacyGitalkIdentity(identity, 'pathname'), '/post/a.html/')
assert.equal(commentIdentity('giscus', identity), '/cn/post/a/')
assert.equal(commentIdentity('valine', identity), '/post/a.html')
assert.equal(commentIdentity('twikoo', identity), '/post/a.html/')
assert.equal(commentIdentity('waline', identity), '/post/a.html/')
assert.ok(legacyGitalkIdentityAliases(identity).includes('legacy-uid'))
assert.ok(commentIdentityAliases('waline', identity).includes('legacy-uid'))
for (const provider of ['giscus', 'valine', 'twikoo', 'waline']) {
  assert.equal(commentIdentity(provider, { ...identity, canonicalPath: '/cn/über/a/', legacyPath: '/über/a.html' }).includes('javascript:'), false)
}

const normalized = normalizeRecentComments([
  { id: 'safe', nick: 'Alice', commentText: '<b>Hello</b> & welcome', url: '/blog/theme/cn/post/a/', avatar: 'https://cdn.example/avatar.png', created: 1720000000000 },
  { nick: 'Mallory', commentText: '<script>run()</script>', url: 'javascript:alert(1)' },
  { nick: 'Remote', commentText: 'off site', url: 'https://evil.example/post/' },
  { nick: 'Relative', commentText: 'not rooted', url: 'post/a/' },
], '/blog/theme/', 'https://blog.example')
assert.equal(normalized.length, 1)
assert.equal(normalized[0].author, 'Alice')
assert.equal(normalized[0].content, 'Hello & welcome')
assert.equal(normalized[0].href, '/blog/theme/cn/post/a/')
assert.equal(normalized[0].avatar, 'https://cdn.example/avatar.png')
assert.ok(normalized[0].createdAt)
assert.equal(normalizeRecentComments([{ nick: 'Script', commentText: '<script>alert(1)</script>visible', url: '/safe/' }], '/', 'https://blog.example')[0].content, 'visible')
assert.equal(normalizeRecentComments([{ nick: 'Creds', commentText: 'avatar', url: '/safe/', avatar: 'https://user:pass@cdn.example/avatar.png' }], '/', 'https://blog.example')[0].avatar, undefined)

const island = readFileSync('src/islands/CommentIsland.vue', 'utf8')
const adapters = readFileSync('src/lib/comment-adapters.ts', 'utf8')
assert.doesNotMatch(`${island}\n${adapters}`, /clientSecret|CLIENT_SECRET/i)
assert.doesNotMatch(adapters, /gitalk(?:@|\.min\.js|\.css)/i)
assert.match(adapters, /@waline\/client@3\.15\.2\/dist\/waline\.css/)

function publicTextFiles(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return publicTextFiles(path)
    return /\.(?:html?|css|js|mjs|json|map)$/i.test(entry.name) ? [path] : []
  })
}
for (const directory of ['dist', '.pages-dist/demo']) {
  for (const path of publicTextFiles(directory)) {
    const content = readFileSync(path, 'utf8')
    // Third-party provider bundles may contain their own clientSecret identifiers.
    if (!/\/(?:twikoo|valine|waline)(?:\.|-)/i.test(path)) {
      assert.doesNotMatch(content, /(?:clientSecret|client_secret|CLIENT_SECRET)\s*[:=]/, `${path} must not publish a Gitalk secret setting`)
    }
    assert.doesNotMatch(content, /NEVER-SERIALIZE-GITALK-CREDENTIAL-7f9c/)
    assert.doesNotMatch(content, /gitalk(?:@1\.8|\.min\.js|\.css)/i, `${path} must not load Gitalk runtime assets`)
  }
}
console.log('Verified runtime providers, migration-only Gitalk identities, recent-comment normalization, and no Gitalk secret/runtime exposure in published assets.')
