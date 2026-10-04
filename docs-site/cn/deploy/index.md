# 部署概览

Aurora 是**静态 Astro 站点**。执行 `pnpm install --frozen-lockfile` 后，`pnpm build` 检查并构建 HTML，再用 Pagefind 建立索引。上传 `dist/`；普通站点部署不需要 SSR adapter。仓库的 `pnpm pages:build` 用于维护者合并 Docs 和 Demo 产物，不是个人博客的构建命令。

| 平台 | 构建 | 输出 | 典型 `ASTRO_SITE` | 典型 `ASTRO_BASE` | Git 部署 / 自定义域名 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| [Vercel](/cn/deploy/vercel) | `pnpm build` | `dist` | `https://blog.example.com` | `/` | 是 / 是 | 生产分支和预览。 |
| [Cloudflare Pages](/cn/deploy/cloudflare-pages) | `pnpm build` | `dist` | `https://blog.example.com` | `/` | 是 / 是 | 选择 Pages Git 集成。 |
| [GitHub Pages](/cn/deploy/github-pages) | `pnpm build` | `dist` | `https://username.github.io` | `/my-blog/` | Actions / 是 | 项目站需要仓库 base。 |

在 `_config.yml` 设置 `site.url`/`site.base`，或在生产构建时通过 `ASTRO_SITE`/`ASTRO_BASE` 覆盖。不要把预览 URL 设为生产规范 URL。对于 `https://example.com/blog/`，源站为 `https://example.com`，base 为 `/blog/`。先阅读[域名与 Base 路径](/cn/deploy/domains-and-base)，再选择平台指南。部署后在实际 base 下检查文章、`/rss.xml`、`/cn/rss.xml`、`/sitemap.xml`、`/robots.txt`、搜索、图片和两种语言。

## CDN 模式

在国内网络部署时，可在 `_config.yml` 设置 `site_meta.cdn: cn` 并完整发布构建后的 `dist/`；这只保证 Aurora 管理的静态运行时资源由本站提供，不保证评论后端、giscus 或用户图片可达。
