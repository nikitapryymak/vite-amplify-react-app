# Vite + Amplify Todo App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a super-basic React todo app on Vite, deployed to AWS Amplify Hosting, with a version-check banner and an env-var-toggled maintenance mode.

**Architecture:** Single-page React app with `react-router-dom` for a few dummy pages. A build-generated `public/status.json` carries the current commit SHA and a maintenance flag (set from `VITE_MAINTENANCE_MODE`). The app polls `status.json` every 30s; mismatched version → reload banner, `maintenance: true` → maintenance screen preempts the router. In-memory state only; no backend.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, react-router-dom v6, AWS Amplify Hosting (Gen 1).

**Note on tests:** The spec explicitly defers tests for this learning project. Each task ends with a manual verification step (build / dev server / browser check) instead of TDD.

---

## File Structure

Files created across the plan:

```
.
├── .gitignore
├── amplify.yml
├── customHttp.yml
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
├── scripts/
│   └── generate-status.mjs
├── public/
│   └── (status.json — generated at build)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── types.ts
    ├── lib/
    │   └── version.ts
    ├── hooks/
    │   └── useStatus.ts
    ├── components/
    │   ├── TodoApp.tsx
    │   ├── MaintenancePage.tsx
    │   ├── UpdateBanner.tsx
    │   └── NavBar.tsx
    └── pages/
        ├── TodoPage.tsx
        ├── AboutPage.tsx
        ├── ContactPage.tsx
        └── NotFoundPage.tsx
```

---

## Task 1: Initialize Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `.gitignore`

- [ ] **Step 1: Scaffold via Vite**

From the project root (`/Users/nikitapryymak/Desktop/vite-amplify-react-app`), which is currently empty:

```bash
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty… Ignore files and continue?" choose yes (the only thing here is the `docs/` folder we want to keep).

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

- [ ] **Step 3: Verify the scaffold runs**

```bash
npm run dev
```

Open the printed URL (usually http://localhost:5173). You should see the default Vite + React starter page. Stop the dev server (Ctrl-C).

- [ ] **Step 4: Initialize git and make the first commit**

```bash
git init
git add .
git commit -m "scaffold vite+react+ts"
```

---

## Task 2: Install and configure Tailwind CSS

**Files:**
- Create: `tailwind.config.js`, `postcss.config.js`
- Modify: `src/index.css`, `src/App.tsx`

- [ ] **Step 1: Install Tailwind + PostCSS + Autoprefixer**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

This creates `tailwind.config.js` and `postcss.config.js`.

- [ ] **Step 2: Configure Tailwind content paths**

Replace `tailwind.config.js` with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 3: Replace `src/index.css` with Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  height: 100%;
}

body {
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Inter, sans-serif;
  background-color: #f8fafc; /* slate-50 */
  color: #0f172a; /* slate-900 */
}
```

- [ ] **Step 4: Replace `src/App.tsx` with a Tailwind smoke test**

```tsx
function App() {
  return (
    <div className="min-h-full flex items-center justify-center">
      <h1 className="text-3xl font-semibold text-slate-800">Tailwind is working</h1>
    </div>
  );
}

export default App;
```

Also delete `src/App.css` (Vite scaffold leaves it behind, we won't use it):

```bash
rm src/App.css
```

And remove the `import './App.css'` line from `src/App.tsx` if Vite left it (the replacement above already excludes it).

- [ ] **Step 5: Verify Tailwind renders**

```bash
npm run dev
```

Open the URL. You should see a centered, large semibold "Tailwind is working" heading on a light slate background. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "configure tailwind"
```

---

## Task 3: Build-time version constant via Vite `define`

**Files:**
- Modify: `vite.config.ts`
- Create: `src/lib/version.ts`
- Modify: `src/vite-env.d.ts`

- [ ] **Step 1: Replace `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';

function resolveVersion(): string {
  if (process.env.AWS_COMMIT_ID) return process.env.AWS_COMMIT_ID.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(resolveVersion()),
  },
});
```

- [ ] **Step 2: Add the type declaration**

Replace `src/vite-env.d.ts` with:

```ts
/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
```

- [ ] **Step 3: Create `src/lib/version.ts`**

```ts
export const APP_VERSION: string = __APP_VERSION__;
```

- [ ] **Step 4: Smoke test the version constant**

Temporarily edit `src/App.tsx` to display it:

```tsx
import { APP_VERSION } from './lib/version';

function App() {
  return (
    <div className="min-h-full flex items-center justify-center">
      <h1 className="text-3xl font-semibold text-slate-800">Version: {APP_VERSION}</h1>
    </div>
  );
}

