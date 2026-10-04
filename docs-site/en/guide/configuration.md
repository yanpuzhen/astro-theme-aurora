# Configuration Guide

Edit the repository root `_config.yml` for your blog. Aurora reads it during each development or production build. Start with `site.title`, `site.author`, and the final deployment address; leave `comments.provider: none` until a comment service is ready. Run `pnpm dev` to inspect changes and `pnpm build` before publishing.

## How settings are resolved

The effective priority is **environment overrides → `_config.yml` → Aurora defaults**. Aurora parses YAML, normalizes selected Aurora 2 settings for migration, applies build-time environment overrides, then validates the canonical configuration with Zod and supplies defaults before consuming the normalized result. An environment variable such as `ASTRO_BASE` can therefore make a YAML edit appear ineffective. Remove or update that override and rebuild.

A missing `_config.yml` uses defaults. Malformed YAML, an unknown canonical key, or an invalid value fails the build with a useful field path. Use YAML booleans (`true`/`false`), quote dates, and quote `#` colors. The complete field list, types, defaults, and limits are in [General Configuration](/configs/general); deployment variables are in [Environment Variables](/reference/environment).

## A safe starting file

This complete example enables no external service. Replace the example origin before deployment.

```yaml
site:
  title: My Aurora Blog
  subtitle: Notes and projects
  author: Your Name
  description: A personal blog.
  avatar: ''
  logo: /favicon.svg
  language: en
  started_date: ''
  url: https://example.com
  base: /
site_meta:
  cdn: en # en: current public-CDN clients; cn: self-host Aurora runtime assets
i18n:
  default_locale: en
  locales: [en, zh-CN]
theme:
  feature: true
  dark_mode: true
  profile_shape: diamond
  gradient: { color_1: '#24c6dc', color_2: '#5433ff', color_3: '#ff0099' }
menu: { home: true, tags: true, categories: true, archives: true, about: true, links: false }
socials: []
comments:
  provider: none
dia: { enabled: false, locale: auto, tips: [] }
footer:
  show_version: true
  show_avatar: true
  statistics: { page_views: '', unique_visitors: '' }
  beian: { number: '', link: '', police_number: '', police_link: '' }
links: []
seo: { keywords: [] }
```

Provider-specific comment settings may be omitted while `provider` is `none`; their defaults remain available. Add only the selected provider's section when ready. [Choose a provider](/comments/) and follow its deployment guide before switching it on.

## Asset delivery: EN or CN

Set `site_meta.cdn: en` (the default) to retain Aurora 3.0.0 public-CDN loading for Valine, Twikoo and Waline. Set `site_meta.cdn: cn` to serve their JavaScript, Waline CSS, Valine’s LeanCloud SDK, Twikoo’s optional Prism files, OwO Unicode set, and Cap CAPTCHA assets from your own built site. This is a build-time choice; rebuild and deploy the entire `dist/` directory after changing it. There is no environment override or automatic network fallback. `site.language` and `i18n.default_locale` are independent: `language: zh-CN` with `cdn: en`, and `language: en` with `cdn: cn`, are both valid. Your host may itself use a CDN. In CN, Waline's default emoji set and reactions and Valine's built-in emoji picker are unavailable; see the provider guides. `@waline/emojis@1.1.0` declares `GPL-3.0-or-later`; Aurora does not redistribute that asset set in CN. This engineering choice does not determine license compatibility. Comment backends, giscus.app, avatars and user content remain external services.

## Common recipes

| Goal | Change |
| --- | --- |
| Chinese-first publishing | Write posts with `lang: zh-CN` and link readers to `/cn/`. `site.language: zh-CN` is a fallback setting; English remains the unprefixed default route. See [Internationalization](/guide/internationalization). |
| Avatar and logo | Set `site.avatar` and `site.logo` to files under `public/` using paths such as `/images/avatar.png`, or absolute HTTP(S) URLs. |
| Friend links | Add `links` entries, then set `menu.links: true`. |
| Social links | Add records such as `{ label: GitHub, href: 'https://github.com/example', icon: github }` to `socials`. |
| Running days | Set `site.started_date: '2024-01-01'`; it must be a real date. |
| Filing details | Set `footer.beian.number`/`link` and optionally `police_number`/`police_link`. |
| Dia | Set `dia.enabled: true`; optional `tips` is a list of short messages. |
| Root domain | Set `site.url: https://example.com` and `site.base: /`. |
| GitHub project site | Set `site.url: https://username.github.io` and `site.base: /my-blog/`. |

For platform-specific values, use `ASTRO_SITE` and `ASTRO_BASE` at build time. `site.url` is the origin only, while `site.base` contains the path; see [Domains and Base Paths](/deploy/domains-and-base). Do not put passwords, database URLs, or provider server secrets in this static configuration.
