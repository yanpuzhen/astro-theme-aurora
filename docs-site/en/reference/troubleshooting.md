# Troubleshooting

Start with `pnpm install --frozen-lockfile`, `pnpm check`, and `pnpm build` locally. Compare the generated `dist/` output with the deployed URL. Most production issues are build configuration, base-path, or external-service mismatches.

| Symptom | Check and fix |
| --- | --- |
| YAML parse error | Check indentation, quote `#` colors and date strings, remove duplicate keys. The error reports the location without echoing secret-like source text. |
| Unknown/invalid configuration field | Read the field path in the build error and [complete schema](/configs/general). Remove typos and unsupported legacy settings; confirm an environment variable is not overriding YAML. |
| Site loads but CSS/images or links 404 | Compare actual address with `ASTRO_SITE`/`ASTRO_BASE`. Project Pages sites need `/repository/`; root domains usually need `/`. Rebuild after changing values. |
| Wrong canonical, RSS, Sitemap, robots URLs | `site.url` is origin only; `site.base` holds the path. Inspect generated HTML and [feeds](/reference/seo-feeds) after deployment. |
| `pnpm build`/Pagefind fails | Use Node 22.13+ and pnpm 11.19+, install from the lockfile, inspect the first build error; Pagefind runs after Astro build. |
| Post absent | It may have `draft: true`, `hidden: true`, `published: false`, or `demo: true` in an ordinary build. Check `lang` and the right locale route. |
| Route collision | Two canonical/alias paths or a reserved route overlap. Adjust `slug`, `permalink`, or legacy aliases; inspect `route-manifest.json` from a successful build. |
| Language switch goes home | A translation needs a matching `translationKey` and correct `lang` in a separate file. Unpaired content uses a safe locale fallback. |
| Comments absent | Confirm `comments.provider` is active, per-post `comments` is enabled, public provider settings are filled, and the backend/App is available. Look at browser network errors. |
| giscus creates a new Discussion | Check `mapping`, domain, base, locale, permalink, and the converted Discussion title. `pathname` includes the deployed path. |
| Waline/Twikoo Recent Comments empty | Confirm provider, `recent_comments.enabled`, server URL/environment ID, backend API and actual records. giscus/Valine do not supply Aurora Recent Comments. |
| Search has no results | Build with `pnpm build` so Pagefind indexes `dist/`; check that public posts exist in the current locale and that result paths include the base. |

For GitHub Pages, verify **Settings → Pages** uses GitHub Actions and the workflow publishes `dist`; see [its guide](/deploy/github-pages). For Cloudflare Pages or Vercel, inspect the host's build log, selected production branch, environment scope and output directory. A 404 from a deployed page is not evidence that the comment provider failed; test each layer separately.

## CDN delivery mode

If CN mode still requests a public CDN, rebuild and deploy the complete `dist/`, then classify the browser request: Aurora static asset versus comment backend, avatar or user content. Check whether an old EN build or cache is still being served.
