# Deployment Overview

Aurora is a **static Astro site**. After `pnpm install --frozen-lockfile`, `pnpm build` checks and builds HTML, then indexes it with Pagefind. Upload `dist/`. Ordinary site deployments need no SSR adapter. The repository's `pnpm pages:build` combines maintainer Docs and Demo output; it is not the command for a personal blog.

| Platform | Build | Output | Typical `ASTRO_SITE` | Typical `ASTRO_BASE` | Git deploy / custom domain | Note |
| --- | --- | --- | --- | --- | --- | --- |
| [Vercel](/deploy/vercel) | `pnpm build` | `dist` | `https://blog.example.com` | `/` | Yes / yes | Production branch and previews. |
| [Cloudflare Pages](/deploy/cloudflare-pages) | `pnpm build` | `dist` | `https://blog.example.com` | `/` | Yes / yes | Select Pages Git integration. |
| [GitHub Pages](/deploy/github-pages) | `pnpm build` | `dist` | `https://username.github.io` | `/my-blog/` | Actions / yes | Project sites need the repository base. |

Set `site.url`/`site.base` in `_config.yml` or override them with `ASTRO_SITE`/`ASTRO_BASE` during the production build. A preview URL should not become the production canonical URL. For `https://example.com/blog/`, use origin `https://example.com` and base `/blog/`. See [Domains and Base Paths](/deploy/domains-and-base), then choose a platform guide. After deployment, verify a post, `/rss.xml`, `/cn/rss.xml`, `/sitemap.xml`, `/robots.txt`, search, images and both locales under the actual base.

## CDN delivery mode

For China-oriented delivery, set `site_meta.cdn: cn` in `_config.yml` and publish the complete built `dist/`. This self-hosts Aurora-managed static runtime assets; reachability of comment backends, giscus and user media still depends on their services.
