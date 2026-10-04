# Comment Systems

Aurora's blog is static; comments use a separate service. Leave `comments.provider: none` until its backend or repository is ready. Only one provider runs at a time, and a post can disable its own comments with `comments: false` frontmatter. Provider records are external data: changing paths or providers does not migrate old comments.

| Provider | Role and storage | Visitor login | Separate server | Aurora Recent Comments | Migration note |
| --- | --- | --- | --- | --- | --- |
| [giscus](/comments/giscus) | First-class; GitHub Discussions | GitHub account to comment | No self-hosted server; public repo + App | No | Mapping must match Discussions. |
| [Waline](/comments/waline) | First-class; your Waline server/database | Configurable | Yes | Yes | Preserve server data and paths. |
| [Twikoo](/comments/twikoo) | First-class; cloud function/server + storage | Provider flow | Yes | Yes | Preserve backend and paths. |
| [Valine](/comments/valine) | Legacy runtime; LeanCloud | Provider flow | LeanCloud service | No | Retained for existing sites. |
| [Gitalk](/comments/gitalk-migration) | Removed; GitHub Issues | GitHub OAuth | Not available in Aurora 3 | No | Convert Issues to Discussions and verify. |

Set the provider and its **public** client settings in `_config.yml`; build and test on a real post. `comments.recent_comments.enabled` defaults to `true` and `count` to `5`, but only Waline and Twikoo have Aurora Recent Comments adapters. For giscus and Valine, an empty/unavailable sidebar state is expected. Keep passwords, database URLs, PATs, OAuth secrets and admin credentials on the provider infrastructure. See [Configuration](/guide/configuration) for field defaults.

## CDN delivery mode

EN retains existing public-CDN clients. CN self-hosts Valine, Twikoo (including CloudBase), Waline and their static dependencies. The giscus client is already bundled; giscus.app remains external. Recent Comments uses the same delivery mode as article comments.
