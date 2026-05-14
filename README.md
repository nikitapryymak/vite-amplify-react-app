# Vite + Amplify Todo

A super-basic React todo app on Vite, deployed to AWS Amplify Hosting. Demonstrates two operational features:

- **Version check** — running clients are notified when a new deploy goes out.
- **Maintenance mode** — toggle via an Amplify env var to serve a static maintenance page.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

## Production preview

```bash
npm run build
npm run preview
```

## Toggling maintenance mode locally

```bash
VITE_MAINTENANCE_MODE=true npm run build && npm run preview
```

## Deployment (AWS Amplify Hosting)

1. Push this repo to GitHub.
2. In the AWS Amplify Console, choose **Host web app** → connect to the GitHub repo and pick the `main` branch. Amplify auto-detects `amplify.yml`.
3. After the first build, set up the SPA rewrite so deep links (e.g., `/about`) work on refresh:
   - App settings → **Rewrites and redirects** → Add a rule:
     - Source: `</^[^.]+$|\.(?!(json|js|css|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|map)$)([^.]+$)/>`
     - Target: `/index.html`
     - Type: `200 (Rewrite)`

## Toggling maintenance mode in production

1. AWS Amplify Console → App settings → **Environment variables**.
2. Set `VITE_MAINTENANCE_MODE=true`.
3. Go to the `main` branch → **Redeploy this version**.
4. Wait for the build to finish. Running clients pick up the change within ~30s of the next `status.json` poll.
5. To exit maintenance: set `VITE_MAINTENANCE_MODE=false` (or remove it) and redeploy.

## How the version check works

- The `version` field in `package.json` is the source of truth.
- `scripts/generate-status.mjs` runs as `postbuild` and writes that version into `dist/status.json`.
- The same version is injected into the JS bundle via Vite's `define` as `__APP_VERSION__`.
- The app polls `/status.json` every 30 seconds. If the fetched version differs from the bundle version, a persistent "new version available — reload" banner appears.
- `customHttp.yml` sets `Cache-Control: no-cache` on `/status.json` so clients always see the latest deploy.

To trigger an update prompt for running clients, bump `version` in `package.json` and redeploy.
