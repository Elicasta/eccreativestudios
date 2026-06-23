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

---

## v4 — Workflow, scale, and structure pass (feedback doc + voice transcript)

### Fixed (real bugs)
- **Stale state when switching clients.** Quotes/Contracts/Invoices/Payments/Projects/Portal Editor now remount (`key={selectedClientId}`) when the selected client changes, so a previous client's open modal, payment draft, or preview state can't leak into the next client's view. This was the root cause behind "the project folder stays open for everybody."
- **Project empty state was vague.** Now says exactly "No project has been created for this client yet" with a single CTA that routes to whatever step is actually next (quote, contract, invoice, or portal handoff) instead of a dead-end message.
- **Client portal hero/vision photos already covered in v3** — this pass adds the same real-image treatment to the Gallery (see below).

### Added — Dashboard & navigation
- Dashboard client search: clicking a name selects/loads the client (stays on Dashboard); clicking the arrow opens their full Clients page. Added a "Clear search" / X control so search has an obvious exit.
- Dashboard now shows the general aggregate view (Pipeline Overview + Revenue Snapshot + Upcoming Sessions) when no client is selected, exactly as before, and the focused client view when one is picked — this was already right per your notes, just confirmed/preserved.
- Global client switcher in the Topbar (added last pass) lets you change focus from literally anywhere — confirmed working across every page touched this round.

### Added — Calendar & Availability
- Real availability system: `state.availability` holds open time slots per date, editable from Calendar via a new "Edit Availability" toggle — click a date, add/remove times.
- The client-side "Pick your date" flow and the admin Sessions page's manual-schedule shortcut both now read from this real availability instead of a hardcoded slot list. A client can only ever pick a time the studio actually opened.
- Calendar gained Week and List views alongside Month (List shows every upcoming session with client, type, date, time, location, status, one-tap to open).

### Added — Email discipline
- Nothing sends blind anymore. Every "Send" action (quote, contract, invoice, portal access, date-selection, calendar invite, not-booked reminder) opens a preview modal first — subject and body are editable, then either "Send now" or "Schedule send" (stored in `state.scheduledEmails`, visible and actionable from the Emails page).

### Added — Quotes / Contracts / Invoices: dashboard-first
- All three now follow the same rule: no client selected → a real dashboard (status tabs, search, totals where relevant — Invoices shows Total Unpaid / Deposits Pending / Final Pending / Past Due) listing every record across every client. Select a client → the page narrows to just their record, with a "← All quotes/contracts/invoices" link back out. This matches the Inquiries page pattern you already liked.

### Added — Quote/Invoice builder depth
- Line-item descriptions are now a real expandable textarea with a lightweight Bold/Italic/Bullets/Numbered toolbar (markdown-style, rendered properly in every preview — admin and client). No external rich-text library, just enough formatting to look polished.
- Items, descriptions, and qty/price now stack with actual room to breathe instead of being squeezed into one row.
- Add-Ons manager (new page): create/edit/price/delete add-ons, including a real Studio Rental entry plus Extra Hour, Rush Delivery, Travel Fee, and Album Credit as a starting catalog. Linked directly from the quote builder's "+ Add addon" button.
- Client-must-pick-one package options are explicitly **not** built yet — flagged in the UI itself rather than faked.

### Added — Contracts
- Legal-document feel: numbered clauses (Scope of Services, Payment Terms, Rescheduling & Cancellation, Usage Rights, Delivery, Liability), each editable, plus a real Photographer/Client parties block and a signature line with printed name + date.

### Added — Payments restructure
- Payment Overview row (Total Unpaid, Deposits Pending, Final Pending, Past Due) and an Outstanding Payments worklist — every client who owes money, with Send reminder / Copy payment link / Mark paid actions right on the row. Answers exactly what the page should answer instead of feeling like an unstructured grab bag.

### Added — Client Portal
- Documents are previewable read-only (quote, contract with full clause text, invoice) — clients can reference what they signed without being able to edit it.
- Pay Now: a real method-choice modal (Card via Stripe / Zelle with instructions) instead of one blind "pay full balance" button.
- Location card is clickable — opens Apple Maps with the session address.
- Gallery changed from an image-paste field to an actual Pixieset-link card: title, URL, optional preview image, rendered as a link-preview card (the kind you see in iMessage), with an "Open Gallery" button. Matches the reference screenshot you sent.

### Verification
- `npm run build` — compiles, lints, and statically prerenders clean after every item above. Checked four times across this pass at natural checkpoints, not just once at the end.

### Still not done, flagged honestly
- Client-must-pick-one package option groups (radio/checkbox bundles) — noted on the roadmap, not faked.
- "Schedule send" doesn't actually delay anything server-side (there's no server) — it stores the draft and you trigger "Send now" yourself from the Emails page when ready. Said so in the UI.
- Multi-session-per-client is still a known gap from v3 — unchanged this pass.
