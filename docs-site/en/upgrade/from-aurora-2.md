# From Aurora 2.x

Aurora 3 is a static Astro implementation, not an in-place Hexo runtime upgrade. Preserve the old site and provider records until canonical URLs and comment identities have been compared.

## Migrate configuration

Copy the concepts you use into the root `_config.yml`; routine settings no longer belong in `src/lib/config.ts`. Effective precedence is **environment overrides > `_config.yml` > Aurora defaults**. `ASTRO_SITE` and `ASTRO_BASE` are convenient deployment overrides. Missing YAML falls back to defaults; invalid canonical YAML fails the build.

| Aurora 2 concept | Aurora 3 destination | Compatibility |
| --- | --- | --- |
| `site.title/author/description/avatar/language` | `site.*` | Same concept; normalized names. |
| `site.started_date` | `site.started_date` | Same; `startedDate` alias also accepted. |
| `site.url/root` | `site.url` + `site.base` | Split origin and deployment path. |
| `menu` title/url objects | boolean `menu` flags | Built-in routes only; custom labels/targets are not imported. |
| `socials` object | list of `{ label, href, icon }` | Links retained where mappable; custom HTML icons are not. |
| root provider sections | `comments.provider` + `comments.<provider>` | Selected camelCase aliases normalize. |
| `aurora_bot` | `dia` | Renamed with a warning. |
| `site.beian` / `police_beian` | `footer.beian` | Moved with a warning. |
| `site_meta.description`, `keywords`, `author`, `favicon` | `site` / `seo` | Supported legacy metadata maps with a warning. |
| `site_meta.cdn` | `site_meta.cdn` | `en` / `cn` retained; CN now self-hosts Aurora-managed static runtime assets. |
| `busuanzi` | none | No analytics backend is included. |
| `authors`, `copy_protection`, `injects`, `footer_links`, legacy Shiki options | none | Not supported; warnings explain dropped fields. |

Example:

```yaml
site:
  title: My Blog
  author: Your Name
  url: https://example.com
  base: /
comments:
  provider: waline
  waline:
    server_url: https://comments.example.com
```

### Gitalk → giscus

Gitalk is removed from the Aurora 3 runtime. Upstream Gitalk requires a browser-side OAuth client secret; Aurora does not expose one or provide a proxy. A stale `comments.provider: gitalk` fails with a migration error. Aurora 2 root `gitalk` settings are detected for a warning, then discarded without reading or serializing field values. The migration-only `legacyGitalkIdentity()` helper can calculate historical UID or pathname keys for comparison; it is not a provider.

1. Back up and identify the old Gitalk Issues and their page identities.
2. Enable GitHub Discussions and install the giscus App on the target public repository.
3. Convert representative Issues to Discussions using GitHub's conversion action. Conversion alone does not establish a page match.
4. On [giscus.app](https://giscus.app), obtain `repo_id` and `category_id`, then configure `comments.provider: giscus` as shown in [Integrations](/configs/integrations).
5. Match converted Discussion titles to your chosen mapping. `pathname` includes the deployed base and locale; changing `ASTRO_BASE` or a permalink changes the key. Use `specific` with `term: "{legacyUid}"` for per-page stable UIDs only if converted Discussion titles match. A literal `specific` term or global `number` makes every page share one Discussion; use those only deliberately.
6. Verify several old posts and translations against real Discussions before cutover. Keep old Issues until this check succeeds. Aurora cannot automatically turn Gitalk UID/pathname keys into giscus Discussions.

## Content and verification

1. Copy posts to `src/content/posts/` and pages to `src/content/pages/`; keep legacy frontmatter until checks pass.
2. Preserve exact title inputs when legacy UIDs are derived; changing whitespace or Unicode normalization can change IDs.
3. Review custom permalinks, `.html` aliases, and base-aware assets.
4. Set `site.url`/`site.base` in YAML or override them in the deployment environment.
5. Compare actual provider IDs/records before switching traffic. Fixtures cannot prove production continuity.
6. Run `pnpm check`, `pnpm build`, and any migration-specific browser checks you need. Deploy the ordinary `dist/` artifact following [Deployment](/deploy/); the repository maintainer Docs/Demo Pages scripts are not required for a user blog.

Astro owns static routes, content, SEO, feeds, and HTML. Vue Router, SPA article state, runtime `/api/*.json`, analytics backends, Gitalk's unsafe static secret flow, and automatic Markdown scripts are not part of Aurora 3.
