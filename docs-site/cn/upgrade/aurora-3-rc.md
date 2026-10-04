# Aurora 3 候选版本

当前 Stable 版本为 Aurora 3.0.1。本页记录此前候选版本的验证范围。当前迁移步骤请参阅[从 Aurora 2.x 迁移](/cn/upgrade/from-aurora-2)。

RC 已验证静态 HTML、route manifest、legacy title-hash identity、显式 permalink、Pagefind、中英文内容、nested base、响应式交互和无 JavaScript 可读性。由于没有生产评论数据库，未验证真实评论 provider 的连续性。

迁移自己的站点前请复核：

- 代表性迁移文章的 URL 与评论连续性；
- README 的描述是否仍与源码一致；
- migration guide 中列出的不支持旧功能；
- GitHub Pages 设置和最终 artifact；
- upstream attribution 与 license 义务；
- `docs/review/` 中的交接记录。
