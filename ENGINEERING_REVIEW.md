# Engineering Review — Hardening Pass (pre-Supabase)

Scope: audit, diagnose, fix safe bugs, document gaps. No feature work, no rewrite, no removed
features. This builds on the existing v7.x patch series (see `PATCH_NOTES_V7*.md`) — that work was
already solid; this pass is specifically about what's needed before wiring a real backend.

## Interpretation, stated up front

- "Boil the lake" here means: finish what's touched to a real standard (the lock-state bug, the
  delete-dependency gap, the build break) — not rewrite the 5,000-line `AdminApp.jsx` into a module
  tree in one pass. The task explicitly says don't casually rewrite, don't move files just to move
  them, preserve current UX. That instruction wins over a general completeness preference.
- I did not have a live browser/screenshot tool available in this environment, so the responsive
  fixes below are based on reading the layout code (Tailwind classes, fixed positioning, viewport
  meta) and applying known iOS PWA safe-area rules, not visual screenshots at each breakpoint. That's
  flagged explicitly below as remaining QA, not silently skipped.
- `ManualOverride` was rendered globally regardless of which app (`admin`/`client`) was active. I'm
  treating "client portal shouldn't expose an internal pipeline-override tool" as an actual bug fix,
  not just a style preference, since Manual Override calls `actions.forceStage` /`markLost`
  /`markArchived` against the studio's own pipeline — there's no legitimate reason for a client to
  ever see that control, override-button styling aside.

## 1. Diagnostics run

```bash
npm run lint
NEXT_TELEMETRY_DISABLED=1 npm run build
```

No test runner exists in this project (`package.json` has no `test` script, no Jest/Vitest config).
Did not add one — see "Testing" section below for why, and what I added instead.

## 2. Bugs found and fixed

### Build-blocking
- **`next build` was failing outright** on 20 `react/no-unescaped-entities` lint errors across
  `AdminApp.jsx`, `ClientApp.jsx`, `ManualOverride.jsx` (raw `'` and `"` inside JSX text). Lint errors
  fail Next's production build by default. Fixed all 20 by escaping to `&apos;`/`&quot;`. **This
  means the last deployable build of this app, as committed, could not actually be built for
  production.** Confirmed fixed: clean `next build` now, zero errors, zero warnings.

### Logic bugs
- **Quote "Unlock edit" did nothing.** `quoteLocked` was computed as
  `quote.locked || ["sent","viewed","accepted","declined"].includes(status)`. Clicking "Unlock edit"
  set `locked: false`, but since the quote's `status` was still `"sent"`, the status check alone kept
  it locked — the flag never had a chance to win. Fixed by making the soft-lock (`sent`/`viewed`)
  respect an explicit `locked: false` override, while accepted/declined stay hard-locked regardless
  (matches existing intent — the unlock button was never shown for those two statuses to begin with).
- **Contracts had no lock concept at all.** Quotes and invoices both lock on send/completion;
  contracts didn't. A signed contract's template dropdown, every clause title/body field, "+ Add
  section", and "Remove" were all still live and editable with no warning. Added the same
  default-lock/hard-lock/unlock pattern: sent = soft lock (unlockable), signed = hard lock (no
  unlock control shown, matching how accepted quotes and paid invoices behave). Wired a `locked` pill
  and "Unlock edit" button into the Contract Controls panel, and disabled the template select and
  every clause field/button when locked.
