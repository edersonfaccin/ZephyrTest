# ZephyrTest — React Native + Metro + Zephyr Cloud

Technical task POC: a **Module Federation mini app** built with React Native Metro and deployed through **Zephyr Cloud** (default Cloud integration only).

This repository is the **remote (mini app)**. It is consumed at runtime by a **host** application — in this exercise, **GarageFixMobile**, a production React Native app already on the App Store / Play Store, configured with Zephyr Metro + Module Federation.

Docs followed: [Zephyr Metro bundler guide](https://docs.zephyr-cloud.io/bundlers/metro)

---

## Architecture

```
┌─────────────────────────┐         ┌──────────────────────────────────┐
│  Host (GarageFixMobile) │  load   │  Remote (this repo — ZephyrTest) │
│  name: hostApp          │ ──────► │  name: miniApp                   │
│  React Native + Metro   │         │  exposes: ./example              │
│  withZephyr + MF        │         │  deployed to Zephyr Cloud        │
└─────────────────────────┘         └──────────────────────────────────┘
                                              │
                                              ▼
                                   Zephyr environment: staging
                                   Stable URL (mf-manifest.json)
```

- **Mini app (`miniApp`)**: builds a federated remote (`bundle-mf-remote`) and uploads assets to Zephyr.
- **Host (`hostApp`)**: declares the remote in Metro and loads it with `React.lazy(() => import('miniApp/example'))`.
- **Shared deps**: `react` and `react-native` as singletons so host and remote share one runtime.

---

## How Zephyr sits in the React Native / Metro pipeline

Metro remains the bundler. Zephyr does **not** replace Metro; it plugs into the Metro + Module Federation flow:

1. **Build (Metro + `@module-federation/metro`)**  
   Metro produces the host bundle and/or the remote container (`miniApp.bundle`, exposed modules, `mf-manifest.json`).

2. **Zephyr plugin (`zephyr-metro-plugin` / `withZephyr`)**  
   During that bundling step, Zephyr:
   - captures federation metadata and assets
   - uploads them to Zephyr Cloud (default edge deployment)
   - versioning goes to the dashboard (e.g. `0.0.1-main.<user>.N`)

3. **Runtime**  
   The host fetches `mf-manifest.json` from a Zephyr URL (here: the **staging** environment URL), then loads remote JS over the network — without an App Store release for that remote change.

| Layer | Responsibility |
| --- | --- |
| Metro | Bundle JS, resolve modules, HMR in local dev |
| Module Federation | Split host vs remotes, share singletons |
| Zephyr | Host versions, environments/tags, serve remotes from the edge |

In short: **Metro builds → Zephyr publishes & serves → host loads remotes at runtime.**

---

## How I’d use this in a real project (GarageFix)

GarageFix already ships as a native host. A practical layout:

| Piece | Role |
| --- | --- |
| GarageFixMobile (host) | Shell, auth, navigation, store releases |
| Feature remotes (like this mini app) | Screens/modules that can ship OTA via Zephyr |
| Environments | `staging` for QA, `production` locked/promoted deliberately |

**Workflow used in this POC:**

1. Change and bundle the mini app (`yarn bundle:ios` / `yarn bundle:android`).
2. In Zephyr dashboard → environment **`staging`** → point **Value** to the new version → Save.
3. Reload the host app — **no host code change**, no store submission for the remote update.

That matches a real team setup: host rare store releases; product features iterate faster as remotes.

---

## Mini app setup (this repo)

### Dependencies

```bash
yarn add --dev \
  zephyr-metro-plugin \
  @module-federation/metro \
  @module-federation/metro-plugin-rnc-cli \
  @module-federation/runtime
```

### Metro (`metro.config.js`)

- `name: 'miniApp'`
- `exposes: { './example': './src/example.tsx' }`
- Shared `react` / `react-native` (aligned with host: `19.2.3` / `0.84.1`)
- `withZephyr()` + `withModuleFederation(...)`

### Deploy to Zephyr Cloud

```bash
yarn bundle:ios
# and/or
yarn bundle:android
```

Requires login to [Zephyr Cloud](https://app.zephyr-cloud.io/). After a successful bundle, a new version appears in the dashboard.

Optional: target an environment at build time:

```bash
ZE_ENV=staging yarn bundle:ios
```

### Staging environment

- Environment name: **`staging`**
- Stable URL used by the host:  
  `https://staging-zephyrtest-zephyrtest-edersonfaccin-ze.zephyrcloud.app/mf-manifest.json`
- Channel: **Version** (promote manually after each deploy) — can be switched to **Tag** for automatic tracking of `main` builds.

---

## Host side (GarageFixMobile)

Configured separately in the host repo:

- `withZephyr` + `withModuleFederation` in `metro.config.js`
- Remote:

  ```js
  miniApp: 'miniApp@https://staging-zephyrtest-zephyrtest-edersonfaccin-ze.zephyrcloud.app/mf-manifest.json'
  ```

- `package.json`:

  ```json
  "zephyr:dependencies": {
    "miniApp": "zephyr:ZephyrTest.ZephyrTest.edersonfaccin@staging"
  }
  ```

- UI load: `React.lazy(() => import('miniApp/example'))` + `Suspense`

**Note:** Local Metro uses the URL in `remotes`. `zephyr:dependencies` is especially useful when the host itself is also built/deployed with Zephyr. For day-to-day host development against cloud remotes, point `remotes` at the **environment** URL (stable), not a version URL.

---

## Demo update flow

1. Edit `src/example.tsx` in this repo.
2. `yarn bundle:ios` (new version in Zephyr).
3. Dashboard → **Environments** → **staging** → select the new version → Save.
4. Reload GarageFix host → updated remote content.

No App Store / Play Store release required for that remote change.

---

## Screen recording

A short recording of the deployment flow and the host running on a simulator/device will be shared with the submission email.

---

## Feedback on DX and documentation

See [`ZEPHYR_FEEDBACK.txt`](./ZEPHYR_FEEDBACK.txt) (also intended to paste into the submission email).


## About my app GarageFix

# Android
https://play.google.com/store/apps/details?id=com.carangomobile

# IOS
https://apps.apple.com/us/app/my-garage-cars-expenses/id1554131935