export default App;
```

Run `npm run dev` and confirm the page shows the current short git SHA (or `dev` if no commits exist yet — there's one commit from Task 1 so it should be a SHA).

Stop the server. Revert `src/App.tsx` back to the Tailwind smoke test from Task 2 (we'll wire the version up properly in Task 8).

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "inject build-time version constant"
```

---

## Task 4: Build script that generates `public/status.json`

**Files:**
- Create: `scripts/generate-status.mjs`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create the generator**

`scripts/generate-status.mjs`:

```js
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

function resolveVersion() {
  if (process.env.AWS_COMMIT_ID) return process.env.AWS_COMMIT_ID.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
}

const status = {
  version: resolveVersion(),
  maintenance: process.env.VITE_MAINTENANCE_MODE === 'true',
};

const outPath = 'public/status.json';
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(status, null, 2) + '\n');
console.log(`Wrote ${outPath}:`, status);
```

- [ ] **Step 2: Wire it into `package.json` as `prebuild`**

Open `package.json` and add a `prebuild` script. Final `scripts` block should look like:

```json
"scripts": {
  "dev": "vite",
  "prebuild": "node scripts/generate-status.mjs",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

(Adjust to keep whatever Vite scaffolded for `lint`/`build` — the key additions are `prebuild` and that `build` stays as scaffolded.)

- [ ] **Step 3: Ignore the generated file from git**

The generator writes `public/status.json` on every build. Add to `.gitignore`:

```
public/status.json
```

- [ ] **Step 4: Verify the generator works**

```bash
npm run build
```

Then:

```bash
cat public/status.json
```

You should see something like:

```json
{
  "version": "<short-sha>",
  "maintenance": false
}
```

And:

```bash
VITE_MAINTENANCE_MODE=true npm run build
cat public/status.json
```

Should show `"maintenance": true`. Reset by running `npm run build` once more.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "generate status.json at build time"
```

---

## Task 5: `useStatus` hook

**Files:**
- Create: `src/hooks/useStatus.ts`

- [ ] **Step 1: Create the hook**

`src/hooks/useStatus.ts`:

```ts
import { useEffect, useState } from 'react';
import { APP_VERSION } from '../lib/version';

type StatusFile = {
  version: string;
  maintenance: boolean;
};

type Status = {
  maintenance: boolean;
  isOutdated: boolean;
};

const POLL_INTERVAL_MS = 30_000;

export function useStatus(): Status {
  const [status, setStatus] = useState<Status>({
    maintenance: false,
    isOutdated: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch('/status.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as StatusFile;
        if (cancelled) return;
        setStatus({
          maintenance: Boolean(data.maintenance),
          isOutdated: data.version !== APP_VERSION,
        });
      } catch {
        // Silent: network blip, dev mode without status.json, etc.
      }
    }

    fetchStatus();
    const id = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return status;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useStatus.ts
git commit -m "add useStatus hook"
```

---

## Task 6: Todo types + `TodoApp` component

**Files:**
- Create: `src/types.ts`
- Create: `src/components/TodoApp.tsx`

- [ ] **Step 1: Create the type**

`src/types.ts`:

```ts
export type Todo = {
  id: string;
  text: string;
  done: boolean;
};
```

- [ ] **Step 2: Create the TodoApp component**

`src/components/TodoApp.tsx`:

```tsx
import { useMemo, useState, type FormEvent } from 'react';
import type { Todo } from '../types';

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState('');

  const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text, done: false }]);
    setDraft('');
  }

  function toggle(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-semibold text-slate-800">Todos</h1>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What needs doing?"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={!draft.trim()}
        >
          Add
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {todos.map((todo) => (
            <li key={todo.id} className="group flex items-center gap-3 py-2">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggle(todo.id)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span
                className={
                  todo.done
                    ? 'flex-1 text-sm text-slate-400 line-through'
                    : 'flex-1 text-sm text-slate-700'
                }
              >
                {todo.text}
              </span>
              <button
                type="button"
                onClick={() => remove(todo.id)}
                className="text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-slate-700"
                aria-label="Delete"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          {remaining} item{remaining === 1 ? '' : 's'} left
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/components/TodoApp.tsx
git commit -m "add TodoApp component"
```

---

## Task 7: `MaintenancePage` and `UpdateBanner`

**Files:**
- Create: `src/components/MaintenancePage.tsx`
- Create: `src/components/UpdateBanner.tsx`

