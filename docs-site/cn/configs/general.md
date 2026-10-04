# 基础配置

仓库根目录的 `_config.yml` 是日常 Aurora 设置的唯一用户入口。构建时会解析 YAML、规范化明确支持的 Aurora 2 别名、用 Zod 校验规范配置、补默认值，最后应用环境变量覆盖。优先级为**环境变量覆盖 > `_config.yml` > Aurora 默认值**。缺少文件时使用默认值；YAML 错误、未知规范字段或非法值会显示字段路径并停止构建。组件只读取规范化后的配置，不会在浏览器解析 YAML。

```yaml
site:
  title: 我的 Aurora 博客
  subtitle: 个人博客
  author: 你的名字
  description: 静态优先的多语言博客。
  avatar: /images/avatar.png
  logo: /favicon.svg
  language: zh-CN # en | zh-CN；路由仍固定为英文和简体中文
  started_date: '' # 可选 YYYY-MM-DD
  url: https://example.com # 仅 origin，不含路径、查询或片段
  base: / # 也可为 /aurora/、/blog/theme/ 等
site_meta:
  cdn: en # en | cn；静态资源交付，与语言独立
theme:
  feature: true
  dark_mode: true
  profile_shape: diamond # circle | diamond | rounded
  gradient: { color_1: '#24c6dc', color_2: '#5433ff', color_3: '#ff0099' }
menu: { home: true, tags: true, categories: true, archives: true, about: true, links: false }
socials:
  - { label: GitHub, href: https://github.com/you, icon: github }
```

## 配置范围

| 区块 | 用途与校验 |
| --- | --- |
| `site` | 标题、副标题、作者、描述、头像/Logo、显示语言、真实 `YYYY-MM-DD`、仅 origin 的 HTTP(S) URL、安全 base 路径。 |
| `site_meta` | `cdn: en`（默认）或 `cn`；构建期静态资源交付模式，不提供环境变量覆盖。 |
| `i18n` | 固定英文默认语言和 `[en, zh-CN]`；不是任意语言插件接口。 |
| `theme` | 精选逻辑、初始明暗主题、头像形状、三个十六进制渐变色。 |
| `menu` | 六个内置路由的布尔开关；菜单标签和路由结构固定并本地化。 |
| `socials` | 最多 32 个安全 HTTP(S)、`mailto:` 或 `tel:` 链接；图标为 `github` 或 `link`。 |
| `comments` | `provider` 和已测试的 provider 字段；见[集成](/cn/configs/integrations)。不接受客户端 secret 字段。 |
| `dia` | 启用开关、`auto`/英文/中文 locale、最多 20 条短提示。 |
| `footer` | 版本/头像显示、仅用于展示的手动统计字符串、可选备案链接；不代表存在统计后端。 |
| `links` | 最多 200 条校验过的友链：名称、URL、头像、描述、分类和颜色。 |
| `seo` | 最多 40 个站点关键词；文章 frontmatter 关键词优先。 |

规范配置区块为严格模式，未知字段会报错，避免拼写错误被忽略。YAML 布尔值请写 `true`/`false`，日期写带引号的 ISO 字符串，颜色使用十六进制。除社交链接允许 `mailto:`/`tel:` 外，URL 必须为绝对 HTTP(S)。静态配置不得保存秘密：传给浏览器的任何值都是公开的。

### 环境变量覆盖

`ASTRO_SITE` 和 `ASTRO_BASE` 分别覆盖 `site.url`、`site.base`。为部署/CI 兼容保留的可选 `PUBLIC_AURORA_*`、`PUBLIC_COMMENT_PROVIDER` 和 provider `PUBLIC_*` 也是构建期公开覆盖；留空即可使用 YAML。`PUBLIC_AURORA_DIA` 必须是明确布尔字符串。`ASTRO_DEMO_BUILD`、`ASTRO_CONFIG_FILE` 和 `ASTRO_PREFLIGHT_TESTS` 是构建/测试控制，不是日常主题设置。完整列表见 `.env.example`。

GFM、KaTeX 数学公式和 Shiki 是始终启用的构建能力，不提供无效开关。Demo 身份与内容由独立 Demo 构建选择，不会继承生产用户配置。

## `_config.yml` 完整字段参考

