# Waline: Deploy the Server, Then Connect Aurora

Waline is a first-class Aurora client integration, but Aurora does **not** host its server or database. Follow Waline's current [Get Started](https://waline.js.org/en/guide/get-started/) guide: deploy the Waline server (its maintained example uses Vercel), provision a supported database (the current Vercel walkthrough uses Neon PostgreSQL), run Waline's documented schema initialization, and redeploy the server after binding storage. Waline also documents [other databases](https://waline.js.org/en/guide/database.html). Open the server URL to confirm it responds. An optional custom domain can be configured on the Waline server host.

Register the first administrator at the server's `/ui/register` promptly; Waline states the first registrant becomes administrator. Keep database, email and admin secrets in the **Waline server environment**. The Aurora site receives only the public server URL and client options:

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

`server_url` must be an absolute HTTP(S) URL. `login` accepts `enable`, `disable`, or `force`; `comment_sorting` accepts `latest`, `oldest`, or `hottest`. Other defaults and limits are in [General Configuration](/configs/general). Rebuild Aurora, then post and moderate a test comment on a real article. Aurora can fetch provider-backed Recent Comments for Waline when enabled, but this depends on the server being reachable and its API responding. Check the sidebar, path identity and both locales; keep old records before changing paths or servers.

With `site_meta.cdn: cn`, Aurora disables Waline's built-in emoji set and reaction images because those defaults request public static assets. If you set `reaction: true`, the build prints a warning and normalizes it to `false`. The EN mode keeps Waline's upstream behavior. The default `@waline/emojis@1.1.0` package declares `GPL-3.0-or-later`; Aurora does not redistribute it in CN.
