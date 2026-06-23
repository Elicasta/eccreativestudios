# EC Creative Studios CRM v7 Patch Notes

Source: CRM Version 7 Feedback Guide + Update Transcript.

## Validation

- Installed dependencies with `npm install`.
- Ran `npm run build` successfully.
- Next.js production build completed and generated all static pages.

## Priority 1: Navigation and Search

- Added real in-app Back button behavior with view history.
- Back button returns to the previous CRM page/view instead of a hardcoded destination.
- Global search now looks across:
  - clients
  - quotes
  - invoices
  - inquiries
  - sessions
- Global search results now appear directly below the search input.
- Search results can route into the matching record area and select the related client.
- Switch Client pill now reacts to the active global search and shows likely matching clients.
- Dashboard hero becomes client-focused when a client is selected.
- Dashboard returns to admin-first overview when the selected client is cleared.

## Priority 2: Client-Specific Views

- Selected client view no longer keeps the left client directory visible.
- Added a clear All Clients button.
- Client detail page now focuses on the selected client record.
- Renamed Advance Booking language to Projects.
- Portal Access card now routes to the portal editor instead of email logs.
- Client cards route to filtered workflow sections using the active selected client.

## Priority 3: Inquiries

- Renamed Approved language to In Progress in the inquiry stats.
- Added Follow-Up tab logic shell for inquiries needing follow-up.
- Inquiry cards now show:
  - session type
  - preferred date
  - location
  - received date
- Added First-time Client and Returning Client badges.
- Reframed Package Requested language as an admin-side quote package default.
- Preserved session-type filtering.

## Priority 4: Quote Builder

- Renamed Quote Workspace to Inquiry Reference.
- Renamed Session Details to Quote Details.
- Changed Session Date field to Quote Date.
- Added date-picker behavior for Expiration Date.
- Added Choose Template section with blank quote and package template starters.
- Renamed Package Decision to Packages.
- Added badge field support for package options.
- Package preview now supports horizontal desktop card layout.
- Add-on/package selectors now use a checkbox-style visual instead of only round selection.
- Accepted quote state now changes the Accept button into an Accepted state and disables Decline.
- Discount no longer appears in quote preview when it is zero.
- Money fields now read more clearly with Unit Price ($) and Price ($).

## Priority 5: Contract Editor

- Contract template is now a dropdown.
- Added template options:
  - Standard Photography Agreement
  - Wedding Agreement
  - Branding Agreement
  - Event Agreement
  - Milestone Package Agreement
- Added Add Section control.
- Clause titles are editable.
- Clauses can be removed.
- Signature label now clearly describes the real client signature box target.
- Signed contract still routes to invoice as the next step.

## Priority 6: Invoice, Payment, and Session Logic

- Deposit invoice amount changed from 40% to 50% of accepted quote total.
- Session scheduling now syncs the selected date onto unpaid final invoices.
- Final invoice internal note describes due-before/on-session-date behavior and 7-day reminder intent.
- Money labels clarified in invoice/quote areas.

## Priority 7: Projects and Calendar

- Project workspace now includes manual date, time, and location override controls.
- Added date picker.
- Added time picker.
- Added location/address field.
- Added Open in Maps link from project location.
- Manual override syncs project/session/portal state through the existing schedule action.
- Calendar keeps week, month, list modes.
- Settings now includes future Google Calendar and Apple Calendar connection cards.

## Priority 8: Portal and Messaging

- Portal editor prop list now supports cleaner four-column layout on wide screens.
- Added Print Store Link field separate from Gallery Link.
- Portal editor now shows a Print Your Album / shop gallery card when a store link exists.
- Activity page now has filters:
  - All Activity
  - Client Activity
  - Messages
- Client messages can now surface in Activity under Messages.

## Priority 9: Settings

- Replaced Settings placeholder with a real Settings page shell.
- Added Settings sections for:
  - Email Templates
  - Locations
  - Calendar Connections
  - Quote Templates
  - Contract Templates
  - Add-ons
  - Portal Defaults
- Added editable email template rows for:
  - Send portal access
  - Send date selection
  - Send calendar invite
  - Booking reminder
  - Deliver gallery
  - Send quote
  - Send invoice
  - Send contract
  - Payment reminder
- Added merge field chips:
  - {{client_name}}
  - {{session_type}}
  - {{quote_total}}
  - {{quote_number}}
  - {{invoice_number}}
  - {{invoice_total}}
  - {{contract_title}}
  - {{portal_link}}
  - {{session_date}}
  - {{session_time}}
  - {{location}}
  - {{business_name}}

## Data Updates

- Storage key moved to `eccs-crm-v7` so the browser does not reuse stale v6 local state.
- Demo locations were adjusted toward the EC Creative Studios Miami workflow:
  - Mint Room Studios
  - Vizcaya
  - Casa Terra
- Default city/location copy now uses Miami, FL instead of Dallas/Fort Worth where possible.

## Known Follow-Up Work

The app is still a prototype running on local state. These items are now represented in UI or workflow logic, but still need persistence/auth/backend work later:

- real Supabase schema and row-level security
- real email template persistence
- real email open tracking pixel/events
- real client-side signature pad capture
- real Google/Apple Calendar integrations
- real global saved-location CRUD
- full invoice lock/unlock enforcement after sent/paid states
- full client portal messaging persistence