- [ ] **Step 1: Create MaintenancePage**

`src/components/MaintenancePage.tsx`:

```tsx
export function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mb-4 text-5xl">🛠️</div>
        <h1 className="mb-2 text-2xl font-semibold text-slate-800">We'll be right back</h1>
        <p className="text-sm text-slate-500">
          The app is down for a short bit of maintenance. Try again in a few minutes.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create UpdateBanner**

`src/components/UpdateBanner.tsx`:

```tsx
export function UpdateBanner() {
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-md"
    >
      <span className="text-sm text-slate-700">A new version is available.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-slate-800 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
      >
        Reload
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/MaintenancePage.tsx src/components/UpdateBanner.tsx
git commit -m "add maintenance page and update banner"
```

---

## Task 8: Install router, add NavBar and pages

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/components/NavBar.tsx`
- Create: `src/pages/TodoPage.tsx`
- Create: `src/pages/AboutPage.tsx`
- Create: `src/pages/ContactPage.tsx`
- Create: `src/pages/NotFoundPage.tsx`

- [ ] **Step 1: Install react-router-dom**

```bash
npm install react-router-dom
```

- [ ] **Step 2: Create NavBar**

`src/components/NavBar.tsx`:

```tsx
import { NavLink } from 'react-router-dom';

const linkBase = 'text-sm transition';
const linkInactive = 'text-slate-500 hover:text-slate-800';
const linkActive = 'text-slate-900 font-medium';

export function NavBar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-3">
        <span className="text-sm font-semibold text-slate-800">Todo App</span>
        <div className="flex gap-4">
          <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            Todos
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
            Contact
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create TodoPage**

`src/pages/TodoPage.tsx`:

```tsx
import { TodoApp } from '../components/TodoApp';

export function TodoPage() {
  return (
    <div className="px-6 py-10">
      <TodoApp />
    </div>
  );
}
```

- [ ] **Step 4: Create AboutPage**

`src/pages/AboutPage.tsx`:

```tsx
export function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-3 text-2xl font-semibold text-slate-800">About</h1>
      <p className="text-sm text-slate-600">
        A small demo todo app built with Vite and React, deployed to AWS Amplify. Nothing fancy.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Create ContactPage**

`src/pages/ContactPage.tsx`:

```tsx
export function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-3 text-2xl font-semibold text-slate-800">Contact</h1>
      <p className="text-sm text-slate-600">
        Reach out at <span className="font-mono">hello@example.com</span>. (Placeholder.)
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Create NotFoundPage**

`src/pages/NotFoundPage.tsx`:

```tsx
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-center">
      <h1 className="mb-3 text-2xl font-semibold text-slate-800">Page not found</h1>
      <Link to="/" className="text-sm text-slate-600 underline hover:text-slate-900">
        Back to todos
      </Link>
    </div>
  );
}
```

- [ ] **Step 7: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "add router pages and navbar"
```

---

## Task 9: Wire `App.tsx` with router, status hook, banner, and maintenance gate

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace `src/App.tsx`**

```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useStatus } from './hooks/useStatus';
import { NavBar } from './components/NavBar';
import { MaintenancePage } from './components/MaintenancePage';
import { UpdateBanner } from './components/UpdateBanner';
import { TodoPage } from './pages/TodoPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  const { maintenance, isOutdated } = useStatus();

  if (maintenance) {
    return <MaintenancePage />;
  }

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<TodoPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {isOutdated && <UpdateBanner />}
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 2: Verify in dev mode**

```bash
npm run dev
```

Open the URL. Verify:
- `/` shows the todo app with the navbar above it. Add, toggle, and delete a todo. Item count updates.
- `/about` shows the About page.
- `/contact` shows the Contact page.
- `/anything-else` shows the 404 page with a link back home.
- No update banner shows (status.json doesn't exist in dev mode, the hook silently fails — expected).

Stop the server.

- [ ] **Step 3: Verify in preview mode (production build)**

```bash
npm run build
npm run preview
```

Open the preview URL. Same checks as above. Also:
- Open DevTools → Network. Refresh. You should see a `status.json` fetch returning the generated file. Wait 30s and watch for the next fetch.

Stop the server.

- [ ] **Step 4: Verify maintenance mode locally**

```bash
VITE_MAINTENANCE_MODE=true npm run build
npm run preview
```

Open the preview URL. You should see only the maintenance page — no navbar, no todo UI, regardless of path. Visit `/about` to confirm maintenance preempts routing.

Stop the server.

- [ ] **Step 5: Verify update banner locally**

```bash
npm run build
npm run preview
```

In another terminal, edit `dist/status.json` and change the `version` field to a different string (e.g. `"fake-version"`). Save.

In the browser, wait up to 30 seconds (or refresh the page) — the update banner should appear in the bottom-right. Click "Reload" — the page reloads and the banner clears.

Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "wire app with router status hook and maintenance gate"
```

