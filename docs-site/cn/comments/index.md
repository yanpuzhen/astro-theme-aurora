# 评论系统

Aurora 博客是静态站点；评论依赖独立服务。在后端或仓库准备好之前，保持 `comments.provider: none`。一次只运行一个服务商，单篇文章可用 frontmatter `comments: false` 关闭评论。服务商记录是外部数据：改变路径或服务商不会自动迁移旧评论。

| 服务商 | 定位与存储 | 访客登录 | 独立服务 | Aurora 最新评论 | 迁移提示 |
| --- | --- | --- | --- | --- | --- |
| [giscus](/cn/comments/giscus) | 一等集成；GitHub Discussions | 评论需 GitHub 账号 | 不需自托管服务；需公开仓库与 App | 不支持 | 映射须匹配 Discussions。 |
| [Waline](/cn/comments/waline) | 一等集成；自有 Waline 服务端/数据库 | 可配置 | 需要 | 支持 | 保留服务端数据和路径。 |
| [Twikoo](/cn/comments/twikoo) | 一等集成；云函数/服务端与存储 | 服务商流程 | 需要 | 支持 | 保留后端和路径。 |
| [Valine](/cn/comments/valine) | 旧版运行时；LeanCloud | 服务商流程 | LeanCloud 服务 | 不支持 | 为已有站点保留。 |
| [Gitalk](/cn/comments/gitalk-migration) | 已移除；GitHub Issues | GitHub OAuth | Aurora 3 不可用 | 不支持 | 转为 Discussions 后核对。 |

在 `_config.yml` 设置服务商及其**公开**客户端配置，构建后在真实文章测试。`comments.recent_comments.enabled` 默认 `true`，`count` 默认 `5`，但 Aurora 只有 Waline 和 Twikoo 最新评论适配器。giscus 和 Valine 的侧栏为空/不可用属于预期。密码、数据库 URL、PAT、OAuth 密钥和管理凭据必须留在服务商基础设施。字段默认值见[配置指南](/cn/guide/configuration)。

## CDN 模式

EN 保持既有公共 CDN 客户端加载；CN 将 Valine、Twikoo（含 CloudBase）、Waline 及其所需静态资源随站点托管。giscus 客户端已由 Vite 打包，giscus.app 服务仍在站外。最新评论使用与正文相同的模式。
