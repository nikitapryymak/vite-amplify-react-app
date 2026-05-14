# Vite + Amplify Todo App — Design

**Date:** 2026-05-13
**Status:** Approved

## Goal

A super-basic React todo app, built with Vite, hosted on AWS Amplify. The app must support two operational features:

1. **Version check** — when a new version is deployed, running clients see a persistent "new version available — reload" banner.
2. **Maintenance mode** — toggling an environment variable + redeploy causes the app to render a static maintenance page instead of the todo UI.

Storage is in-memory only. No backend, no auth, no persistence across reloads.

## Stack

- Vite + React + TypeScript
- Tailwind CSS for styling (no component library)
- `react-router-dom` for client-side routing across a few pages
- AWS Amplify Hosting (Gen 1) for static hosting + CI/CD off the main branch

## Architecture

### `status.json`

A single JSON file at the deployed site root drives both features:

```json
{ "version": "0.1.0", "maintenance": false }
```

- Generated at build time by `scripts/generate-status.mjs` (runs as `postbuild`).
- Written directly into `dist/` after Vite finishes its build.
- Served by Amplify Hosting with `Cache-Control: no-cache, no-store, must-revalidate` via `customHttp.yml` so clients always see the latest values.

### Build-time generation

`scripts/generate-status.mjs`:

- `version`: read from the `version` field in `package.json` (single source of truth).
- `maintenance`: `process.env.VITE_MAINTENANCE_MODE === 'true'`.
- Writes `dist/status.json`.

The same `version` (from `package.json`) is exposed to the bundle via Vite `define` as `__APP_VERSION__`, so the running app can compare its bundled version against the freshly-fetched one.

To trigger an update prompt for running clients, bump the `version` in `package.json` and redeploy.

### Runtime polling

`src/hooks/useStatus.ts`:

- On mount and every 30 seconds: `fetch('/status.json', { cache: 'no-store' })`.
- Exposes `{ maintenance: boolean, isOutdated: boolean }`.
- `isOutdated` is true when the fetched `version !== __APP_VERSION__`.
- Network failures are silent — keeps last known good values.

`src/App.tsx`:

- If `maintenance === true` → render `<MaintenancePage />` and nothing else (preempts the router for all paths).
- Otherwise → render the router (`<BrowserRouter>` with `<NavBar />` + `<Routes>`) and `<UpdateBanner />` (banner mounts only when `isOutdated`).

## Routing

Uses `react-router-dom`. Routes:

| Path | Component | Purpose |
|---|---|---|
| `/` | `TodoPage` | The todo app (home) |
| `/about` | `AboutPage` | Dummy "about" content |
| `/contact` | `ContactPage` | Dummy "contact" content |
| `*` | `NotFoundPage` | Simple 404 fallback |

A top `<NavBar />` with simple text links sits above the routed content. Active link gets a subtle underline/weight change.

Dummy pages (`AboutPage`, `ContactPage`) contain a heading and one or two sentences of filler — no real content needed.

**SPA fallback:** Amplify Hosting needs a rewrite rule so deep links like `/about` reload correctly. Added to `customHttp.yml`'s sibling redirect config (configured in the Amplify console or via a `_redirects` / `redirects` entry — see Config section).

### Toggling maintenance mode

1. Amplify Console → App settings → Environment variables.
2. Set `VITE_MAINTENANCE_MODE=true`.
3. Trigger "Redeploy this version" on the main branch.
4. Build runs, new `status.json` is published, running clients flip to maintenance UI within ~30s.
5. To exit maintenance: set `VITE_MAINTENANCE_MODE=false` (or remove it), redeploy.

Trade-off: each toggle is a ~1–3 minute redeploy. Accepted to keep the design simple.

## Components

### `NavBar.tsx`

Top navigation bar shown on all non-maintenance routes. Uses `NavLink` from `react-router-dom` so the current route gets active styling. Three links: Todos (`/`), About (`/about`), Contact (`/contact`).

### Pages

- `TodoPage.tsx` — wrapper that renders `<TodoApp />` (kept thin so the routing layer maps cleanly to pages).
- `AboutPage.tsx` — heading + one short paragraph of placeholder text.
- `ContactPage.tsx` — heading + one short paragraph of placeholder text.
- `NotFoundPage.tsx` — "Page not found" + a link back to `/`.

### `TodoApp.tsx`

In-memory todo list using `useState<Todo[]>`:

- Add: text input + Enter submits, trimmed-empty values rejected.
- Toggle complete: checkbox per row.
- Delete: × button visible on row hover.
- Footer: "N items left" count.
- Empty state: friendly message when list is empty.

Todo shape: `{ id: string, text: string, done: boolean }`. IDs via `crypto.randomUUID()`.

