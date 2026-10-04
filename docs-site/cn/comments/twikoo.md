# Twikoo：先部署后端，再连接 Aurora

Aurora 提供 Twikoo 前端，固定为 **2.0.8**。Twikoo 仍需要后端/云函数和持久存储。[官方快速上手](https://twikoo.js.org/en/quick-start.html)要求部署前后端并保持版本兼容。升级后端前先对照 Aurora 固定的客户端版本核查。

选择一种后端方式：

- **Vercel + MongoDB Atlas：**按 Twikoo 的 [MongoDB Atlas](https://twikoo.js.org/en/mongodb-atlas.html)与[云函数部署](https://twikoo.js.org/en/backend.html)指南创建数据库/用户、部署 Twikoo Vercel 模板，在 **Twikoo 后端**环境配置 `MONGODB_URI`，取得 HTTPS 后端 URL。连接串可访问数据库，绝不能写进 `_config.yml`、`PUBLIC_*`、浏览器 JavaScript 或提交的文件。
- **腾讯 CloudBase：**按同一[后端指南](https://twikoo.js.org/en/backend.html)创建 CloudBase 环境/函数、启用所需访问设置并取得环境 ID。按官方说明把站点加入 CloudBase Web 安全域名。

再按后端类型配置 Aurora：

```yaml
comments:
  provider: twikoo
  recent_comments: { enabled: true, count: 5 }
  twikoo:
    env_id: https://comments.example.com # 自托管/Vercel HTTPS 端点
    region: ''
    language: auto
```

CloudBase 则把 `env_id` 改成不带 `https://` 的环境 ID，并仅在需要时设置 `region`。Aurora 对非 HTTP 环境 ID 选用包含 CloudBase SDK 的客户端，对 HTTP(S) 端点选用常规客户端。构建后在真实文章发表评论，验证管理与最新评论，并测试两种语言路径。最新评论依赖后端/API 可达。其他托管方式见[官方后端指南](https://twikoo.js.org/en/backend.html)；Aurora 不负责部署它们。

CN 分发模式下，`SHOW_EMOTION=true` 使用 Aurora 的本地 Unicode OwO 表情集；后端 `EMOTION_CDN` URL 不改变该表情集。Cap 验证码使用固定版本的本站组件、WASM 和备用资源；挑战、兑换与服务端验证流程仍启用。EN 分发保留 Twikoo 上游资源。