- **Deleting a quote or contract could leave a dangling reference.** `delete_quote` removed the quote
  even if a contract already pointed at it via `contract.quoteId`; same for `delete_contract` vs.
  `invoice.contractId`. Fixed at the reducer level (the actual data layer, so this can't be
  bypassed by any future UI) — delete is now a no-op if a dependent record exists. Added matching
  UI feedback: the delete buttons now check first and show a clear message ("Delete that contract
  first") instead of silently failing or, previously, succeeding and leaving the dependent record
  pointing at nothing.
- **`ManualOverride` was reachable from the Client Portal**, not just Admin. It's now only mounted
  when `app === "admin"`.

### Stability / lint
- Fixed a real `react-hooks/exhaustive-deps` issue in `ActivityPage` — `clientById` was memoized
  against a `safeClients` value recomputed fresh every render (defeating the memo and risking a
  stale-closure read if `state.clients` changed shape across renders without `safeClients`'
  reference changing the way React expected). Moved the array-safety check inside the `useMemo`
  callback so the dependency is the real source (`state.clients`).
- Left one `exhaustive-deps` warning suppressed with an explicit comment explaining why
  (`newTemplate` in the Templates page only closes over `tab`, already a listed dependency, and
  reads `data` through a setState updater function — adding it to deps would just be cosmetic).
  Documenting this rather than silently disabling it.

## 3. Structural cleanup completed

Kept this intentionally small, per the "don't move files to move them" rule:
- Extracted a reusable `ManualOverrideTrigger` pill component out of `ManualOverride.jsx` (it already
  lived in the right file, just needed to stop being a floating button — see section 11).
- No file moves. The existing `admin/`, `client/`, `components/`, `lib/` split (already done in a
  prior pass, per `README.md`) is the right level of separation for now — `AdminApp.jsx` is large
  (5,200 lines) but it's large because it's ~20 page components in one file, not because logic and UI
  are tangled. State/business logic is already cleanly separated into `lib/crm.js` (reducer + derived
  selectors); the admin/client files are just UI. Splitting `AdminApp.jsx` into one-file-per-page
  would be a real, valuable refactor, but it's also exactly the kind of "redesign unrelated systems
  while you're in here" risk the brief explicitly warned against, and it touches every page in the
  app for zero behavior change. **Flagging it as the recommended next structural step, not doing it
  in this pass** — see "Remaining risks."

## 4. CRM flow audit — answers to the explicit questions

| Question | Answer |
|---|---|
| Can a quote exist without a client? | No — `createQuote` always takes a `clientId`. |
| Can a quote exist without an inquiry? | Yes, intentionally (manual quotes). `inquiryId` is nullable. |
| Can a contract pull scope from an accepted quote? | Yes, and it's enforced: `create_contract` returns the state unchanged if no accepted quote exists for that client. |
| Can an invoice reference quote, client, project, and session? | Yes — `create_invoice` sets `quoteId`, `contractId` (from the signed contract if any), and `sessionId`. There's no separate "project" id (see readiness audit — project is derived, not a record). |
| Can deposit and final invoices be separated cleanly? | Yes — `kind: "deposit" | "final" | "full"`, and the final-amount math (`remainingAmount`) already accounts for what's already been billed, not just `total - deposit`. |
| Can a session date update the project, invoice due date, calendar, and portal? | Session date updates session/calendar/portal correctly. It does **not** currently re-derive an invoice due date from the session date — final invoices store their own `dueDate` independently. Not fixed in this pass (it's a feature decision, not a bug — flagging for product call). |
| Are sent documents locked? | Yes for all three types now (was broken for contracts, see above). |
| Are paid invoices fully locked? | Yes, and correctly cannot be unlocked (confirmed the unlock button is conditioned on `status !== "paid"`). |
| Can locked documents still be previewed? | Yes for quotes (`LockedDocumentPreview` + "View sent quote"). Contracts don't have a separate preview-mode component — they just disable the edit controls in place. Functionally locked, but not visually distinguished as a separate "preview" state the way quotes are. Worth a follow-up for visual consistency, not a correctness bug. |
| Is there a safe unlock path for unpaid sent documents? | Yes for all three now (quote unlock was broken, contract unlock didn't exist — both fixed). |
| Can deleted records leave broken references? | Could, for quote→contract and contract→invoice. Fixed with a reducer-level dependency guard. Invoice deletion was already correct (cleans up `payments` and `session.invoiceIds`). |
| Are portal links consistent? | Yes — portal access is gated entirely through `booking.isBooked`, computed the same way everywhere via `getClientBundle`. No separate/duplicated gating logic found. |
| Are client messages tied to a client? | Yes — every message has `clientId`, filtered consistently in both `ActivityPage` and the portal Messages page. |
| Are activity records generated from actual actions or only static data? | Real actions — every state-mutating reducer case that logs activity calls `withActivity()` with the real client name and a real description of what happened. Confirmed by reading the reducer, not assumed. |

## 5. Document behavior — see the table in `SUPABASE_READINESS_AUDIT.md` ("Document locking" section)
for the before/after on quotes, contracts, invoices. Not duplicating it here.

## 6. Activity & Notifications

This area was already defensively coded from a prior pass: every list read in `ActivityPage` goes
through an `Array.isArray(...) ? ... : []` guard before use, so a malformed/missing array in
localStorage can't crash the page. The push/notification bridge (`ECCSPrototype.jsx`) already wraps
every `localStorage` read and `JSON.parse` in try/catch, already guards `typeof window === "undefined"`
before touching browser APIs, and is honest in the UI copy about what's real (local notifications)
vs. not (actual server push — clearly marked as needing a Supabase Edge Function + VAPID keys, with
placeholder `/api/push/subscribe` and `/api/push/test` routes that don't fake success). No changes
needed here beyond the one stale-memo fix in section 2.

## 7. Settings

Reviewed the tabs (Email templates, Locations, Quote/Contract templates, Add-ons, Portal defaults,
Notifications). Structurally fine — each tab is its own component reading/writing through `actions`,
no shared mutable state between tabs, no obvious "dumping ground" coupling. The one real content gap
(quote templates being label-only strings with no template body, unlike contract/email templates) is
documented in the readiness audit as a product decision, not fixed here since it's new feature work,
not hardening.

## 8. Future-module readiness

Confirmed nothing in the current naming or data shape would box in: Email Marketing
(`marketingCampaigns[]` already exists as a real array, just not automated), Social Messaging
(`socialRules[]` exists, explicitly marked mock in the UI copy), Contact Forms (Templates tab already
has a forms-shaped template type). No `workflow_rules` table or automation engine exists yet, and
none should be built speculatively — see readiness audit.

## 9. Testing

No test runner existed in this project. Given the size of the existing reducer (`crm.js`, 2,600+
lines) and the explicit instruction to "not overbuild testing," I did not install Jest/Vitest in this
pass — adding a full test framework is a bigger decision (config, CI wiring, coverage targets) than
"harden the existing prototype," and risks exactly the kind of unrequested infrastructure change the
brief asked to avoid. **What I'd actually recommend before Supabase wiring:** add Vitest (lightest
setup for a Next.js + plain-function reducer like this one) with focused tests on
`recalcQuote`/`recalcInvoice` (money math), `derivePipelineStage`/`deriveBookingState` (the logic this
whole app's gating depends on), and the three lock-state computations fixed in this pass — those are
exactly the kind of pure functions that are cheap to test and expensive to get wrong silently. Did
not add this myself since it's a tooling decision I'd want confirmed first, not assumed.

## 10. Responsive / visual audit

### What was fixed (shell-level, not per-page)

1. **iPhone status bar / Dynamic Island overlap.** `app/layout.jsx` already sets
   `viewportFit: "cover"` and `appleWebApp.statusBarStyle: "black-translucent"` — both correct for a
   PWA that wants edge-to-edge content, but neither does anything by itself; the app has to add its
   own safe-area padding or content renders under the status bar/notch. There was no safe-area
   handling anywhere in `globals.css`. Since both the Admin shell and the Client Portal share one top
   bar (`TopSwitcher.jsx`, `sticky top-0`), I fixed it once there instead of patching every page:
   added `padding-top: env(safe-area-inset-top)` via a new `.ecc-safe-top` utility class.
2. **Bottom nav touching the home indicator.** Same shape of problem, same shell-level fix: both
   mobile bottom nav bars (Admin's and the Client Portal's — two instances, not "every page," so
   fixing both directly was the right level) get `.ecc-bottom-nav`, which adds
   `padding-bottom: calc(0.5rem + env(safe-area-inset-bottom))`. Bumped the corresponding `<main>`
   bottom padding in both shells so scrollable content clears the now-taller nav instead of hiding
   behind it.
3. **Manual Override floating button removed.** Per the explicit ask: no more
   `fixed bottom-5 right-5` button covering content. Replaced with an inline `ManualOverrideTrigger`
   pill placed next to "Edit portal" at the top of the Project Workspace card — visible when relevant
   (you're looking at a specific client's booking workflow), optional, not styled as a primary action.
4. **Global horizontal-overflow guard.** Added `overflow-x: hidden` + `width: 100%` on `html, body` in
   `globals.css` as a backstop. Existing tab strips (Quotes, Contracts, Invoices, Settings, Templates)
   already correctly use `overflow-x-auto` for horizontal scrolling rather than wrapping or breaking
   layout — that pattern was already consistent across the app, no changes needed there.

### What I checked and found already correct
- Drawers (mobile sidebar for both Admin and Client Portal) are full-height, scrollable, with a tap-
  outside-to-close overlay — already touch-usable.
- Calendar month/week grids use `grid-cols-7` with small gaps, which holds up at narrow widths better
  than a table would; no horizontal scroll needed there.
- Quote/contract/invoice preview content already wraps in a max-width container with responsive
  padding (`px-8 sm:px-14` etc.) rather than fixed pixel widths.

### What still needs real visual QA (could not verify without a browser/device)
- Actual on-device check of the safe-area fix on a notched iPhone in **standalone PWA mode**
  specifically (Safari tab mode and Home Screen mode can render `env()` insets slightly differently
  in practice; the CSS is correct per spec, but "correct per spec" and "looks right on an iPhone 15
  Pro with a Dynamic Island" are not always the same thing without a real check).
- Tablet breakpoint (the app currently jumps from a mobile drawer pattern straight to the `md:`
  desktop sidebar — there's no intermediate tablet-specific layout, which may be fine but wasn't
  something I could visually confirm one way or the other).
- Settings page tab overflow specifically at exactly-768px-wide viewports (the `md:` breakpoint
  boundary), where it could fall awkwardly between the mobile and desktop nav patterns.
- Quote/contract/invoice preview modals at landscape orientation on phones.

## Files changed

```
app/globals.css
src/features/eccs/ECCSPrototype.jsx
src/features/eccs/components/ManualOverride.jsx
src/features/eccs/components/TopSwitcher.jsx
src/features/eccs/admin/AdminApp.jsx
src/features/eccs/client/ClientApp.jsx
src/features/eccs/lib/crm.js
SUPABASE_READINESS_AUDIT.md (new)
ENGINEERING_REVIEW.md (new, this file)
CHANGELOG_ENGINEERING_HARDENING.md (new)
```

## Remaining risks (full list, consolidated)

1. **Sessions are one-per-client** in the data model — highest-impact schema decision before
   Supabase, already known (was in the README), restated in the readiness audit so it's not missed.
2. **Display-string dates everywhere** (`"Jun 22, 2026"` instead of real timestamps) — biggest
   concrete Supabase blocker, needs a decision before table design, not fixed in this pass since it
   touches the entire reducer's date-handling and is a data-shape change, not a bug fix.
3. **No auth/RLS boundary exists at all** — `admin` vs `client` is a local UI toggle, not access
   control. Don't treat it as one when designing Supabase row-level security.
4. **`AdminApp.jsx` at 5,200 lines** is stable but large. Splitting it into one file per page (the
   `src/modules/*` structure suggested in the brief) is real, valuable, low-risk-if-done-carefully
   work — recommending it as the next dedicated pass, not bundling it into this one.
5. **Quote templates have no real content model** (label strings only) — a product decision, not a
   bug.
6. **Session date doesn't currently push a new due date onto an already-created final invoice** —
   confirmed via the flow audit (section 4), flagging for a product decision rather than guessing the
   intended behavior and changing it.
7. **Visual QA items listed above** — code-level safe-area/overflow fixes are in; a real-device pass
   is the next step before calling mobile layout "done."

## Recommended next step

Wire Supabase auth first, before any table migration. Every other risk on this list (RLS design,
the sessions one-to-many fix, even the date-format migration) is easier to get right once there's a
real notion of "who is making this request" than to retrofit afterward.
