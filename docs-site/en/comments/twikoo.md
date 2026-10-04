# Twikoo: Deploy the Backend, Then Connect Aurora

Aurora supplies the Twikoo frontend, pinned to **2.0.8**. Twikoo still needs a backend/cloud function and persistent storage. Its [official quick start](https://twikoo.js.org/en/quick-start.html) asks users to deploy both sides and keep their versions compatible. Check the backend version against Aurora's pinned client before upgrading it.

Choose one backend route:

- **Vercel + MongoDB Atlas:** follow Twikoo's [MongoDB Atlas](https://twikoo.js.org/en/mongodb-atlas.html) and [serverless deployment](https://twikoo.js.org/en/backend.html) guides. Create the database/user, deploy the Twikoo Vercel template, set `MONGODB_URI` in the **Twikoo backend** environment, and obtain its HTTPS backend URL. The connection string grants database access and must never enter `_config.yml`, `PUBLIC_*`, browser JavaScript or a committed file.
- **Tencent CloudBase:** follow the same [backend guide](https://twikoo.js.org/en/backend.html) to create a CloudBase environment/function, enable the required access settings, and obtain the environment ID. Add your site to CloudBase web security domains as documented there.

Then configure Aurora for the backend type you chose:

```yaml
comments:
  provider: twikoo
  recent_comments: { enabled: true, count: 5 }
  twikoo:
    env_id: https://comments.example.com # self-hosted/Vercel HTTPS endpoint
    region: ''
    language: auto
```

For CloudBase, replace `env_id` with its environment ID (without `https://`) and set `region` only if needed. Aurora chooses the bundled CloudBase client for a non-HTTP environment ID and the regular client for an HTTP(S) endpoint. Build, comment on a real article, verify moderation and Recent Comments, and test both locale paths. Recent Comments depends on a reachable backend/API. Other Twikoo hosting methods are in the [official backend guide](https://twikoo.js.org/en/backend.html); Aurora does not deploy them for you.

In CN delivery mode, `SHOW_EMOTION=true` uses Aurora's local Unicode OwO set; backend `EMOTION_CDN` URLs do not change that set. Cap CAPTCHA uses pinned same-origin widget, WASM, and fallback assets. The challenge and redeem requests, including server verification, stay active. EN delivery retains Twikoo's upstream resources.
