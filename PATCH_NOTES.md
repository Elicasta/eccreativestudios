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
