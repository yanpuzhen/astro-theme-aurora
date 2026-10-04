# Valine（旧版运行时）

Valine 为现有 Aurora 站点保留；新部署请先比较目前的一等[评论选项](/cn/comments/)。Valine 使用 LeanCloud 作为外部数据服务。按[官方 Valine 快速上手](https://valine.js.org/en/quickstart.html)创建 LeanCloud 应用，获取**客户端 App ID 和 App Key**，并按所用 LeanCloud 区域和应用要求配置域名白名单/安全设置。客户端标识是公开值；LeanCloud **Master Key**、账户密码和管理凭据不是。

```yaml
comments:
  provider: valine
  valine:
    app_id: YOUR_PUBLIC_APP_ID
    app_key: YOUR_PUBLIC_APP_KEY
    avatar: mp
    placeholder: Leave your thoughts behind~
    visitor: false
    avatar_force: false
    language: auto
    meta: [nick, mail]
    required_fields: [nick]
```

用应用的公开值替换占位符。Aurora 加载固定的 Valine 1.5.3 客户端。构建后从最终域名测试评论；请求失败时核查实际 LeanCloud 记录和安全域名设置。Aurora 不提供 Valine 最新评论，Valine-Admin 不是 Aurora 的必需组件。迁移前保留旧数据并比较页面路径。

CN 分发模式会移除 Valine 内置表情选择器，因为其默认新浪图片不能作为本站资源分发。纯文本评论仍可使用。EN 与 CN 遵循相同的 Valine LeanCloud 端点及客户端凭据初始化规则。`pubstatic.b0.upaiyun.com` 的可选 IP 查询是评论元数据服务请求，不是静态客户端资源。
