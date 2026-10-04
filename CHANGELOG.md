# Changelog

## Unreleased

- Restored `site_meta.cdn: en | cn`: EN keeps 3.0.0 provider delivery; CN self-hosts Aurora-managed comment clients, Waline CSS, Valine LeanCloud SDK, Twikoo Prism/OwO assets, and Cap CAPTCHA dependencies. CN disables Valine's built-in emoji picker and Waline's default emoji and reaction assets. `@waline/emojis@1.1.0` declares `GPL-3.0-or-later`; Aurora does not redistribute that asset set in CN. Static builds include third-party notices and license texts.

- Completed bilingual end-user guides for configuration, content, deployment, comments, SEO/feeds, environment variables and troubleshooting; expanded navigation and schema reference.

## [3.0.0] - 2026-09-24

Aurora 3.0 is the Stable Astro release of Aurora. It preserves the auroral visual system while rendering content, routes, search indexes, and metadata at build time. Focused Vue islands provide interaction without making article content depend on JavaScript.

### Experience and publishing

- Restored responsive Aurora layouts across Home, articles, Links, About, taxonomy, archives, pagination, light/dark themes, Dia, and Footer. The Footer can display the package version, manual statistics, and running days.
- Added static English (`en`, unprefixed) and Simplified Chinese (`zh-CN`, `/cn/`) routes, translated UI and content, locale switching, and locale-aware search and metadata.
- Added Pagefind search and one Markdown pipeline with GFM, build-time KaTeX, and Shiki. The bilingual Demo Showcase includes isolated `demo: true` content and fixtures; ordinary builds exclude them.
- Generated English/Chinese RSS, sitemap, robots, canonical and alternate-language metadata with explicit site origin and base-path handling. Root and nested-base deployments, including the combined GitHub Pages Docs/Demo artifact, are supported.

### Configuration and comments

- Added a validated root `_config.yml` with Zod schema errors and selected Aurora 2 aliases. Effective priority is environment overrides > `_config.yml` > defaults.
- Made giscus, Waline, and Twikoo first-class comment integrations. Valine remains a legacy runtime. Waline and Twikoo can populate Recent Comments when their services are configured.
- Removed the Gitalk runtime and its browser secret flow. Bilingual Gitalk-to-giscus guidance covers Discussion mapping and verification; comment records do not migrate automatically.
- Hardened provider configuration, comment identity, giscus term handling, feed output, and generated static assets through release checks.

### Migrating from Aurora 2

- Aurora 2's Hexo/Vue runtime is replaced by Astro's static architecture. The root `_config.yml` remains familiar in concept but uses a different validated schema; review unsupported legacy fields before moving settings.
- Preserve and compare old URLs, permalinks, title-hash identities, and comment records before cutover. Gitalk Issue-to-Discussion conversion requires mapping verification; historical comment continuity is not guaranteed automatically.
- Set the site origin and deployment base explicitly, especially for GitHub Pages or nested paths. Use internal locale identifiers `en` and `zh-CN` when migrating translated content.
- Follow the bilingual [migration guide](docs-site/en/upgrade/from-aurora-2.md) and [configuration reference](docs-site/en/configs/general.md) for deployment details.

## 3.0.0-rc.2

Aurora 3.0 RC2 is a release candidate for migration testing and bilingual site validation. It is not a stable release.

### Internationalization

- Added static English and Simplified Chinese route families while retaining unprefixed English URLs.
- Added localized Aurora UI, accessible desktop/mobile language switching, and translated content pairs through optional `lang` and `translationKey` frontmatter.
- Added locale-aware listings, taxonomy counts, RSS, sitemap, canonical/hreflang metadata, HTML language, OpenGraph locale, and Pagefind indexes.
- Added a bilingual Demo and a bilingual VitePress documentation site with an internationalization guide.

### Compatibility

- Preserved legacy slugs, permalinks, title-hash UID inputs, `.html` aliases, route manifests, and default-locale comment identity behavior.
- Kept Astro responsible for static routing, content, HTML, SEO, taxonomy, and Markdown rendering; Vue remains limited to focused islands.

### Infrastructure and validation

- Updated current repository metadata and Pages links to `yanpuzhen/astro-theme-aurora` and its canonical GitHub Pages site.
- Added static i18n, Docs, Demo, Pages artifact, and README verification gates.
- Verified root and nested-base builds, bilingual browser switching/search, no-JavaScript readability, and the combined GitHub Pages artifact.

### Known limitations

- Production comment-provider records and continuity were not available for direct verification.
- Pixel-level parity against the old runtime remains source-based because the old runtime and production corpus were unavailable.
- Optional author routes, comment counts/recent-comment data, math, complete fence metadata, and responsive image-source coverage remain conditional on a real migration corpus.

## 3.0.0-rc.1 - Release Candidate

Aurora 3.0 is the Astro-based evolution of Aurora. This release candidate is intended for migration testing and feedback; it is not a stable release.

### Highlights

- Static Astro rendering with Content Collections and a single Remark/Rehype/Shiki Markdown pipeline.
- Focused Vue islands for search, comments, lightbox, code copy, Dia, theme persistence, and mobile navigation.
- Pagefind search with Chinese, English, and mixed-language fixture coverage.
- Responsive Aurora styling, dark/light theme support, no-JavaScript-readable pages, and base-path deployment.

### Added

- Legacy frontmatter normalization, MD5 title-hash UIDs, explicit permalinks, `.html` compatibility redirects, and route collision checks.
- Static posts, pages, pagination, tags, categories, archives, RSS, sitemap, robots, canonical metadata, OpenGraph, and JSON-LD.
- Provider adapters and identity aliases for Gitalk, Valine, Twikoo, and Waline.
- Release documentation, environment placeholders, repository metadata, and GitHub Actions validation.

### Changed

- Astro owns routing and HTML generation; the former Hexo/Vue SPA, Vue Router, runtime article API, and `/api/*.json` generation are not included.
- Pagefind replaces the runtime search store.
- Markdown scripts are removed or inert by default. Trusted embeds require an explicit reviewed integration.

### Legacy compatibility

Legacy compatibility is validated with legacy-shaped fixtures and route manifests. Existing production comment threads, changed slugs, and a complete real article corpus still require site-specific verification.

### Validation

The RC validation suite covers clean static output, route and identity regressions, Pagefind, root and nested base paths, browser interaction, and no-JavaScript content. The final release checklist records the exact command results for this publication.

### Known limitations

- Production comment-provider records and continuity were not available for direct verification.
- Pixel-level parity against the old runtime was source-based because the old runtime and production corpus were unavailable.
- Optional author routes, comment counts/recent-comment data, complete fence metadata, and responsive image-source coverage remain conditional on a real migration corpus.
