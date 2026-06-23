# EC Creative Studios Client Experience OS

A Next.js admin CRM + client portal prototype, running on a local in-memory reducer (no Supabase yet). State persists to `localStorage` so a refresh doesn't wipe your demo data.

## What's actually in this build

This list is checked against the running code, not aspirational. If it's not wired to a real action below, it's marked as such.

**Admin / CRM**
- Dashboard, Pipeline (kanban by stage), Inquiries, Clients, Projects (folder-per-client, gated booking workspace)
- Quotes, Contracts, Invoices, Payments — all backed by real reducer actions, not status text
- Sessions, Calendar (month grid + agenda, pulled from real session dates)
- Portal Editor — session vision/notes/prop list, date/time/location override, **vision board images (paste URL or upload from device) and gallery images**, gated until the client is actually booked
- Emails (milestone triggers: portal access, date selection, calendar invite, not-booked reminder) + Activity log
- Email Marketing (segments computed from real client tags), Social Messaging (IG DM keyword rules — mock, not connected), Contact Forms (field builder), Templates (Contracts/Invoices/Quotes/Questionnaires/Emails, with merge-field insertion)
- Settings / Branding / Team / Workflows — intentionally thin placeholders, not real features
- Manual Override (floating button, bottom right) — fast-forwards the selected client to any pipeline stage by creating the real quote/contract/invoice/session records needed to get there, not by faking a status. Also handles Lost and Archived.
- Mobile: drawer + bottom tab nav

**Client Portal**
- Overview, Documents (with inline accept/sign/pay actions), Session Details, Vision Board (slideshow-first, tap for Pinterest-style grid, renders real images from the Portal Editor), Plan & Prep, Messages, Payments, Gallery (locked until the studio delivers it)
- Mobile: drawer + bottom tab nav

## What's still not real

- No Supabase, no auth, no Stripe, no actual email sending
- Email Marketing / Social Messaging / Contact Forms have no backend — they're the shape of the feature, not the wiring (each page says so where it matters)
- One session per client in the data model — `state.sessions` is keyed by `clientId` but the selector takes the first match. Repeat clients with multiple sessions need a real schema change, not just a UI change.
- Manual Override moves a client forward only. It won't unsign a contract or unpay an invoice — edit those records directly if you need to back up.

## Structure

```txt
app/
  layout.jsx
  page.jsx

src/features/eccs/
  ECCSPrototype.jsx        — root state (useReducer + localStorage), renders TopSwitcher + ManualOverride + the active app
  admin/AdminApp.jsx       — every admin page
  client/ClientApp.jsx     — every client portal page
  components/
    ManualOverride.jsx     — dispatches real actions against the selected client, not a fake stage index
    TopSwitcher.jsx
    ui.jsx                 — Pill, Card, Avatar, StatusLight, EmptyState, etc.
  lib/
    brand.js               — color tokens
    crm.js                 — state shape, getClientBundle selector, full reducer, derivePipelineStage

legacy/
  eccs-prototype.original.jsx   — the original single-file artifact this was split from
```

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

`npm run build` has been verified to compile and statically prerender cleanly.

## Next lake to boil

1. Multi-session-per-client (real "projects" entity, not session-as-project)
2. Map the mock data to Supabase tables
3. Wire Stripe into the invoice/payment actions
4. Real Resend integration for Email Marketing and the milestone Emails page

## v5 Notes

This build adds real quote package choice groups, page-aware quick-create actions, searchable client switching, richer template modules, payment refund/delete logic, and a non-blank Pixieset gallery fallback card.

Run:

```bash
npm install
npm run dev
```

Production build validated with:

```bash
npm run build
```
