# Supabase Readiness Audit

This maps the current in-memory/localStorage state shape (`src/features/eccs/lib/crm.js`) to the
tables you'll actually create in Supabase. It's based on reading the reducer and `getClientBundle`,
not guesswork — every field listed is a real field already in use somewhere in the app.

Status key: 🟢 ready to map as-is · 🟡 needs a field or a decision before migrating · 🔴 needs a real schema change, not just a table

---

## clients
**Frontend entity:** `state.clients[]`
**Risk:** 🟡

| Field | Type | Notes |
|---|---|---|
| id | uuid (pk) | currently `client_xxx` string, fine to keep as text or swap to uuid |
| inquiry_id | uuid (fk → inquiries) | client.inquiryId |
| name, email, phone | text | |
| session_type | text | should become an enum or fk → a session_types lookup once Email Marketing/segmentation lands |
| status | text | `active` / `lost` / `archived` — small enough for a check constraint |
| created_at | timestamptz | currently a display string (`dayStamp()`); **swap to real timestamps before migrating**, see Notes below |

**Notes:** Almost every date field in this app (`createdAt`, `sentAt`, `signedAt`, etc.) is stored as a
pre-formatted display string like `"Jun 22, 2026"`, not an ISO timestamp. This works fine for a
local demo but is the single biggest blocker for Supabase: you cannot sort, filter, or do date math
on a formatted string. **Recommended migration step:** add real `timestamptz` columns and keep the
display string generation (`dayStamp()`/`stamp()`) as a presentation-layer formatter only, applied
when rendering, not when storing.

---

## inquiries
**Frontend entity:** `state.inquiries[]`
**Risk:** 🟢

| Field | Type | Notes |
|---|---|---|
| id | uuid (pk) | |
| client_id | uuid (fk → clients, nullable) | inquiries can exist with `clientId: null` before conversion — keep nullable |
| name, email, phone | text | |
| session_type, package_id, budget_range, desired_date, location, notes | text | package_id should become fk → packages once packages move to a table |
| status | text | `new` / `follow_up` / `converted` / `lost` |
| received_at | timestamptz | |

**Relationship confirmed in code:** a quote can reference `inquiryId`, and the inquiry's
`packageId` is used to pre-select the right package on the generated quote
(`getInquiryPackage`/`buildPackageOptionGroup`). Keep that fk.

---

## quotes
**Frontend entity:** `state.quotes[]`
**Risk:** 🟡

| Field | Type | Notes |
|---|---|---|
| id | uuid (pk) | |
| number | text (unique) | `QUO-1001` — keep a sequence or a `quote_seq` table for number generation |
| client_id | uuid (fk → clients) | **required** — `createQuote` always needs a client |
| inquiry_id | uuid (fk → inquiries, nullable) | manual quotes can have no inquiry |
| event_type, location, notes | text | |
| status | text | `draft` / `sent` / `viewed` / `accepted` / `declined` |
| locked | boolean | see "Document locking" section below — **this field's semantics had a real bug, now fixed, see CHANGELOG** |
| discount, tax, subtotal, optional_total, total | numeric(10,2) | all currently derived client-side in `recalcQuote` — fine to keep as generated/computed columns or recompute in an edge function on write |
| expiration_date | date | |
| created_at, sent_at, viewed_at, accepted_at, declined_at | timestamptz | currently display strings, see clients note |

## quote_items (quote_items / quote line items)
**Frontend entity:** `quote.lineItems[]`
**Risk:** 🟢

| Field | Type | Notes |
|---|---|---|
| id | uuid (pk) | |
| quote_id | uuid (fk → quotes) | |
| name, description | text | |
| quantity | integer | |
| unit_price | numeric(10,2) | |
| optional | boolean | "add-on, not required" |
| selected | boolean | only meaningful when optional=true |

## quote_options / quote_option_groups
**Frontend entity:** `quote.optionGroups[]` → each group has `options[]`
**Risk:** 🟡 — this is the one part of the quote model that's genuinely more complex than a flat
line-items table. Recommend **two tables**:

`quote_option_groups`: id, quote_id, title, description, selection_mode (`single`/`multi`), required (bool)
`quote_option_group_items`: id, group_id (fk), package_id (nullable fk → packages), name, description, quantity, unit_price, is_selected (bool)

