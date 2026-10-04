# Migrating from Aurora 2.x to Aurora 3.0

Aurora 3.0 is a static Astro implementation of Aurora. It preserves the compatibility information that can be established from the legacy theme/plugin and uses Vue only for focused browser interactions. It does not run the old Hexo/Vue SPA at runtime.

This guide is written for a real Aurora 2.x site. The repository fixtures prove the migration contract, but no production article corpus or external comment-provider records were available here. Verify representative URLs and comment threads from the site being migrated before switching traffic.

## Before you migrate

Record the existing site's generated URLs, titles, frontmatter, comment-provider settings, asset paths, and deployment root. Preserve a copy of the old generated site and provider configuration until the new build has been checked. In particular, collect the current canonical path and comment key for every post whose title or slug will change.

Install the required toolchain and create a working copy:

```sh
git clone https://github.com/yanpuzhen/astro-theme-aurora.git
cd ./astro-theme-aurora
pnpm install --frozen-lockfile
```

## Move routine settings to `_config.yml`

Aurora 3 loads the root `_config.yml` at build time, normalizes selected Aurora 2 aliases, validates the result, applies defaults, then applies environment overrides. Precedence is **environment overrides > `_config.yml` > Aurora defaults**. If the file is missing, defaults are used; malformed YAML, unknown canonical keys, and invalid values stop the build with a configuration path.

Start with a small configuration and add only settings you use:

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

`ASTRO_SITE` and `ASTRO_BASE` remain deployment overrides and take precedence over the corresponding YAML fields. Do not edit `src/lib/config.ts` for routine setup, and do not place private credentials in YAML or `PUBLIC_*` variables: static build values are public.

| Aurora 2 field | Aurora 3 destination | Status |
| --- | --- | --- |
| `site.title`, `author`, `description`, `avatar`, `language` | `site.*` in `_config.yml` | SAME / normalized |
| `site.started_date` | `site.started_date` | SAME; camel-case `startedDate` is an alias |
| `site.url`, deploy root | `site.url`, `site.base`; ENV can override | RENAMED / deployment override |
| `menu.Home/Tags/Categories/Archives/About/Friends` | lowercase `menu.home/tags/categories/archives/about/links` booleans | RENAMED; custom labels/URLs are not imported |
| `socials` record | array of `{ label, href, icon }` | NORMALIZED; custom HTML icons are not migrated |
| root `valine`, `twikoo`, `waline` | `comments.provider` and `comments.<provider>` | MOVED; selected camelCase aliases accepted |
| root `gitalk` | no runtime destination | Detected for a migration warning, then discarded without reading field values |
| `site.beian`, `police_beian` | `footer.beian` | MOVED |
| `aurora_bot` | `dia` | RENAMED; emits a warning |
| `site_meta.description/keywords/author/favicon` | `site` / `seo` | Supported metadata maps with a warning |
| `site_meta.cdn` | `site_meta.cdn` | `en` / `cn` preserved; CN self-hosts Aurora-managed runtime assets |
| `busuanzi` | none | REMOVED; live analytics is not included |
| `authors`, `copy_protection`, `injects`, `footer_links`, legacy `shiki` tuning | none | NOT SUPPORTED; warns rather than emulating Hexo runtime |

**Gitalk → giscus:** Aurora 3 removes Gitalk from the active provider model. Upstream Gitalk 1.8 needs a browser-visible OAuth client secret; Aurora does not ship one or add a proxy. A stale `comments.provider: gitalk` fails with localized guidance. The Aurora 2 root `gitalk` section triggers only a warning and is discarded without reading or serializing its fields. A separate `src/lib/migration/gitalk.ts` helper calculates historical UID/pathname keys for comparison; it is not imported by runtime comments. See the steps below before changing a site with existing Issues.

## Automatically compatible

The content adapter accepts the legacy forms covered by the RC fixtures:

- scalar or array `tags` and `categories`;
- `author` strings or objects, with the legacy `blog-author` fallback;
- `date`, `updated`, `excerpt`/`abstracts`/`preview`, `keywords`, `feature`, `sticky`, `pinned`, `comment`, and `comments` fields;
- explicit legacy UIDs, or the audited MD5 title hash (`post_uid___<title>` for posts and `page_uid___<title>` for pages);
- `/post/<slug>/` paths, explicit custom permalinks, and verified `.html` compatibility redirects;
- Markdown tables, blockquotes, Aurora containers, images, links, Unicode, and Shiki code metadata used by the fixtures.

The build emits a route manifest with canonical paths, legacy paths, UIDs, comment paths, and provider-specific comment aliases. It also generates static tags, categories, archives, pagination, RSS, sitemap, robots, canonical metadata, OpenGraph, and JSON-LD.

## Manual migration required

