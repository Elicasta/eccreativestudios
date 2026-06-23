# ECCS CRM Prototype v5 Patch Notes

## What changed

### Quote package choice boxes
- Added real quote option groups for package selection.
- New quotes now start with a required "choose your photography experience" package group instead of pretending packages are only flat line items.
- Admin can add pick-one or pick-many groups, edit options, edit descriptions, remove options, and select the option that affects the quote total.
- Client quote preview now shows package boxes and lets the client choose their package before accepting.
- Quote totals now calculate from included line items, selected optional add-ons, and selected package options.

### Topbar add button is functional
- The global plus button now opens a page-aware quick-create modal.
- It can create clients, inquiries, quotes, invoices, email logs, campaigns, social keyword rules, add-ons, calendar slots, templates, and forms.
- Quotes and invoices ask for a client first when needed.
- Marketing and social quick-adds now create real local records shown on those pages.

### Client switcher search
- The client switcher dropdown now has a search bar.
- Search works by name, email, and session type.

### Clients page rebuilt for larger lists
- Added a dedicated search bar inside Clients so mobile users are not dependent on the hidden desktop topbar search.
- Client list now starts at 12 and loads in larger batches for 100+ client workflows.
- Added a list-only action to clear the selected client and inspect the client database before opening details.

### Template builder upgrade
- Added template modules for contracts, invoices, quotes, questionnaires, and emails.
- Modules can be inserted into the template body and tracked as required or optional sections.
- Added more merge fields: client email, balance due, invoice number, etc.
- Topbar quick-add can create templates and open the template editor.
- Topbar quick-add can create a new form and open the form builder.

### Payments safety controls
- Payment receipts now have Refund payment and Delete payment actions.
- Refunds create a negative ledger row, mark the original payment refunded, and rebalance the invoice.
- Deleting a payment removes the ledger entry and rebalances the invoice.
- If payment was what made the project officially booked, refund/delete removes the project-created state and moves the session back to payment pending.

### Pixieset gallery fallback preview
- Gallery cards no longer show a blank empty image area when Pixieset does not provide a preview image.
- If no preview image is uploaded, the card renders a branded fallback with the gallery title and a clear note that the link still opens normally.

## Validation
- Ran `npm install`.
- Ran `npm run build` successfully.
