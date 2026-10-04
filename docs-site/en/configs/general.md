# General Configuration

The root `_config.yml` is the user-facing source for routine Aurora settings. The build parses YAML, normalizes selected documented Aurora 2 aliases, validates the canonical object with Zod, fills defaults, and applies environment overrides. Precedence is **environment overrides > `_config.yml` > Aurora defaults**. A missing file uses defaults; malformed YAML and invalid/unknown canonical values fail the build with a field path. Components consume the normalized config; they do not parse YAML.

```yaml
site:
  title: My Aurora Blog
  subtitle: A personal blog
  author: Your Name
  description: A static-first multilingual blog.
  avatar: /images/avatar.png
  logo: /favicon.svg
  language: en # en | zh-CN; route families remain English + zh-CN
  started_date: '' # optional YYYY-MM-DD
  url: https://example.com # origin only; no path/query/fragment
  base: / # /, /aurora/, /blog/theme/, etc.
site_meta:
  cdn: en # en | cn; asset delivery, independent of language
theme:
  feature: true
  dark_mode: true
  profile_shape: diamond # circle | diamond | rounded
  gradient: { color_1: '#24c6dc', color_2: '#5433ff', color_3: '#ff0099' }
menu: { home: true, tags: true, categories: true, archives: true, about: true, links: false }
socials:
  - { label: GitHub, href: https://github.com/you, icon: github }
```

## Configuration surface

| Section | Supported purpose / validation |
| --- | --- |
| `site` | Title, subtitle, author, description, avatar/logo, display language, real `YYYY-MM-DD`, origin-only HTTP(S) URL, safe base path. |
| `site_meta` | `cdn: en` (default) or `cn`; strict build-time asset delivery mode. No environment override. |
| `i18n` | Fixed English default and `[en, zh-CN]`; this is not a language-plugin interface. |
| `theme` | Feature selection, initial light/dark appearance, profile shape, three hex gradient colors. |
| `menu` | Boolean switches for the six built-in routes; labels and route structure are localized/fixed. |
| `socials` | Up to 32 safe HTTP(S), `mailto:`, or `tel:` links; icon is `github` or `link`. |
| `comments` | `provider` plus tested provider fields; see [Integrations](/configs/integrations). No client secret fields are accepted. |
| `dia` | Enable flag, `auto`/English/Chinese locale, up to 20 short text tips. |
| `footer` | Version/avatar visibility, manual display-only statistics, and optional filing links. No analytics backend is implied. |
| `links` | Up to 200 validated friend-link records with name, URL, avatar, description, category, and color. |
| `seo` | Up to 40 site keywords; page frontmatter keywords take precedence. |

Strict canonical sections reject unknown keys so typos do not disappear. YAML booleans should be written as `true`/`false`, dates as quoted ISO strings, and colors as `#RRGGBB`-style hex values. URLs must be absolute HTTP(S), except social `mailto:`/`tel:` links. Do not put secrets in this static configuration: anything passed to a browser is public.

### Environment overrides

`ASTRO_SITE` and `ASTRO_BASE` override `site.url` and `site.base`. Optional existing `PUBLIC_AURORA_*`, `PUBLIC_COMMENT_PROVIDER`, and provider `PUBLIC_*` values are build-time public overrides for deployment/CI compatibility; leave them blank to use YAML. `PUBLIC_AURORA_DIA` must be an explicit boolean string. `ASTRO_DEMO_BUILD`, `ASTRO_CONFIG_FILE`, and `ASTRO_PREFLIGHT_TESTS` are build/test controls, not routine theme settings. See `.env.example` for the complete current list.

GFM, math/KaTeX, and Shiki are always-on build capabilities, not fake user toggles. Demo identity and content are selected by the dedicated Demo build, not inherited from production user settings.

## Complete `_config.yml` field reference

