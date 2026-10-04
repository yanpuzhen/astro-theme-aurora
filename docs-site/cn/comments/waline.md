# Waline：先部署服务端，再连接 Aurora

Waline 是 Aurora 的一等客户端集成，但 Aurora **不**托管它的服务端或数据库。按 Waline 当前[入门指南](https://waline.js.org/en/guide/get-started/)部署 Waline 服务端（其维护的示例使用 Vercel）、准备支持的数据库（当前 Vercel 流程使用 Neon PostgreSQL）、按 Waline 文档初始化表结构，并在绑定存储后重新部署服务端。Waline 也记录了[其他数据库](https://waline.js.org/en/guide/database.html)。打开服务端 URL 确认响应；可按需为服务端配置自定义域名。

尽快在服务端 `/ui/register` 注册首位管理员；Waline 说明首位注册者会成为管理员。数据库、邮件与管理密钥只放在 **Waline 服务端环境**。Aurora 站点只接收公开服务端 URL 和客户端选项：

```yaml
comments:
  provider: waline
  recent_comments: { enabled: true, count: 5 }
  waline:
    server_url: https://comments.example.com
    language: auto
    reaction: false
    login: disable
    meta: [nick, mail]
    required_meta: [nick]
    comment_sorting: latest
    word_limit: 0
    page_size: 10
```

`server_url` 必须是绝对 HTTP(S) URL。`login` 可选 `enable`、`disable`、`force`；`comment_sorting` 可选 `latest`、`oldest`、`hottest`。其他默认值和限制见[基础配置](/cn/configs/general)。重新构建 Aurora，在真实文章发表评论并测试管理。启用时 Aurora 可从 Waline 获取最新评论，但取决于服务端可达和 API 正常。检查侧栏、路径身份和两种语言；改变路径或服务端前保留旧记录。

使用 `site_meta.cdn: cn` 时，Aurora 禁用 Waline 内置表情包和反应图片，因为默认资源来自公共静态 CDN。若设置 `reaction: true`，构建会给出警告并将其规范化为 `false`。EN 模式保持 Waline 上游行为。默认 `@waline/emojis@1.1.0` 包声明 `GPL-3.0-or-later`；Aurora 不在 CN 模式分发它。