This is exactly what backs the client-facing "choose your package" picker on the quote — don't
collapse it into quote_items, the selection behavior needs the group structure.

## quote_add_ons
**Frontend entity:** `state.addons[]` (the catalog, not per-quote) — distinct from the per-quote optional line items above.
**Risk:** 🟢

| Field | Type | Notes |
|---|---|---|
| id | uuid (pk) | |
| name, description | text | |
| price | numeric(10,2) | |
| optional | boolean | |

---

## contracts
**Frontend entity:** `state.contracts[]`
**Risk:** 🟡 (locking gap — fixed in this pass, see CHANGELOG)

| Field | Type | Notes |
|---|---|---|
| id | uuid (pk) | |
| number | text (unique) | |
| client_id | uuid (fk → clients) | |
| quote_id | uuid (fk → quotes) | **required** — `create_contract` refuses to run without an accepted quote |
| template_name | text | currently a free string from a fixed list; fine as text + check constraint, or fk → contract_templates once those move server-side |
| status | text | `draft` / `sent` / `signed` |
| locked | boolean | **added meaningful behavior in this pass** — was previously unused for contracts; see CHANGELOG |
| signer_name | text | |
| created_at, sent_at, signed_at | timestamptz | |

## contract_sections (clauses)
**Frontend entity:** `contract.clauses[]`
**Risk:** 🟢

| Field | Type | Notes |
|---|---|---|
| id | uuid (pk) | |
| contract_id | uuid (fk → contracts) | |
| sort_order | integer | currently implicit (array order) — make it explicit on migration |
| title, body | text | |

## contract_signatures
**Frontend entity:** not a separate entity yet — currently just `contract.signerName` + `contract.signedAt` on the contract row itself.
**Risk:** 🔴 — this is fine for "one signature per contract" but the deliverable list in the original
task asks for a `contract_signatures` table, implying multi-party signature support (e.g.
photographer + client both signing, or a witness). **Recommend:** keep `signed_at`/`signer_name` on
`contracts` for the current single-signer flow, and only split into a real `contract_signatures`
table when/if a second signing party is actually needed. Don't build it speculatively — there's no
field in the current app modeling a second signer.

---

## invoices
**Frontend entity:** `state.invoices[]`
**Risk:** 🟢 — this is the best-modeled entity in the app already.

| Field | Type | Notes |
|---|---|---|
| id | uuid (pk) | |
| number | text (unique) | |
| kind | text | `deposit` / `final` / `full` |
| client_id | uuid (fk → clients) | |
| quote_id | uuid (fk → quotes) | |
| contract_id | uuid (fk → contracts, nullable) | |
| session_id | uuid (fk → sessions, nullable) | |
| status | text | `draft` / `sent` / `partially_paid` / `paid` |
| locked | boolean | already correctly enforced both in the UI and in the reducer (line-item mutation actions already check `status !== "paid" && !locked` before allowing edits) |
| subtotal, tax, total, amount_paid, balance_due | numeric(10,2) | |
| due_date | date | |
| created_at, sent_at | timestamptz | |

## invoice_items
**Frontend entity:** `invoice.lineItems[]`
**Risk:** 🟢 — same shape as quote_items.

---

## payments
**Frontend entity:** `state.payments[]`
**Risk:** 🟢

| Field | Type | Notes |
|---|---|---|
| id | uuid (pk) | |
| invoice_id | uuid (fk → invoices) | |
| client_id | uuid (fk → clients) | |
| amount | numeric(10,2) | |
| method | text | currently demo-only ("Stripe checkout simulation") — real Stripe/Zelle reconciliation is a backend phase, not a frontend change |
| paid_at | timestamptz | |
| refunded_amount, refund_note | numeric / text | `refundPayment` action already exists |

---

## projects
**Frontend entity:** 🔴 **there is no `projects` table-equivalent in the current state.** "Project"
is a *derived* concept (`deriveProjectStatus`) computed from whether quote+contract+payment all
exist — there's no `state.projects[]` array, no `project_id` anywhere. The "Project Folders" page is
really just "the client list, filtered/grouped." **Decision needed before migrating:** either (a)
keep projects as a derived view (a Postgres view joining clients+quotes+contracts+invoices+sessions
by `booking.isBooked`), which matches current behavior exactly and needs zero new writes, or
(b) materialize a real `projects` table with `created_at` once you want project-level data that
doesn't fit anywhere else (internal notes, a project-specific status separate from booking status,
etc). Recommend (a) for the first migration — don't invent a table for a concept the frontend
doesn't actually have yet.