All sections and fields below are optional; defaults apply when omitted. Canonical object sections are strict: an unknown key fails validation. The tables show YAML keys, accepted types and defaults. `HTTP(S)` URLs must have no embedded username or password; `site.url` must have no path, query or fragment. Empty provider credentials are placeholders, not a working deployment.

### Site, locale, theme and menu

| Key | Type; default | Purpose and limits |
| --- | --- | --- |
| `site.title` | nonempty string; `My Aurora Blog` | Site name, at most 120 characters. |
| `site.subtitle` | string; `''` | Subtitle, at most 240 characters. |
| `site.author` | nonempty string; `Author` | Site author, at most 120 characters. |
| `site.description` | string; `''` | Site description, at most 500 characters. |
| `site.avatar` | asset path/URL or `''`; `''` | Profile image. Use a `/`-rooted path or absolute HTTP(S) URL. |
| `site.logo` | asset path/URL or `''`; `/favicon.svg` | Logo/favicon reference. |
| `site.language` | `en` or `zh-CN`; `en` | Fallback locale for components; does not change the fixed English root route. |
| `site.started_date` | real `YYYY-MM-DD` or `''`; `''` | Footer running-day start. Quote the date in YAML. |
| `site.url` | origin-only HTTP(S) URL; `https://example.com` | Production canonical origin, without a path. |
| `site.base` | path; `/` | Root or safe slash-bounded path such as `/blog/`; no query, fragment, spaces, duplicate slashes or dot segments. |
| `i18n.default_locale` | `en`; `en` | Fixed default route locale. |
| `i18n.locales` | `[en, zh-CN]`; same | Fixed supported locale pair in this order. |
| `theme.feature` | boolean; `true` | Home post-selection mode. |
| `theme.dark_mode` | boolean; `true` | Initial appearance; visitor choice can override it. |
| `theme.profile_shape` | `circle`, `diamond`, `rounded`; `diamond` | Profile avatar shape. |
| `theme.gradient.color_1`, `color_2`, `color_3` | hex colors; `#24c6dc`, `#5433ff`, `#ff0099` | Gradient stops; quote `#` colors. |
| `menu.home`, `tags`, `categories`, `archives`, `about` | booleans; all `true` | Show built-in menu items. |
| `menu.links` | boolean; `false` | Show Links menu; populate `links` first. |

### Socials, links, Dia, footer and SEO

| Key | Type; default | Purpose and limits |
| --- | --- | --- |
| `socials` | list; `[]` | Up to 32 records. |
| `socials[].label` | required nonempty string | Display label, at most 40 characters. |
| `socials[].href` | required URL | HTTP(S), `mailto:` or `tel:` only. |
| `socials[].icon` | `github` or `link`; `link` | Built-in icon. |
| `links` | list; `[]` | Up to 200 friend-link cards. |
| `links[].name` | required nonempty string | At most 100 characters. |
| `links[].url` | required HTTP(S) URL | Destination. |
| `links[].avatar` | asset path/URL or `''`; `''` | Card image. |
| `links[].description` | string; `''` | At most 500 characters. |
| `links[].category` | nonempty string; `Friends` | At most 80 characters. |
| `links[].color` | hex color; `#5433ff` | Card accent. |
| `dia.enabled` | boolean; `false` | Enable Dia. |
| `dia.locale` | `auto`, `en`, `zh-CN`; `auto` | Dia language. |
| `dia.tips` | string list; `[]` | Up to 20 nonempty tips, each at most 240 characters. |
| `footer.show_version`, `show_avatar` | booleans; both `true` | Footer visibility. |
| `footer.statistics.page_views`, `unique_visitors` | strings; `''` | Manual display values, at most 40 characters; no analytics backend. |
| `footer.beian.number`, `link` | strings; `''` | Filing number (100 chars) and optional HTTP(S) link. |
| `footer.beian.police_number`, `police_link` | strings; `''` | Police filing number (120 chars) and optional HTTP(S) link. |
| `seo.keywords` | string list; `[]` | Up to 40 keywords, each 1–80 characters. |

