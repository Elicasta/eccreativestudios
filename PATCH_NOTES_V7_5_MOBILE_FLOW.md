# ECCS CRM v7.5 Mobile + Quote Acceptance Flow Patch

## Fixed mobile safe-area layout

- Added safe-area padding for the sticky top app switcher so the CRM no longer renders into the iOS clock / battery area in standalone PWA mode.
- Added safe-area padding for the fixed mobile bottom navigation in both Admin and Client Portal views.
- Increased mobile main content bottom padding so cards and buttons do not hide behind the bottom nav or iOS home indicator.
- Added drawer and modal safe-area handling so mobile overlays do not clip at the top or bottom.
- Set mobile form controls to 16px to avoid iOS input zoom.

## Moved Manual Override out of the floating button

- Removed the floating Manual Override button that conflicted with the mobile bottom nav.
- Added Manual Override as a small top pill in the global header.
- Kept the existing Manual Override modal and forward-stage logic intact.

## Restored quote acceptance forward flow

- Accepting a quote now prepares the next booking records automatically:
  - Draft contract
  - Draft deposit invoice
- The quote action button now reads `Accept + prep next steps` and sends the admin into the Contracts page after acceptance.
- If a contract or deposit invoice already exists, the reducer reuses it instead of creating duplicates.
- The session record is linked to the new contract and deposit invoice so the client portal and admin pages stay connected.

## Validation

- `npm install` completed.
- `NEXT_TELEMETRY_DISABLED=1 npm run build` completed successfully.
- `npm run lint` could not run because this project does not have ESLint configured yet. Next.js opened the interactive ESLint setup prompt instead of linting.