---

## sessions
**Frontend entity:** `state.sessions[]`
**Risk:** 🔴 — **this is the most important schema decision in the whole migration.**

Per the existing README (this was already known and documented, not something I'm flagging new):
> "One session per client in the data model — `state.sessions` is keyed by `clientId` but the
> selector takes the first match. Repeat clients with multiple sessions need a real schema change."

Current fields: id, client_id, session_date, session_time, location_name, status
(`pending`/`scheduled`/`completed`), gallery_status, prep_status, quote_id, contract_id,
invoice_ids[], portal_access_sent_at, availability_email_sent_at, calendar_invite_sent_at,
project_created_at.

**Recommendation:** if repeat clients (second shoot, anniversary session, etc.) are a real business
case for EC Creative Studios — and given the studio also does weddings/maternity/family work, that's
likely — do **not** carry the `clientId`-as-unique-key assumption into Supabase. Model
`sessions.client_id` as a normal fk (one-to-many from day one) even though the current frontend
selector only ever reads the first match. Fixing the selector to actually support multiple sessions
is real app work (it touches Calendar, Portal, Manual Override, and the booking-gate logic in
`ProjectWorkspaceCard`) — flagging it here as the thing to schedule, not silently fixing it as part
of this hardening pass, since it changes user-visible behavior.

## calendar_availability
**Frontend entity:** `state.availability[]` (array of `{ date, times[] }`)
**Risk:** 🟢 — straightforward `(date, time)` pair table, already effectively normalized by the
`add_availability_slot` / `remove_availability_slot` actions operating on individual slots.

---

## locations
**Frontend entity:** `state.locations[]`
**Risk:** 🟢 — plain CRUD list already (`addLocation`/`updateLocation`/`removeLocation` actions exist).

## portal_pages / portal_assets
**Frontend entity:** `state.portalProfiles[]` (one per client)
**Risk:** 🟡 — currently one wide row per client (`sessionVision`, `notes`, `propList`,
`visionBoardImages[]`, `galleryImages[]`, `printStoreLink`, `planPrepSteps[]`, date/time/location
overrides). Recommend splitting on migration:
- `portal_profiles` — the scalar fields (vision text, notes, print store link, overrides)
- `portal_assets` — one row per image (`profile_id`, `kind` = `vision_board`/`gallery`, `url`,
  `sort_order`) instead of two JSON arrays. Cleaner for storage-bucket URLs later.

## portal_messages
**Frontend entity:** `state.messages[]` (already has `clientId`, `from`, `text`, `createdAt`, `readAt`)
**Risk:** 🟢 — maps directly, no changes needed.

---

## activity_events
**Frontend entity:** `state.activity[]`
**Risk:** 🟢 — every entry already comes from real reducer actions via `withActivity()`, not static
mock data (confirmed by reading the reducer — every mutating case that should log activity calls
`withActivity(nextState, clientName, text)`). This answers one of the audit questions directly:
**yes, activity records are generated from real actions**, not placeholder data.

## notification_preferences / device_subscriptions
**Frontend entity:** `state.notificationSettings` (+ `.devices[]`)
**Risk:** 🟢 — already shaped correctly for `notification_preferences` (one row per user/studio) and
`device_subscriptions` (one row per registered browser/device, with `endpoint`, `platform`, `mode`).
The push infrastructure is already honestly built as backend-ready-but-not-real: `/api/push/subscribe`
and `/api/push/test` exist as placeholder routes and the code says so in Settings. No frontend
changes needed here — the remaining work is 100% backend (VAPID keys, an Edge Function that calls
`web-push`, and wiring those two routes to actually persist to `device_subscriptions` and send).

---

## email_templates / quote_templates / contract_templates
**Frontend entity:** `state.emailTemplates[]`, `state.quoteTemplates[]` (currently just strings!),
`state.contractTemplates[]`
**Risk:** 🟡 — `quoteTemplates` is currently just an array of label strings
(`["Blank Quote", "Maternity Template", ...]`) with no actual template content behind them — the
Templates page for quotes is a thinner placeholder than contracts/invoices/emails. Decide whether to
build out real quote template content before or after the Supabase migration; either way the table
shape is simple (`id, name, body/structure jsonb, created_at`).

## portal_defaults
**Frontend entity:** `state.portalDefaults[]` (default plan/prep step list)
**Risk:** 🟢

## workflow_rules
**Frontend entity:** 🔴 **does not exist yet.** The closest things are `socialRules[]` (IG
comment-to-DM keyword rules, explicitly mock per the Social Messaging page copy) and the milestone
email triggers, which are hardcoded in the booking-gate logic, not a configurable rules table. Don't
build `workflow_rules` speculatively — wait until there's a real automation feature to back it.

---

## Document locking — current state after this pass

| Document | Default lock | Hard lock | Unlock path | Status before this pass |
|---|---|---|---|---|
| Quote | sent/viewed | accepted/declined | "Unlock edit" | 🔴 broken — button set `locked:false` but the lock check still matched on status, so it had no effect. **Fixed.** |
| Contract | sent | signed | "Unlock edit" | 🔴 missing entirely — no lock concept existed; template + every clause field was editable after signing. **Fixed.** |
| Invoice | sent | paid | "Unlock edit" | 🟢 already worked correctly |

See `CHANGELOG_ENGINEERING_HARDENING.md` for the exact diffs.

---

## Suggested table list (in one place)

clients, inquiries, quotes, quote_items, quote_option_groups, quote_option_group_items, quote_add_ons,
contracts, contract_sections, contracts (signature fields inline — no separate table yet), invoices,
invoice_items, payments, sessions, calendar_availability, locations, portal_profiles, portal_assets,
portal_messages, activity_events, notification_preferences, device_subscriptions, email_templates,
quote_templates, contract_templates, portal_defaults.

Not yet justified by the current frontend: `projects` (use a view instead), `contract_signatures`
(single-signer for now), `workflow_rules` (no automation feature exists yet).

## Suggested migration order

1. **clients, inquiries** — everything else fans out from these, and the fk direction is already
   one-way (inquiry → client, never the reverse loop).
2. **quotes, quote_items, quote_option_groups, quote_option_group_items, quote_add_ons** — next
   because contracts hard-depend on an accepted quote existing.
3. **contracts, contract_sections** — depends on (2).
4. **invoices, invoice_items, payments** — depends on (2) and (3).
5. **sessions, calendar_availability, locations** — can move in parallel with (3)/(4); just don't
   forget the one-to-many decision above before writing the fk.
6. **portal_profiles, portal_assets, portal_messages** — depends on (1) and benefits from (5) for
   session-date display.
7. **activity_events, notification_preferences, device_subscriptions** — last, since these are
   read-heavy/audit-trail tables that can backfill from existing data once everything else is live.
8. **email_templates, quote_templates, contract_templates, portal_defaults** — genuinely independent,
   can move anytime, including first if you want template content editable in Supabase before
   touching client data at all.

## Remaining risks for the Supabase phase specifically

- **Display-string dates everywhere.** Biggest real blocker. Needs a decision: backfill real
  timestamps now, or do it during the migration script. Either way, don't design columns around the
  current `"Jun 22, 2026"` format.
- **`nextId()` uses `Math.random().toString(36)`** for client-generated IDs (`quote_xxx`, `inv_xxx`,
  etc). Fine for a local demo; once Supabase issues real `uuid` primary keys this goes away entirely,
  but until then there's a theoretical (very low-probability) collision risk worth knowing about.
- **Sessions one-per-client assumption** (above) — the single highest-impact schema decision in this
  migration, already documented in the README, restated here so it doesn't get missed during table
  design.
- **No auth yet at all** — every action in the reducer trusts the caller completely. RLS policies
  will need a real concept of "studio owner" vs "client" as separate roles; right now `app` is just a
  local UI toggle (`admin` vs `client`), not an auth boundary. Don't treat the existence of `ClientApp`
  vs `AdminApp` as if it implies any access control — it implies none today.
