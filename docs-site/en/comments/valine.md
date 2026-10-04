# Valine (Legacy Runtime)

Valine remains available for existing Aurora sites; for new deployments, first compare the actively supported [comment options](/comments/). Valine uses LeanCloud as its external data service. Follow the [official Valine quick start](https://valine.js.org/en/quickstart.html): create a LeanCloud application, obtain its **client App ID and App Key**, and configure any domain allowlist/security settings required by your LeanCloud region and application. The client identifiers are public; the LeanCloud **Master Key**, account password and admin credentials are not.

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

Replace placeholders with your application's public values. Aurora loads its pinned Valine 1.5.3 client. Build and test a comment from the final domain; check the actual LeanCloud record and security-domain settings if requests fail. Aurora does not provide Valine Recent Comments, and Valine-Admin is not a required Aurora component. Preserve old data and compare page paths before migration.

In CN delivery mode, Valine's built-in emoji picker is removed because its default Sina images are not locally distributable. Plain-text comments remain available. The LeanCloud endpoint and client credentials follow the same Valine initialization rules in EN and CN. Valine's optional IP lookup at `pubstatic.b0.upaiyun.com` is a service request for comment metadata, not a static client asset.
