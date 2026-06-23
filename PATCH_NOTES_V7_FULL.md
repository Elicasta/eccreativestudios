# EC Creative Studios CRM v7 Full Site Update

This version implements the Version 7 feedback guide as the current frontend site version, not a light patch.

## Navigation and search
- Added real app-level Back behavior across CRM pages.
- Improved global search for clients, quote numbers, invoice numbers, inquiries, and sessions.
- Search results render directly below the global search bar.
- Switch Client remains separate, but reacts to typed search text and shows matching client names.
- Dashboard becomes client-first when a client is selected and returns to admin overview when cleared.

## Dashboard
- Client-focused hero state when a client is selected.
- Client-specific next action card.
- Client messages card added to the dashboard.
- Client list keeps arrow behavior for opening the full client page.
- Search no longer depends on low-page results placement.

## Client records
- Selected client page now opens as a focused client record.
- Added filtered client record panels for quotes, contracts, and invoices.
- Quote, contract, invoice, portal, project, payment/calendar, and message actions are client-aware.
- Original inquiry opens in a popup from the client record.
- Portal access displays sent/not sent, portal URL, copy link, and unavailable state.
- Advanced Booking language is treated as Projects.

## Inquiries
- Inquiry form language is aligned around session type, preferred date, location, and inquiry notes.
- New/returning client badges are shown.
- Approved language is shifted toward In Progress.
- Follow-up tab/state shell is in place for stale inquiries.
- Converted logic is kept distinct from returning-client flow at the UI level.

## Quotes
- Quote Workspace is renamed to Inquiry Reference.
- Session Details is renamed to Quote Details.
- Template starter options are available.
- Packages section is clearer and uses pick-one/pick-many modes.
- Add-ons use checkbox behavior.
- Package badges are editable.
- Desktop quote package cards display horizontally.
- Client-facing quote state supports accepted state and next contract action.
- Rich description editor now shows formatted bold, italic, bullets, and numbered lists without exposing markdown syntax in the editor.
- Preview renders rich formatting.

## Contracts
- Contract template selector is a dropdown.
- Contract status badge is visible.
- Contract editor supports add/remove/edit sections and clauses.
- Client signature box is represented in the contract document area.
- Signed contract state opens invoice next action.

## Invoices and payments
- Deposit invoice creation uses 50% of the accepted quote.
- Final invoice is tied to the session date when scheduled.
- Invoice sidebar records are clickable.
- Sent invoices lock by default and can be manually unlocked.
- Paid invoices stay locked.
- Money fields are labeled as unit price and formatted currency in previews/totals.
- Rush Delivery can be added to final invoices.
- Payment application updates invoice status and project/session readiness.

## Projects and sessions
- Project workspace supports date picker, time picker, and location/address override.
- Session records are editable directly.
- Sessions link to quote, contract, invoice, project, and portal.
- Internal Notes label replaces client-inquiry note language.
- Manual date/time/location changes sync into portal and final invoice due date.
- Open in Maps link is available when a location exists.
- Props layout flows cleanly across responsive columns.

## Calendar
- Availability editor shows Last edited timestamp.
- Month view is a real grid with booked client/session names and open slot counts.
- Google Calendar and Apple Calendar connection toggles live in Settings as frontend placeholders.

## Portal
- Preview image field and uploaded/URL preview image flow remain visible.
- Editable Plan & Prep page added for custom package steps.
- Gallery Link and Print Store Link are separate.
- Client portal displays print/store CTA after gallery delivery.

## Client messaging
- Added Client Messages page inside admin.
- Conversation list shows client name, unread/new dot, message count, latest preview, and timestamp.
- Admin can reply from the CRM.
- Client portal messages still work and connect to the same thread.
- Activity page includes Messages filter.

## Settings
- Email Templates editor added with subject/body fields.
- Merge fields displayed globally.
- Saved locations/studios are editable.
- Calendar connection toggles added.
- Quote templates, contract templates, add-ons, and portal defaults sections added.

## Notes
- This remains a frontend/prototype implementation using local browser storage.
- Real backend persistence, OAuth calendar sync, email open tracking pixels, server-side reminders, and legal signature storage require the Supabase/Auth/API phase.
