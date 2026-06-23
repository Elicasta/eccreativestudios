# EC Creative Studios CRM v6 Patch Notes

## Inquiry-driven workflow

- Inquiries are now clickable records.
- Clicking an inquiry opens the client-filled inquiry detail modal.
- Inquiry detail now shows name, email, phone, session type, budget, preferred date, location, package requested, and notes.
- Admin can change the requested package directly from the inquiry detail.
- Added **Approve + draft quote** workflow.
- Starting a quote from an inquiry now creates or updates the client record, carries over the package, and opens Quotes without duplicating existing quotes.

## Package-to-quote defaults

- Package data is now richer and session-aware.
- Inquiry package choice is stored as `packageId`.
- New quotes default to the package selected in the inquiry.
- Quote package choice groups now filter toward the inquiry/session type first.
- Quote notes now pull from inquiry notes, budget, preferred date, and default package.
- Quote email copy now changes based on session type/package context, especially maternity, newborn, family, and wedding.

## Clients contact directory

- Clients page now opens to a full contact-directory view when no client is selected.
- Directory includes Clients and open Leads in one mobile-style contact list.
- Search supports name, email, and session type.
- Clicking a client opens the client record.
- Clicking a lead opens the inquiry form modal.

## Quote workspace cleanup

- Quote editor now has a clearer source card showing the inquiry/package context.
- The quote page now shows the client inquiry notes inside the quote editor.
- Package section copy was softened and organized around the package decision flow.

## Gallery preview

- Added `/api/link-preview` route for Open Graph previews.
- Gallery preview cards now try to pull `og:image`, `og:title`, and Twitter preview image from the gallery URL.
- Admin and client portal share a new `LinkPreviewCard` component.
- If Pixieset exposes an Open Graph image, the card uses it without requiring a manual preview URL.
- If no image is found, the branded fallback still displays cleanly.

## Templates upgrade

- Template records now include audience, trigger, session type, description, status, settings, body, and modules.
- Added stronger seed templates for contracts, invoices, quotes, questionnaires, and emails.
- Added richer module presets for:
  - contracts
  - invoices
  - quotes
  - questionnaires
  - emails
- Template modules are editable, insertable, removable, and can be marked required/optional.
- Template editor now has a live preview panel.
- Template dashboard now uses cards instead of a weak row list.

## Quick create

- New client and inquiry quick-create now supports requested package selection.
- Package defaults can still auto-match from session type when no package is selected.

## Validation

- Ran `npm install`.
- Ran `npm run build`.
- Production build passed.