### Comments

Select one `comments.provider`: `none` (default), `giscus`, `waline`, `twikoo`, or `valine`. The selected service must be deployed separately. The full procedures are in [Comments](/comments/).

| Key | Type; default | Purpose and limits |
| --- | --- | --- |
| `comments.recent_comments.enabled` | boolean; `true` | Allow sidebar recent comments for Waline/Twikoo only. |
| `comments.recent_comments.count` | integer 1–20; `5` | Maximum displayed entries. |
| `comments.giscus.repo`, `repo_id`, `category`, `category_id` | strings; `''` | Public GitHub identifiers. With giscus selected, repo and repo ID are required; category ID is required except for `number` mapping. |
| `comments.giscus.mapping` | `pathname`, `url`, `title`, `og:title`, `specific`, `number`; `pathname` | Discussion mapping strategy. |
| `comments.giscus.term` | string ≤500; `''` | Required for `specific`; positive discussion number for `number`. `{legacyUid}` is expanded per page only for `specific`. |
| `comments.giscus.strict`, `reactions_enabled`, `emit_metadata` | booleans; `false`, `true`, `false` | giscus matching, reactions and metadata. |
| `comments.giscus.input_position` | `top` or `bottom`; `bottom` | Composer position. |
| `comments.giscus.theme` | `auto`, `light`, `dark`, `dark_dimmed`; `auto` | Iframe theme. |
| `comments.giscus.lang` | `auto`, `en`, `zh-CN`; `auto` | Iframe language. |
| `comments.giscus.loading` | `eager` or `lazy`; `eager` | Iframe loading after the Aurora island becomes visible. |
| `comments.waline.server_url` | HTTP(S) URL or `''`; `''` | Public Waline server endpoint. |
| `comments.waline.language` | `auto`, `en`, `zh-CN`; `auto` | Client language. |
| `comments.waline.reaction` | boolean; `false` | Reaction UI in EN; CN warns and disables `true` because the default images are remote. |
| `comments.waline.login` | `enable`, `disable`, `force`; `disable` | Login policy. |
| `comments.waline.meta`, `required_meta` | lists of `nick`, `mail`, `link`; `[nick, mail]`, `[nick]` | Form fields, at most three entries each. |
| `comments.waline.comment_sorting` | `latest`, `oldest`, `hottest`; `latest` | Sort order. |
| `comments.waline.word_limit` | integer 0–10000; `0` | Comment length control. |
| `comments.waline.page_size` | integer 1–100; `10` | Comments per page. |
| `comments.twikoo.env_id` | string ≤500; `''` | CloudBase environment ID or self-hosted HTTP(S) endpoint. |
| `comments.twikoo.region` | string ≤80; `''` | Optional CloudBase region. |
| `comments.twikoo.language` | `auto`, `en`, `zh-CN`; `auto` | Client language. |
| `comments.valine.app_id`, `app_key` | strings ≤256; `''` | Public LeanCloud client identifiers. Never use the Master Key. |
| `comments.valine.avatar` | `mp`, `identicon`, `monsterid`, `wavatar`, `retro`, `robohash`, `blank`, `mm`; `mp` | Avatar style. |
| `comments.valine.placeholder` | string ≤500; `Leave your thoughts behind~` | Input hint. |
| `comments.valine.visitor`, `avatar_force` | booleans; both `false` | Visitor count and avatar behavior. |
| `comments.valine.language` | `auto`, `en`, `zh-CN`; `auto` | Client language. |
| `comments.valine.meta`, `required_fields` | lists of `nick`, `mail`, `link`; `[nick, mail]`, `[nick]` | Form fields, at most three entries each. |

`PUBLIC_*` overrides and `_config.yml` are public build inputs. Keep database URLs, passwords, PATs, OAuth secrets and provider admin credentials on the provider's server, never in this file.
