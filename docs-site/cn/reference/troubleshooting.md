# 故障排查

先在本地运行 `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm build`，再比较生成的 `dist/` 与部署 URL。多数生产问题来自构建配置、base 路径或外部服务不匹配。

| 现象 | 检查与修复 |
| --- | --- |
| YAML 解析错误 | 检查缩进，给 `#` 颜色和日期加引号，删除重复键。错误会报告位置，而不回显可能含密钥的源文本。 |
| 未知/无效配置字段 | 查看构建错误中的字段路径和[完整 schema](/cn/configs/general)。去掉拼写错误和不支持的旧设置；确认环境变量没有覆盖 YAML。 |
| 站点可打开，但 CSS/图片/链接 404 | 对照实际地址检查 `ASTRO_SITE`/`ASTRO_BASE`。Pages 项目站需要 `/仓库名/`；根域名通常使用 `/`。修改后重新构建。 |
| 规范、RSS、Sitemap、robots URL 错误 | `site.url` 只填源站，`site.base` 填路径。部署后检查生成 HTML 和 [Feed](/cn/reference/seo-feeds)。 |
| `pnpm build`/Pagefind 失败 | 使用 Node 22.13+、pnpm 11.19+，根据锁文件安装，查看第一条构建错误；Pagefind 在 Astro 构建后运行。 |
| 文章缺失 | 普通构建会排除 `draft: true`、`hidden: true`、`published: false` 或 `demo: true`。检查 `lang` 及对应语言路由。 |
| 路由冲突 | 两个规范/别名路径重叠或与保留路由冲突。调整 `slug`、`permalink`、旧别名；成功构建后查看 `route-manifest.json`。 |
| 语言切换回首页 | 翻译需要独立文件中相同的 `translationKey` 和正确的 `lang`。未配对内容会使用安全的语言回退。 |
| 评论不显示 | 确认启用了 `comments.provider`、单篇 `comments` 未关闭、公开服务商配置完整，且后端/App 可用；查看浏览器网络错误。 |
| giscus 新建了 Discussion | 检查 `mapping`、域名、base、语言、permalink 和转换后 Discussion 标题。`pathname` 包含部署路径。 |
| Waline/Twikoo 最新评论为空 | 检查服务商、`recent_comments.enabled`、服务端 URL/环境 ID、后端 API 和真实记录。giscus/Valine 不提供 Aurora 最新评论。 |
| 搜索无结果 | 用 `pnpm build` 让 Pagefind 索引 `dist/`；确认当前语言有公开文章，结果路径包含 base。 |

GitHub Pages 请核查 **Settings → Pages** 使用 GitHub Actions 且工作流发布 `dist`；见[部署指南](/cn/deploy/github-pages)。Cloudflare Pages 或 Vercel 请查看托管商构建日志、生产分支、环境变量作用范围与输出目录。部署页面 404 并不能证明评论服务失败；应分别测试各层。

## CDN 模式

若 CN 模式仍出现公共 CDN 请求，先确认重新构建并部署了完整 `dist/`，再用浏览器网络面板区分 Aurora 静态资源与评论后端、头像、用户内容。尤其检查旧页面或缓存是否仍在使用 EN 构建。