---

## Task 10: Amplify config files

**Files:**
- Create: `amplify.yml`
- Create: `customHttp.yml`

- [ ] **Step 1: Create `amplify.yml`**

`amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
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

- [ ] **Step 2: Create `customHttp.yml`**

`customHttp.yml`:

```yaml
customHeaders:
  - pattern: '/status.json'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache, no-store, must-revalidate'
```

- [ ] **Step 3: Commit**

```bash
git add amplify.yml customHttp.yml
git commit -m "add amplify build spec and status.json cache headers"
```

---

## Task 11: README with deployment + operations instructions

**Files:**
- Modify: `README.md` (replace whatever Vite scaffolded)

- [ ] **Step 1: Replace `README.md`**

```markdown
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

- `scripts/generate-status.mjs` runs as `prebuild` and writes `public/status.json` with the current commit SHA (`AWS_COMMIT_ID` in Amplify, `git rev-parse --short HEAD` locally).
- The same SHA is injected into the JS bundle via Vite's `define` as `__APP_VERSION__`.
- The app polls `/status.json` every 30 seconds. If the fetched version differs from the bundle version, a persistent "new version available — reload" banner appears.
- `customHttp.yml` sets `Cache-Control: no-cache` on `/status.json` so clients always see the latest deploy.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "add readme with deployment and ops docs"
```

---

## Task 12: Final end-to-end verification

- [ ] **Step 1: Clean build + preview**

```bash
rm -rf dist node_modules/.vite
npm run build
npm run preview
```

Open the preview URL and exercise the app:
- `/` — add a few todos, toggle and delete, see the count update
- `/about` and `/contact` — both render
- `/totally-fake` — 404 page with link back
- DevTools → Network → confirm `status.json` is fetched on load
- Edit `dist/status.json` to change the version → banner appears within 30s
- Stop preview, run `VITE_MAINTENANCE_MODE=true npm run build && npm run preview` → maintenance page on every path

- [ ] **Step 2: Type-check + lint pass**

```bash
npx tsc --noEmit
npm run lint
```

Expected: no errors. (If `lint` reports complaints from scaffolded ESLint config in untouched files, address only the ones in files this plan created.)

- [ ] **Step 3: Confirm `public/status.json` is git-ignored**

```bash
git status
```

Expected: clean working tree. `public/status.json` should not appear as untracked.

- [ ] **Step 4: Push and deploy**

```bash
gh repo create vite-amplify-react-app --public --source=. --remote=origin --push
```

Then follow the deployment steps in `README.md` (connect Amplify, set up SPA rewrite). Verify the deployed app at the Amplify URL behaves identically to local preview.

---

## Self-Review Notes

**Spec coverage:**
- ✅ Stack (Vite, React, TS, Tailwind, react-router-dom, Amplify Gen 1) — Tasks 1, 2, 8
- ✅ `status.json` shape and generation — Task 4
- ✅ Build-time version constant via `define` — Task 3
- ✅ `useStatus` hook polling every 30s — Task 5
- ✅ Todo features (add/toggle/delete/count/empty state, in-memory) — Task 6
- ✅ MaintenancePage, UpdateBanner, NavBar — Tasks 7, 8
- ✅ Pages (Todo, About, Contact, 404) + routing — Task 8
- ✅ App.tsx maintenance gate preempts router — Task 9
- ✅ `amplify.yml`, `customHttp.yml` — Task 10
- ✅ Amplify SPA rewrite documented (console step) — README in Task 11
- ✅ Local maintenance + version-check testing instructions — Tasks 9, 11
- ✅ Deployment instructions (GitHub → Amplify) — README in Task 11
- ✅ Toggle maintenance via env var + redeploy — README in Task 11
- ✅ Out of scope items (auth, persistence, dark mode, tests) intentionally skipped

**Placeholders:** None — all code blocks complete, all commands explicit.

**Type consistency:** `Todo` type used consistently across `types.ts` and `TodoApp.tsx`. `Status`/`StatusFile` types are local to `useStatus.ts` (consumers only see the destructured `{ maintenance, isOutdated }`). `APP_VERSION` is the single export from `version.ts`.