以下所有区块和字段均可省略，省略时使用默认值。当前配置对象采用严格校验：未知字段会导致构建失败。表格列出 YAML 键、类型及默认值。HTTP(S) URL 不能包含用户名或密码；`site.url` 不能带路径、查询参数或片段。空服务商标识只是占位值，并不能完成部署。

### 站点、语言、主题和菜单

| 键 | 类型；默认值 | 用途与限制 |
| --- | --- | --- |
| `site.title` | 非空字符串；`My Aurora Blog` | 站点名，最多 120 字符。 |
| `site.subtitle` | 字符串；`''` | 副标题，最多 240 字符。 |
| `site.author` | 非空字符串；`Author` | 作者，最多 120 字符。 |
| `site.description` | 字符串；`''` | 站点描述，最多 500 字符。 |
| `site.avatar` | 资源路径/URL 或 `''`；`''` | 头像；使用 `/` 开头路径或绝对 HTTP(S) URL。 |
| `site.logo` | 资源路径/URL 或 `''`；`/favicon.svg` | Logo/图标。 |
| `site.language` | `en` 或 `zh-CN`；`en` | 组件回退语言；不会改变固定的英文根路由。 |
| `site.started_date` | 真实 `YYYY-MM-DD` 或 `''`；`''` | 页脚运行天数起点；YAML 中加引号。 |
| `site.url` | 仅源站 HTTP(S) URL；`https://example.com` | 生产站规范源站，不能有路径。 |
| `site.base` | 路径；`/` | 根路径或 `/blog/` 等首尾有斜杠的安全路径；不允许查询、片段、空格、重复斜杠和点路径段。 |
| `i18n.default_locale` | `en`；`en` | 固定默认路由语言。 |
| `i18n.locales` | `[en, zh-CN]`；相同 | 固定语言组合及顺序。 |
| `theme.feature` | 布尔；`true` | 首页文章选择模式。 |
| `theme.dark_mode` | 布尔；`true` | 初始外观；访客选择可覆盖。 |
| `theme.profile_shape` | `circle`、`diamond`、`rounded`；`diamond` | 头像形状。 |
| `theme.gradient.color_1`、`color_2`、`color_3` | 十六进制颜色；`#24c6dc`、`#5433ff`、`#ff0099` | 渐变色；`#` 颜色需要加引号。 |
| `menu.home`、`tags`、`categories`、`archives`、`about` | 布尔；均为 `true` | 内置菜单项开关。 |
| `menu.links` | 布尔；`false` | 友链菜单开关；先填写 `links`。 |

### 社交链接、友链、Dia、页脚与 SEO

| 键 | 类型；默认值 | 用途与限制 |
| --- | --- | --- |
| `socials` | 列表；`[]` | 最多 32 项。 |
| `socials[].label` | 必填非空字符串 | 显示名，最多 40 字符。 |
| `socials[].href` | 必填 URL | 仅 HTTP(S)、`mailto:` 或 `tel:`。 |
| `socials[].icon` | `github` 或 `link`；`link` | 内置图标。 |
| `links` | 列表；`[]` | 最多 200 张友链卡片。 |
| `links[].name` | 必填非空字符串 | 最多 100 字符。 |
| `links[].url` | 必填 HTTP(S) URL | 跳转目标。 |
| `links[].avatar` | 资源路径/URL 或 `''`；`''` | 卡片图片。 |
| `links[].description` | 字符串；`''` | 最多 500 字符。 |
| `links[].category` | 非空字符串；`Friends` | 最多 80 字符。 |
| `links[].color` | 十六进制颜色；`#5433ff` | 卡片强调色。 |
| `dia.enabled` | 布尔；`false` | 启用 Dia。 |
| `dia.locale` | `auto`、`en`、`zh-CN`；`auto` | Dia 语言。 |
| `dia.tips` | 字符串列表；`[]` | 最多 20 条非空提示，每条最多 240 字符。 |
| `footer.show_version`、`show_avatar` | 布尔；均为 `true` | 页脚可见性。 |
| `footer.statistics.page_views`、`unique_visitors` | 字符串；`''` | 手工显示值，最多 40 字符；没有统计后端。 |
| `footer.beian.number`、`link` | 字符串；`''` | 备案号（100 字符）及可选 HTTP(S) 链接。 |
| `footer.beian.police_number`、`police_link` | 字符串；`''` | 公安备案号（120 字符）及可选 HTTP(S) 链接。 |
| `seo.keywords` | 字符串列表；`[]` | 最多 40 个关键词，每个 1–80 字符。 |

