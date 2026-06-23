# EC Creative Studios CRM v7.1 Cleanup

Focused polish pass based on the follow-up notes.

## Document controls

- Added document delete actions for quotes, contracts, and invoices.
- Added visible Delete buttons on opened quote, contract, and invoice records.
- Quote deletion clears quote references from connected sessions.
- Contract deletion clears contract references from connected sessions.
- Invoice deletion removes related payments and clears invoice references from connected sessions.

## Sent document locking

- Sent quotes now lock editing by setting `locked: true` when sent.
- Locked/sent quotes display in preview mode instead of the builder workspace.
- Sent invoices already locked, now display as a preview-mode record instead of editable line items.
- Locked quote and invoice headers show a locked badge.
- Unpaid locked quote/invoice records can be manually unlocked for correction.
- Paid invoices remain locked.

## Calendar cleanup

- Today now opens into a dedicated Today calendar agenda view.
- Week view now expands downward into day columns with time-sorted booked events and open slots.
- Month view still shows booked sessions and open slot counts.
- Selected day side panel still supports editing availability.

## Settings cleanup

- Settings was reorganized into tabs:
  - Email
  - Locations
  - Templates
  - Portal
- Email templates are collapsed into editable detail rows.
- Merge fields moved into a side reference card.
- Locations and calendar connections are grouped together cleanly.
- Template lists and portal defaults are separated from email/location controls.

## Verification

- Ran `npm install --no-audit --no-fund`.
- Ran `NEXT_TELEMETRY_DISABLED=1 npm run build`.
- Build completed successfully. The container command timed out after build output was produced, but the `.next` build artifacts and route summary were generated successfully.