### `MaintenancePage.tsx`

Full-screen centered layout. Single message ("We'll be right back") and a small icon. No interactivity.

### `UpdateBanner.tsx`

Fixed bottom-right toast. Slides in on mount. Persistent — no dismiss button. Contains a "Reload" button that calls `window.location.reload()`.

## Visual design

- Light theme only.
- Inter or system sans-serif.
- Centered card, max-width ~480px, neutral background (slate-50/100).
- Subtle borders, soft shadows, rounded corners (Tailwind `rounded-xl`, `shadow-sm`).
- Modest spacing — feels uncluttered.

## File layout

```
.
├── amplify.yml
├── customHttp.yml
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
├── scripts/
│   └── generate-status.mjs
├── public/
│   └── (Vite-scaffolded static assets — favicon, etc.)
├── dist/
│   └── (build output; status.json written here by postbuild)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css           # Tailwind directives
│   ├── components/
│   │   ├── TodoApp.tsx
│   │   ├── MaintenancePage.tsx
│   │   ├── UpdateBanner.tsx
│   │   └── NavBar.tsx
│   ├── pages/
│   │   ├── TodoPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/
│   │   └── useStatus.ts
│   ├── lib/
│   │   └── version.ts      # exports __APP_VERSION__
│   └── types.ts            # Todo type
└── docs/superpowers/specs/2026-05-13-vite-amplify-todo-design.md
```

## Config files

### `amplify.yml`

Build spec for Amplify Hosting:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install --no-audit --no-fund
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

`npm install` (not `npm ci`) is used because `npm ci` is strict about lock-file/platform matches: lock files generated on macOS arm64 don't include the Linux-only optional native deps that Amplify's build environment expects, causing `EUSAGE` failures. `npm install` resolves the platform differences leniently.

### `customHttp.yml`

```yaml
customHeaders:
  - pattern: '/status.json'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache, no-store, must-revalidate'
```

### Amplify rewrite rule (SPA fallback)

Configured in the Amplify Console → Rewrites and redirects:

| Source | Target | Type |
|---|---|---|
| `</^[^.]+$\|\\.(?!(json\|js\|css\|svg\|png\|jpg\|jpeg\|gif\|webp\|ico\|woff\|woff2\|map)$)([^.]+$)/>` | `/index.html` | 200 (Rewrite) |

This is Amplify's standard SPA rewrite — it sends any path that isn't a static asset to `index.html` so `react-router-dom` can handle the route.

### `vite.config.ts`

- React plugin
- `define`: injects `__APP_VERSION__` by reading the `version` field from `package.json`

## Local development

- `npm run dev` — standard Vite dev server. `__APP_VERSION__` reflects the current `package.json` version, but `dist/status.json` isn't generated (the dev server has nothing at `/status.json`), so `useStatus` 404s silently and the app runs normally.
- `npm run build && npm run preview` — full production preview; `status.json` is generated into `dist/` by the `postbuild` step and served by the preview server.
- To test maintenance mode locally: `VITE_MAINTENANCE_MODE=true npm run build && npm run preview`.
- To test version-check locally: build once, run preview, then manually edit `dist/status.json` to change the version and watch the banner appear.

## Deployment

1. `git init` the project, push to a new GitHub repo.
2. In Amplify Console: "Host web app" → connect the GitHub repo → main branch → defaults are fine (Amplify auto-detects `amplify.yml`).
3. First build runs, app is live at the Amplify-provided URL.
4. Subsequent pushes to main auto-deploy.

## Out of scope

- Persistence (localStorage, backend, sync)
- Authentication / multi-user
- Dark mode
- Update banner dismissal UI
- Multiple environments (staging/prod)
- Tests (none for this project — it's a learning/exploration build)

## Design decisions (resolved)

- **Storage:** In-memory only. Reload wipes todos.
- **Maintenance toggle:** Env var + redeploy (Option C). Simplest possible, accepts slow toggle.
- **Update banner:** Persistent, not dismissable.
- **Poll interval:** 30 seconds.
- **Dark mode:** Skipped.
- **Local maintenance testing:** Build + preview with env var set.
- **Router:** `react-router-dom` with three real pages (Todos, About, Contact) + a 404. Dummy content on About/Contact.
- **Version source:** `version` field in `package.json`. Bump it to trigger an update prompt for running clients on next deploy.
- **`status.json` location:** Written as `postbuild` directly into `dist/status.json` — kept out of `public/` since it's a build artifact, not a source asset.
- **Build install command:** `npm install --no-audit --no-fund` in `amplify.yml` (not `npm ci`) — works around npm's cross-platform lock-file strictness on macOS-generated lock files.