### 评论

`comments.provider` 只选一个：`none`（默认）、`giscus`、`waline`、`twikoo`、`valine`。所选服务必须另行部署；操作见[评论系统](/cn/comments/)。

| 键 | 类型；默认值 | 用途与限制 |
| --- | --- | --- |
| `comments.recent_comments.enabled` | 布尔；`true` | 仅 Waline/Twikoo 的侧栏最新评论开关。 |
| `comments.recent_comments.count` | 整数 1–20；`5` | 显示数量上限。 |
| `comments.giscus.repo`、`repo_id`、`category`、`category_id` | 字符串；`''` | 公开 GitHub 标识。选用 giscus 时 repo 和 repo ID 必填；除 `number` 映射外，category ID 必填。 |
| `comments.giscus.mapping` | `pathname`、`url`、`title`、`og:title`、`specific`、`number`；`pathname` | Discussion 映射方式。 |
| `comments.giscus.term` | 最多 500 字符；`''` | `specific` 时必填；`number` 时为正整数 Discussion 编号。`{legacyUid}` 仅在 `specific` 下按页面展开。 |
| `comments.giscus.strict`、`reactions_enabled`、`emit_metadata` | 布尔；`false`、`true`、`false` | 匹配、表情反应、元数据。 |
| `comments.giscus.input_position` | `top` 或 `bottom`；`bottom` | 输入框位置。 |
| `comments.giscus.theme` | `auto`、`light`、`dark`、`dark_dimmed`；`auto` | iframe 主题。 |
| `comments.giscus.lang` | `auto`、`en`、`zh-CN`；`auto` | iframe 语言。 |
| `comments.giscus.loading` | `eager` 或 `lazy`；`eager` | Aurora 评论区域进入视口后的 iframe 加载方式。 |
| `comments.waline.server_url` | HTTP(S) URL 或 `''`；`''` | 公开 Waline 服务端地址。 |
| `comments.waline.language` | `auto`、`en`、`zh-CN`；`auto` | 客户端语言。 |
| `comments.waline.reaction` | 布尔；`false` | EN 模式的反应按钮；CN 模式设置为 `true` 时给出警告并禁用，因为默认图片来自外部。 |
| `comments.waline.login` | `enable`、`disable`、`force`；`disable` | 登录策略。 |
| `comments.waline.meta`、`required_meta` | `nick`、`mail`、`link` 列表；`[nick, mail]`、`[nick]` | 表单字段，各最多 3 项。 |
| `comments.waline.comment_sorting` | `latest`、`oldest`、`hottest`；`latest` | 排序。 |
| `comments.waline.word_limit` | 整数 0–10000；`0` | 评论字数设置。 |
| `comments.waline.page_size` | 整数 1–100；`10` | 每页评论数。 |
| `comments.twikoo.env_id` | 最多 500 字符；`''` | CloudBase 环境 ID 或自托管 HTTP(S) 端点。 |
| `comments.twikoo.region` | 最多 80 字符；`''` | 可选 CloudBase 区域。 |
| `comments.twikoo.language` | `auto`、`en`、`zh-CN`；`auto` | 客户端语言。 |
| `comments.valine.app_id`、`app_key` | 最多 256 字符；`''` | 公开 LeanCloud 客户端标识；不要使用 Master Key。 |
| `comments.valine.avatar` | `mp`、`identicon`、`monsterid`、`wavatar`、`retro`、`robohash`、`blank`、`mm`；`mp` | 头像样式。 |
| `comments.valine.placeholder` | 最多 500 字符；`Leave your thoughts behind~` | 输入提示。 |
| `comments.valine.visitor`、`avatar_force` | 布尔；均为 `false` | 访客计数及头像行为。 |
| `comments.valine.language` | `auto`、`en`、`zh-CN`；`auto` | 客户端语言。 |
| `comments.valine.meta`、`required_fields` | `nick`、`mail`、`link` 列表；`[nick, mail]`、`[nick]` | 表单字段，各最多 3 项。 |

`PUBLIC_*` 覆盖值和 `_config.yml` 都是公开的构建输入。数据库 URL、密码、PAT、OAuth 密钥和服务商管理凭据必须放在相应服务端，不能放进此文件。
