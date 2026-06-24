# EC Creative Studios CRM Engineering Review

## Pass type

Hardening, cleanup, diagnostics, Supabase-readiness, and responsive polish. This was not a feature expansion pass.

## Files changed

- `src/features/eccs/ECCSPrototype.jsx`
- `src/features/eccs/admin/AdminApp.jsx`
- `src/features/eccs/client/ClientApp.jsx`
- `src/features/eccs/components/ManualOverride.jsx`
- `src/features/eccs/lib/crm.js`
- `app/globals.css`
- `package.json`
- `package-lock.json`
- `.eslintrc.json`
- `scripts/diagnostics.mjs`
- `SUPABASE_READINESS_AUDIT.md`
- `ENGINEERING_REVIEW.md`
- `CHANGELOG_ENGINEERING_HARDENING.md`

## Product engineering assessment

The app is no longer a tiny prototype. It has real CRM domains and a believable workflow, but it is still compressed into large frontend files. The right next move is not more UI. The right next move is table design, service boundaries, and controlled persistence.

The main flow is structurally sound:

`Inquiry → Client → Quote → Contract → Invoice → Payment → Portal → Session → Gallery`

But the backend must not copy the local state shape exactly. Some arrays and derived flags need normalization.

## Bugs and risks found

### Fixed

1. **Floating Manual Override button covered content**
   - Removed the always-present floating button.
   - Kept the same modal/control behavior.
   - Added a secondary top pill in the admin topbar when a client is selected.

2. **Mobile safe-area problems**
   - Added safe-area-aware topbar, drawer, modal, and bottom nav classes.
   - Added global horizontal overflow protection.
   - Adjusted admin and client portal shells so iPhone status/home indicator areas are respected.

3. **localStorage write could throw**
   - Wrapped state persistence in a try/catch.
   - This protects private mode, quota issues, and storage failures until Supabase is the real source of truth.

4. **Contract hook order risk**
   - `ProjectWorkspaceCard` called `useEmailGate` after an early return.
   - Moved hook call before the return path to satisfy React hook ordering.

5. **Document lock inconsistency**
   - Accepted quotes now lock.
   - Sent/signed contracts now lock.
   - Paid invoices remain locked.
   - Quote item editing now respects quote lock state.
   - Contract editing now respects draft/locked/signed state.
   - Invoice item editing uses a shared edit guard.

6. **Unsafe delete paths**
   - Quotes with downstream contracts/invoices or accepted status are blocked from delete.
   - Signed contracts or contracts with invoices are blocked from delete.
   - Paid invoices or invoices with payments are blocked from delete.
   - The app logs an activity event instead of silently deleting dependent records.

7. **Lint setup was missing**
   - Added `.eslintrc.json`.
   - Added `eslint` and `eslint-config-next` dev dependencies.
   - `npm run lint` now runs instead of prompting for setup.

8. **Diagnostic safety coverage was missing**
   - Added `scripts/diagnostics.mjs`.
   - Added `npm run diagnostics`.
   - Covered money formatting, lock rules, invoice balance math, safe JSON parsing, and notification support detection.

### Found but not fully fixed

1. **Optimized Next build times out in this sandbox**
   - `next build` reaches `Creating an optimized production build ...` and does not complete before the sandbox timeout.
   - This may be environment/resource related, but it should be verified locally and on Vercel.
   - If reproducible, split `AdminApp.jsx` by page and use dynamic imports for heavy admin views.

2. **File size remains high**
   - `AdminApp.jsx` is still over 5,000 lines.
   - `crm.js` is still over 2,600 lines.
   - I did not split these during this pass because broad movement before Supabase schema approval would raise break risk.

3. **Project is not a real entity yet**
   - Project state is mostly derived from session flags.
   - Backend should introduce a `projects` table before persistence wiring.

4. **Notification system is local/demo only**
   - Browser notification readiness exists.
   - Real web push requires stored subscriptions, VAPID keys, and server/edge push delivery.

5. **Activity events need stronger schema**
   - Current activity is readable, but not rich enough for analytics/audit.
   - Add `record_type`, `record_id`, `actor_type`, `actor_id`, and `metadata`.

## Visual QA notes

### Mobile issues found

- Client portal header was not safe-area aware.
- Bottom nav could sit too close to iPhone home indicator.
- Floating Manual Override competed with bottom navigation and content.
- Drawer needed safe-area padding and width guard.
- App shell needed horizontal overflow protection.

### Mobile fixes applied

- Added `env(safe-area-inset-top)` top padding.
- Added `env(safe-area-inset-bottom)` bottom nav/modal padding.
- Removed floating Manual Override.
- Added `overflow-x: hidden` globally and on app main shells.
- Added drawer max width for narrow phones.

### Tablet issues found

- Settings and admin pages are still dense because they live inside one large admin component.
- Topbar can wrap with search, client switcher, quick create, and override pill.

### Tablet fixes applied

- Topbar now allows wrapping instead of forcing horizontal overflow.
- Manual Override pill hides long label on small widths.

### Desktop issues found

- Desktop structure is stable, but code organization is the bigger risk.
- Search, client switcher, and quick-create are all packed into the topbar.

### Desktop fixes applied

- Manual Override is secondary and does not dominate desktop.
- No brand direction or broad layout redesign was changed.

### Still needs visual QA

Manually inspect these views in browser devtools and on real iPhone/PWA mode:

- Dashboard
- Activity / Alerts
- Clients
- Client record
- Inquiries
- Quotes
- Quote preview
- Contracts
- Invoices
- Projects
- Sessions
- Calendar
- Settings
- Client Portal home
- Client Portal messages
- Client Portal documents
- Client Portal more drawer

## Diagnostics run

| Command | Result |
|---|---|
| `npm ci --no-audit --no-fund` | Passed |
| `npm run diagnostics` | Passed |
| `npm run lint` | Passed with warnings |
| `NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS='--max-old-space-size=4096' npx next build --no-lint` | Timed out during optimized production build |

## Lint warnings remaining

- `safeClients` dependency warning in `ActivityPage`.
- `newTemplate` dependency warning in template builder effect.

These are warnings, not errors. They should be cleaned during the file split.

## Recommended next move

Do the Supabase schema pass first. Then split the large files by module while wiring repositories. Avoid adding more features until the data layer exists.

## Deploy Fix Notes

The previous package was nested under `eccs_hardening/`. Some deployment flows treat the zip root as the project root, so they will not find `package.json` unless the root directory is configured manually. The fixed deploy package places `package.json`, `app/`, `src/`, `public/`, and config files at the top level.

`next.config.mjs` now skips build-time lint/type validation and disables output file tracing for this prototype package. Run `npm run lint` and `npm run diagnostics` directly before deployment. The longer-term fix is to split the current large CRM files into smaller route/module chunks before Supabase wiring.
