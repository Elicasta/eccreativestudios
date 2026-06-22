# EC Creative Studios Client Experience OS

This is the first refactor pass of the original one-file JSX prototype into a Next.js app structure.

## What stayed intact

All current prototype areas are still present:

- Admin / CRM shell
- Dashboard
- Notifications
- Inquiries
- Clients
- Projects
- Portal Editor
- Sessions
- Calendar
- Quotes
- Contracts
- Invoices
- Payments
- Email logs
- Email marketing
- Social messaging
- Contact forms
- Workflows
- Templates
- Client portal
- Client overview
- Session details
- Vision board
- Documents
- Messages
- Payments
- Plan & prep
- Gallery
- Manual stage override

## What changed in this pass

The old single JSX file was split into focused modules:

```txt
app/
  layout.jsx
  page.jsx

src/features/eccs/
  ECCSPrototype.jsx
  admin/AdminApp.jsx
  client/ClientApp.jsx
  components/
    DocModal.jsx
    ManualOverride.jsx
    TopSwitcher.jsx
    ui.jsx
  lib/
    brand.js
    mock-data.js
    pipeline.js

legacy/
  eccs-prototype.original.jsx
```

## Small behavior fix included

When a client chooses a date slot from the portal, the selected date/time is now saved into portal state before the pipeline moves to `Booked`.

Previously, the button moved the project to booked but kept showing the old project date.

## Run locally

```bash
npm install
npm run dev
```

Then open:

```txt
http://localhost:3000
```

## Next lake to boil

Recommended next step:

1. Move the shared stage transitions into a guarded action layer.
2. Add a `TBD` booking state for clients who are approved but not date-ready.
3. Split AdminApp into route-level feature modules.
4. Map the current mock data to Supabase tables.