1. Copy posts into `src/content/posts/` and pages into `src/content/pages/`. Keep their frontmatter until `pnpm test` and `pnpm build` pass.
2. Review every custom permalink and title-derived UID. A changed title can change the legacy UID even if the visible slug stays the same.
3. Configure `ASTRO_SITE` and `ASTRO_BASE` for the real deployment. `ASTRO_BASE=/` is the root deployment; a subdirectory must include its trailing slash, for example `/blog/theme/`.
4. Copy public assets into `public/` and update references to be base-path aware. Do not hard-code root-relative URLs for a subdirectory deployment.
5. Configure giscus, Waline, or Twikoo (first-class), or Valine (legacy runtime), under `comments` in `_config.yml`, then compare generated identities with the old site. Existing provider records are not verified by repository fixtures.
6. Run the root and nested-base browser checks against a production-like preview before changing DNS or hosting configuration.

## Changed behavior

### Astro replaces the Hexo/Vue runtime

Astro owns content collections, routing, pagination, taxonomy, metadata, and article HTML. The generated page contains the article body without a client request. Vue is limited to search, comments, lightbox, code copy, Dia, theme persistence, and mobile navigation. There is no Vue Router, SPA shell, runtime article JSON fetch, or global Vue mount.

### Markdown scripts are disabled by default

Legacy Markdown that contains a `<script>` element is removed or made inert by the default pipeline. This is an intentional security and compatibility change: a content file cannot silently execute arbitrary browser code during migration. Use a reviewed Astro/Vue integration or an explicit trusted-embed path for content that genuinely needs a script. Do not re-enable arbitrary Markdown scripts globally.

### Search is build-time Pagefind

Pagefind indexes the generated HTML, including the configured language indexes. The old search JSON/API and client-side article store are not generated. Rebuild after changing content so the search index reflects the site.

### URLs and base paths

The canonical URL is composed from `ASTRO_SITE` and `ASTRO_BASE`. The legacy `/api/articles/<slug>.json` endpoint is not emitted. `/post/<slug>/`, custom permalinks, and proven `.html` aliases remain the compatibility surface; route collisions and reserved taxonomy paths fail the build.

## Comments and identity

| Provider | Aurora 3 behavior | Migration action |
| --- | --- | --- |
| giscus | GitHub Discussions; default browser `pathname` mapping | Verify deployed base, locale, and permalink paths; use `specific` or `number` for a deliberate stable match. |
| Valine | Historical pathname without trailing slash | Compare representative old path keys. |
| Twikoo | Historical pathname with trailing slash | Compare old path and service ID. |
| Waline | Historical pathname with trailing slash | Compare old path and server URL. |
| Gitalk | Removed runtime | Use the migration-only historical UID/pathname helper to identify Issues; convert and match Discussions manually. |

### Migrate Gitalk Issues to giscus Discussions

1. Back up and identify old Issues and their historical UID/pathname keys.
2. Enable GitHub Discussions and install the giscus GitHub App on the target public repository.
3. Convert representative Issues to Discussions using GitHub's conversion action.
4. Obtain `repo_id` and `category_id` from [giscus.app](https://giscus.app) and configure giscus in `_config.yml`.
5. Verify Discussion titles against the chosen mapping. `pathname` includes `ASTRO_BASE` and locale routes; custom permalink changes can create duplicate mappings. `specific` with `term: "{legacyUid}"` uses each page’s stable UID if converted titles match. A literal specific term or global `number` sends every page to one Discussion; use that only deliberately. Conversion alone does not establish an automatic match.
6. Check representative old posts, translations, and comment counts against real Discussions before cutover. Keep old Issues until continuity is verified. The repository fixtures cannot prove production record continuity.

Twikoo and Waline expose Recent Comments to the Aurora Sidebar. giscus and Valine do not have a theme Recent Comments integration; the Sidebar shows an empty state. Demo recent comments remain local fixtures.

## Deprecated and removed

- Hexo generators, filters, injectors, and the legacy Vue SPA runtime are not part of Aurora 3.0.
- Legacy `/api/*.json` output is removed unless a future release explicitly adds a separately audited compatibility export.
- Runtime search/article data stores and Vue Router are removed.
- Automatic execution of Markdown scripts is removed.
- Author pages, comment counts, complete legacy fence metadata, and responsive image-source migration remain conditional or incomplete until a real production corpus requires them; do not assume those behaviors from the fixtures.

## Verification checklist

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm build
ASTRO_SITE=https://example.com ASTRO_BASE=/aurora/ pnpm build
ASTRO_SITE=https://example.com ASTRO_BASE=/blog/theme/ pnpm build
PLAYWRIGHT_BASE_PATH= pnpm run test:browser
PLAYWRIGHT_BASE_PATH=/aurora pnpm run test:browser
```

Do not publish until generated URLs/assets, no-JavaScript content, browser console output, search, and the real comment-provider identities have been checked for the target site.
