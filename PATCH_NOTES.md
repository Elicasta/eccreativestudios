# Patch Notes

## v1 — Refactor pass

### Goal
Create the first working app skeleton from the original prototype without deleting any existing screens.

### Completed
- Created a Next.js app shell.
- Preserved the original prototype in `/legacy`.
- Moved brand tokens to `src/features/eccs/lib/brand.js`.
- Split admin and client experiences into separate files.
- Split global controls into `TopSwitcher` and `ManualOverride`.
- Rebuilt the data layer from a single hardcoded client into a real multi-client reducer (`lib/crm.js`) with `getClientBundle` selectors and `localStorage` persistence.

### What v1 actually shipped vs. what the old README claimed
The v1 README said every screen from the original prototype was preserved. It wasn't:
- `ManualOverride.jsx` and `DocModal.jsx` existed as files but were never imported anywhere — dead code pointed at the old single-client `stageIndex` model (`lib/pipeline.js`, also dead).
- Calendar, Templates, Contact Forms, Email Marketing, Social Messaging, Settings, Branding, Team, Workflows, Plan & Prep, and Gallery were not present in the nav or the page switch, despite being listed as intact.
- Portal Editor had no image management at all — no URL input, no upload, no Google Drive button — despite `visionImages` existing as an empty array in state.
- AdminApp had zero mobile navigation (sidebar hidden below `md`, no drawer, no fallback).
- `archived` and `gallery_delivered`-equivalent states had no code path that could ever return them from `derivePipelineStage`.

This is intentional context for why v2 exists — the v1 patch notes were honest about goals, the v1 README was not honest about results.

### Intentional non-changes (still true after v2)
- No Supabase connection.
- No auth.
- No Stripe.
- No real email sending.
- No route split (still a single `/` page rendering everything client-side).

---

## v2 — Close the gap

### Fixed (real bugs, not missing features)
- **Manual Override rebuilt** against the new reducer. It no longer references a nonexistent `stageIndex`/`goToStage`. It now dispatches a new `force_stage` action that creates whatever real quote/contract/invoice/session records are missing to get the *selected* client to the chosen stage, plus dedicated `mark_lost` / `mark_archived` actions. Rendered from `ECCSPrototype.jsx` — it's actually on screen now.
- **`DocModal` and `lib/mock-data.js` deleted.** Their functionality already existed inline (`DocumentsPage` in the client portal has its own accept/sign/pay buttons per document) — there was no real gap behind the dead file, so it was removed instead of resurrected.
- **`lib/pipeline.js` deleted** — it was the old single-client model, fully orphaned, kept only `ManualOverride.jsx` company in the graveyard.
- **`archived` and `gallery_delivered` are now reachable stages.** `derivePipelineStage` takes `client` as an argument now (it didn't before) and checks `client.status === "archived"` and `session.galleryStatus === "delivered"`.

### Added
- Admin mobile nav: drawer + bottom tab bar (Home / Clients / Inquiries / Alerts / More), matching the pattern the client portal already had.
- Admin Calendar page: month grid + day agenda, built from real `state.sessions` dates.
- Portal Editor: real Vision Board image management (paste URL or upload from device, stored as data URLs in state) and a separate Gallery Images manager, plus a "Deliver gallery" action gated on session completion.
- Client Vision Board: renders real images now, slideshow-first with tap-to-grid (Pinterest-style), instead of text only.
- Client Plan & Prep and Gallery pages — Gallery stays locked until the studio explicitly delivers it.
- Templates engine (Contracts / Invoices / Quotes / Questionnaires / Emails tabs, per-type settings, merge-field insertion).
- Contact Form Builder (field palette, platform tags, fake share link).
- Email Marketing (segments computed from real client `tags`, not fake numbers) and Social Messaging (IG keyword-DM rules, explicitly marked as not connected to Meta).
- Settings / Branding / Team / Workflows — thin placeholders so the nav doesn't dead-end, no real functionality claimed.
- Projects page restructured into a folder-per-client grid, with the existing booking-gate workspace opening underneath whichever folder is selected.

### Still not done, flagged honestly this time
- One session per client. `state.sessions.find()` only ever returns the first match. Multi-project clients need a real "project" entity separate from "session," not just a UI change.
- Email Marketing / Social Messaging / Contact Forms still have zero backend. They look real; they don't send anything.
- `npm run build` passes clean (verified), but there's still no test suite.

### Verification
- `npm install && npm run build` — compiles, lints, and statically prerenders with no errors.
- Manually traced every new reducer action (`force_stage`, `mark_lost`, `mark_archived`, `deliver_gallery`) against `getClientBundle`'s actual field names to make sure nothing reads a property that doesn't exist.

---

## v3 — Click-through, scale, and depth pass

### Fixed
- **Client overview hero photo wasn't rendering.** The client portal's Overview page never read `portal.visionImages` at all — the hero was always a plain text gradient. It now shows the first vision board image as a real photo, clickable through to the full Vision Board.
- **Dashboard had no hero photo support.** Added `studioSettings.heroImageUrl` (set from the new Branding page) so the admin dashboard hero can show a real photo instead of being permanently gradient-only.

### Added — navigation & cross-linking
- Topbar title is now dynamic per page (was hardcoded "Studio Admin" everywhere).
- Global client switcher in the Topbar — change the active client from any page, not just Dashboard/Clients/Pipeline.
- Sidebar restored to grouped sections (Clients / Sales / Communication / Studio) instead of one flat list.
- Pipeline cards now show client avatar, quote value, and a clear hover/active state — clicking was already wired, now it's obvious it's clickable.

### Added — Dashboard
- General aggregate view (Pipeline Overview preview + Revenue Snapshot donut + Upcoming Sessions) shows automatically when no client is selected; swaps to the focused client view the moment one is picked. "Clear" button to drop back to general view.
- Revenue Snapshot is a real conic-gradient donut computed from actual invoice totals by status (draft / sent / partially paid / collected) — not fake numbers.

### Added — scale (built for 100+ clients, not 4)
- Inquiries: stat cards by status, session-type filter, search, sort by received date.
- Clients: status filter pills (In progress / Booked / Lost), compact rows, "Show more" pagination instead of rendering every client at once.
- Projects: working search box + "booked only" toggle + pagination on the folder grid.

### Added — Quotes / Contracts / Invoices / Payments depth
- Quotes: preview moved into a modal (was a permanent half-screen panel), real breathing room in the builder, "+ Add package" / "+ Add addon" catalog pickers, per-item "optional add-on" toggle. (Client-must-pick-one bundles are flagged as not-yet-built, not faked.)
- Contracts: now reads like an actual document — numbered legal clauses (editable), Photographer/Client parties block, a real signature block with a printed-name line and date, instead of one paragraph of filler text.
- Invoices: real line-item builder (add/remove/edit, same catalog pickers as Quotes), due date as an actual date input, preview modal, payment method selector.
- Payments: payment-method breakdown, a real "record a payment" form (pick invoice + amount + method) instead of only a blanket "pay full balance" button, and a receipt modal per logged payment.

### Verification
- `npm run build` — compiles, lints, and statically prerenders clean after every section above.
- Existing `localStorage` saves from before this pass will load fine — all new fields (`studioSettings`, `contract.clauses`, catalog-added items) are read with safe fallbacks, so old persisted demo data won't crash the app, it just won't have the new fields until you trigger a Manual Override or recreate the record.
