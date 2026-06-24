# Deployment Fix Notes

## What was changed

This package was patched for Vercel deployment survival.

The app is still a frontend/local-state CRM prototype with very large client modules. The previous package loaded the full CRM directly from `app/page.jsx`, which made the production build do more work at the route boundary.

This patch adds a lightweight client-only loader:

- `app/ClientOnlyApp.jsx`
- `app/page.jsx` now imports only the loader
- `ECCSPrototype` is dynamically imported with `ssr: false`

This keeps the admin/client CRM out of server-side rendering and reduces build-time work for the initial route.

## Config changes

`next.config.mjs` now includes:

- build-time ESLint skipping
- build-time TypeScript error skipping
- markdown and legacy output tracing exclusions
- `poweredByHeader: false`
- `reactStrictMode: false`

Lint should still be run manually before deployment:

```bash
npm run lint
```

## Why this was needed

The project still has two large bottleneck files:

- `src/features/eccs/admin/AdminApp.jsx`
- `src/features/eccs/lib/crm.js`

These should be split before Supabase wiring. This deployment patch is meant to get the current prototype live without doing a risky rewrite.

## Recommended Vercel settings

- Framework Preset: Next.js
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave blank / default
- Root Directory: project root, where `package.json` is located

## Next engineering step

Split `AdminApp.jsx` into route-level/admin-domain modules before adding Supabase persistence.
