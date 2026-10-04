# 从 Aurora 2.x 迁移

Aurora 3 是静态 Astro 实现，不是对 Hexo runtime 的原地升级。请保留旧站点和 provider 记录，直到新 canonical URL 与评论 identity 完成比对。

## 迁移配置

将实际使用的配置概念复制到仓库根目录 `_config.yml`；日常设置不再编辑 `src/lib/config.ts`。优先级是**环境变量覆盖 > `_config.yml` > Aurora 默认值**。`ASTRO_SITE` 和 `ASTRO_BASE` 可用于部署覆盖。缺少 YAML 时使用默认值；非法规范配置会让构建失败。

| Aurora 2 概念 | Aurora 3 目标 | 兼容状态 |
| --- | --- | --- |
| `site.title/author/description/avatar/language` | `site.*` | 概念相同，字段规范化。 |
| `site.started_date` | `site.started_date` | 相同；也接受 `startedDate` 别名。 |
| `site.url/root` | `site.url` + `site.base` | 拆分 origin 与部署路径。 |
| `menu` 标题/URL 对象 | 布尔型 `menu` 开关 | 仅内置路由；不迁移自定义标题/目标。 |
| `socials` 对象 | `{ label, href, icon }` 列表 | 可映射的链接保留；不迁移自定义 HTML 图标。 |
| 根级 provider 区块 | `comments.provider` + `comments.<provider>` | 规范化选定的 camelCase 别名。 |
| `aurora_bot` | `dia` | 重命名并警告。 |
| `site.beian` / `police_beian` | `footer.beian` | 移动并警告。 |
| `site_meta.description/keywords/author/favicon` | `site` / `seo` | 受支持的元数据映射并警告。 |
| `site_meta.cdn` | `site_meta.cdn` | 保留 `en` / `cn`；CN 改为本站托管 Aurora 管理的静态运行时资源。 |
| `busuanzi` | 无 | 不包含统计后端。 |
| `authors`、`copy_protection`、`injects`、`footer_links`、旧 Shiki 设置 | 无 | 不支持；会通过警告说明。 |

示例：

```yaml
site:
  title: 我的博客
  author: 你的名字
  url: https://example.com
  base: /
comments:
  provider: waline
  waline:
    server_url: https://comments.example.com
```

### 从 Gitalk 迁移到 giscus

Aurora 3 已移除 Gitalk 运行时。上游 Gitalk 需要浏览器端 OAuth client secret；Aurora 不暴露密钥，也不提供代理。旧的 `comments.provider: gitalk` 会报明确的迁移错误。Aurora 2 根级 `gitalk` 配置只触发提示，随后整体丢弃；字段值不会被读取或序列化。仅迁移工具 `legacyGitalkIdentity()` 可计算旧 UID/pathname 供人工核对，它不是 provider。

1. 备份并辨认旧 Gitalk Issues 与对应页面身份。
2. 在目标公开仓库启用 GitHub Discussions 并安装 giscus App。
3. 用 GitHub 的转换操作将代表性 Issues 转为 Discussions；仅转换本身不能保证页面匹配。
4. 在 [giscus.app](https://giscus.app) 获取 `repo_id`、`category_id`，按[集成配置](/cn/configs/integrations)设置 `comments.provider: giscus`。
5. 核对已转换 Discussion 的标题与 mapping。`pathname` 包含部署 base 和语言路径；更改 `ASTRO_BASE` 或 permalink 会改变 key。只有已转换 Discussion 标题匹配时，才用 `specific` 与 `term: "{legacyUid}"` 取得逐页稳定 UID。字面量 `specific` term 或全局 `number` 会让所有页面共用一个 Discussion，务必谨慎。
6. 切换前在真实 Discussions 核对多篇旧文章和译文。完成验证前保留原 Issues；Aurora 不会自动把 Gitalk UID/pathname 转成 giscus Discussion。

## 内容与验证

1. 将文章复制到 `src/content/posts/`，页面复制到 `src/content/pages/`；检查通过前先保留旧 frontmatter。
2. 标题派生 UID 必须保留精确标题输入；空白或 Unicode 规范化改变都可能改变 ID。
3. 检查 custom permalink、`.html` alias 和 base-aware 资源路径。
4. 在 YAML 中配置 `site.url`/`site.base`，或用部署环境变量覆盖。
5. 切换流量前比较真实 provider ID/记录；测试 fixture 无法证明生产连续性。
6. 运行 `pnpm check`、`pnpm build`，并按需要执行迁移专用浏览器检查。按[部署指南](/cn/deploy/)发布普通 `dist/` 产物；用户博客不需要仓库维护者的 Docs/Demo Pages 脚本。

Astro 负责静态路由、内容、SEO、feeds 和 HTML。Vue Router、SPA 文章状态、runtime `/api/*.json`、统计后端、不安全的 Gitalk 静态 secret 流程及自动执行 Markdown script 均不属于 Aurora 3。

## CDN 配置迁移

Aurora 2 的 `site_meta.cdn: en` 或 `cn` 在 Aurora 3 中仍为同名配置。`cn` 现在表示将 Aurora 管理的静态运行时依赖随站点托管；旧版 `site_meta.description` 等受支持元数据仍迁移到 `site` / `seo`。未知字段和非法 CDN 值会导致构建失败。
