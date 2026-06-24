# EC Creative Studios CRM Supabase Readiness Audit

## Audit scope

This pass reviewed the current local-state CRM structure before Supabase wiring. The app is still a frontend prototype, but the modules now represent real CRM domains: inquiries, clients, quotes, contracts, invoices, payments, sessions, portal, messages, activity, settings, templates, PWA, and notification readiness.

Do not create migrations from this file blindly. Use it as the handoff map for the first schema pass.

## Current architecture summary

| Area | Current shape | Backend-readiness note |
|---|---|---|
| State source | `useReducer` in `ECCSPrototype.jsx` with localStorage key `eccs-crm-v7` | Can map to tables, but reducer actions need to become service calls or server actions later. |
| Business logic | Mostly in `src/features/eccs/lib/crm.js` | Good single source for workflow rules, but file is too large. Extract into domain modules before major backend work. |
| UI | Mostly `AdminApp.jsx` and `ClientApp.jsx` | Works, but `AdminApp.jsx` is overgrown. Split after schema is stable, not before. |
| Persistence | localStorage only | Added safer write guard. Needs Supabase repository layer. |
| Notifications | Local browser/PWA notifications with service worker shell | Honest prototype. No real server push until device subscriptions and VAPID/edge functions exist. |

## Entity mapping

| Current frontend entity | Recommended Supabase table | Needed fields | Relationships | Missing fields before production | Risk | Notes |
|---|---|---|---|---|---|---|
| `clients` | `clients` | `id`, `studio_id`, `inquiry_id`, `name`, `email`, `phone`, `session_type`, `package_id`, `status`, `created_at`, `updated_at` | belongs to inquiry, package; has many quotes, contracts, invoices, sessions, messages | normalized address, tags, source, last_contacted_at, archived_at | Medium | Core anchor record. Must be tenant-scoped. |
| `inquiries` | `inquiries` | `id`, `studio_id`, `client_id`, `name`, `email`, `phone`, `session_type`, `package_id`, `location`, `preferred_date`, `status`, `notes`, `created_at` | optionally creates client | lead source, consent fields, UTM/source metadata, form_id | Medium | Inquiry can exist without client. Client should point back after approval. |
| `quotes` | `quotes` | `id`, `studio_id`, `client_id`, `inquiry_id`, `project_id`, `number`, `event_type`, `status`, `subtotal`, `discount`, `tax`, `total`, `locked`, timestamps | belongs to client/inquiry/project; has quote items/options; can create contract | version, accepted_by, accepted_ip, expires_at, public_token | High | Accepted quotes now hard-lock. Sent quotes can be manually unlocked if unpaid/unaccepted. |
| `quote.lineItems` | `quote_items` | `id`, `quote_id`, `name`, `description`, `quantity`, `unit_price`, `optional`, `selected`, `sort_order` | belongs to quote | taxable, source_template_id | Medium | Works as direct child rows. |
| `quote.optionGroups` | `quote_option_groups` | `id`, `quote_id`, `title`, `description`, `selection_mode`, `required`, `sort_order` | belongs to quote; has options | min/max selections | Medium | Required for package choice UX. |
| `quote.optionGroups.options` | `quote_options` | `id`, `group_id`, `package_id`, `name`, `description`, `quantity`, `unit_price`, `sort_order` | belongs to option group and optional package | selected state should be join row or array | Medium | Store selected choices either in `quote_option_selections` or JSON column. |
| `addons` | `quote_add_ons` or `add_ons` | `id`, `studio_id`, `name`, `description`, `price`, `optional`, `active` | used by quotes/invoices | category, tax behavior | Low | Could be reused catalog table. |
| `contracts` | `contracts` | `id`, `studio_id`, `client_id`, `quote_id`, `project_id`, `number`, `template_name`, `status`, `locked`, `sent_at`, `signed_at`, `signer_name` | belongs to client/quote; has sections/signatures | public_token, signer_email, signer_ip, audit trail, pdf_url | High | Signed contracts now lock and block delete. |
| `contract.clauses` | `contract_sections` | `id`, `contract_id`, `title`, `body`, `sort_order`, `locked` | belongs to contract | clause template id | Medium | Editable only in draft mode. |
| signature fields | `contract_signatures` | `id`, `contract_id`, `client_id`, `signer_name`, `signed_at`, `ip_address`, `user_agent`, `signature_data`, `created_at` | belongs to contract | legal consent checkbox, audit hash | High | Needed before real e-signature claims. |
| `invoices` | `invoices` | `id`, `studio_id`, `client_id`, `quote_id`, `contract_id`, `session_id`, `project_id`, `number`, `kind`, `status`, `subtotal`, `tax`, `total`, `amount_paid`, `balance_due`, `due_date`, `locked`, timestamps | belongs to client/quote/contract/session/project; has items/payments | payment terms, public_token, stripe_invoice_id, zelle_reference | High | Paid invoices hard-lock and block delete. |
| `invoice.lineItems` | `invoice_items` | `id`, `invoice_id`, `name`, `description`, `quantity`, `unit_price`, `sort_order` | belongs to invoice | taxable, source_quote_item_id | Medium | Deposit/final invoices can be itemized cleanly. |
| `payments` | `payments` | `id`, `studio_id`, `client_id`, `invoice_id`, `amount`, `method`, `paid_at`, `note`, `status` | belongs to invoice/client | stripe_payment_intent_id, zelle_reference, refunded_amount, reconciled_at | High | Payment rows must be append-only where possible. Refunds should be separate rows or ledger entries. |
| implicit refunds | `payment_refunds` or `payment_ledger_entries` | `id`, `payment_id`, `invoice_id`, `amount`, `reason`, `created_at` | belongs to payment | created_by | Medium | Current refund action mutates balances. Backend should use ledger model. |
| `sessions` | `sessions` | `id`, `studio_id`, `client_id`, `quote_id`, `contract_id`, `invoice_ids`, `session_type`, `session_date`, `session_time`, `location`, `status`, `prep_status`, `gallery_status` | belongs to client/project; references quote/contract/invoices | calendar_event_id, start_at/end_at, timezone, photographer_id | High | Session date should sync project, portal, invoice due date, and calendar event. |
| project flags inside sessions | `projects` | `id`, `studio_id`, `client_id`, `inquiry_id`, `quote_id`, `contract_id`, `status`, `created_at`, `completed_at` | has sessions, invoices, portal | title, pipeline_stage, owner_id | Medium | Current project is derived from session flags. Create real table before backend. |
| `availability` | `calendar_availability` | `id`, `studio_id`, `date`, `time`, `is_available`, `location_id`, `created_at` | used by sessions/portal | timezone, capacity, hold_expires_at | Medium | Current shape is date + times array. Normalize to one row per slot. |
| `locations` | `locations` | `id`, `studio_id`, `name`, `city`, `address`, `notes`, `active` | used by inquiries/sessions/portal | permit cost, map_url, image_url | Low | Ready for table. |
| `portalProfiles` | `portal_pages` | `id`, `studio_id`, `client_id`, `project_id`, `slug`, `status`, `hero`, `session_details`, `plan_prep_steps`, `gallery_link`, `print_store_link`, timestamps | belongs to client/project | public_token, theme, last_viewed_at | High | Portal must use token-based access, not auth-only, unless client accounts are built. |
| `portal.visionImages` | `portal_assets` | `id`, `portal_page_id`, `type`, `url`, `caption`, `sort_order`, `created_at` | belongs to portal | storage_path, metadata | Medium | Needs Supabase Storage bucket and signed/public URL strategy. |
| `messages` | `portal_messages` | `id`, `studio_id`, `client_id`, `portal_page_id`, `from_role`, `text`, `read_at`, `created_at` | belongs to client/portal | attachment_url, email_notification_status | Medium | Client-specific filtering now guarded through Activity page safe arrays. |
| `activity` | `activity_events` | `id`, `studio_id`, `client_id`, `actor_type`, `event_type`, `text`, `created_at`, `metadata` | belongs to client/user optionally | record_type, record_id, severity | High | Should be generated from actions, not static copy. Current reducer does generate many events. |
| `notificationSettings` | `notification_preferences` | `id`, `studio_id`, `user_id`, `enabled`, `permission`, `delivery_mode`, categories JSON, quiet hours fields | belongs to user/studio | channel preferences, digest settings | Medium | Browser permission is per-device, not global truth. |
| `notificationSettings.devices` | `device_subscriptions` | `id`, `user_id`, `studio_id`, `name`, `platform`, `endpoint`, `keys`, `created_at`, `last_seen_at` | belongs to user/studio | VAPID endpoint/keys, revoked_at | High | Current devices are mock/local. Do not treat as real push subscriptions yet. |
| `emailTemplates` | `email_templates` | `id`, `studio_id`, `key`, `name`, `subject`, `body`, `active`, timestamps | used by communication actions | version, category, variables schema | Medium | Merge fields should be validated before send. |
| `quoteTemplates` | `quote_templates` | `id`, `studio_id`, `name`, `session_type`, `description`, `items_json`, `active` | used by quotes | normalized child rows optional | Medium | Could begin as JSON. Normalize later if analytics matter. |
| `contractTemplates` | `contract_templates` | `id`, `studio_id`, `name`, `session_type`, `sections_json`, `active` | used by contracts | versioning, legal approval status | Medium | Version snapshots must be copied into each contract. |
| `portalDefaults` | `portal_defaults` | `id`, `studio_id`, `key`, `label`, `content`, `sort_order` | copied into portal page | category, active | Low | Settings cleanup should keep this separate from unrelated settings. |
| workflow placeholders | `workflow_rules` | `id`, `studio_id`, `name`, `trigger_type`, `conditions`, `actions`, `enabled` | can create emails, reminders, tasks | dry_run flag, last_run_at, failure count | Medium | Leave as future module. Do not wire until core records persist. |

## Flow audit

Current flow target:

`Inquiry → Client Record → Quote → Quote Accepted → Contract → Contract Signed → Deposit Invoice → Deposit Paid → Portal Access → Date Selection → Session → Final Invoice → Gallery Delivery → Print Store`

### Structurally sound

- Inquiry approval creates or links a client.
- Quotes reference `clientId` and usually `inquiryId`.
- Contracts are generated from accepted quotes and reference `quoteId`.
- Invoices reference client, quote, contract, and session when available.
- Deposit/final invoice separation exists through `invoice.kind`.
- Payments update invoice totals and session status.
- Portal access and date selection are modeled as session/portal milestones.
- Activity events are generated by many reducer actions.

### Gaps to handle before real backend

- `projects` should become a real table. Current project state is mostly derived from `sessions.projectCreatedAt`.
- `sessions.invoiceIds` is currently an array. A join table or invoice `session_id` should become the canonical backend source.
- Quote option selections are stored inside quote option groups. Normalize or intentionally store as JSONB.
- Activity events should include `record_type`, `record_id`, `actor_id`, and machine-readable event names.
- Portal access needs token strategy and expiration/rotation story.
- Real notifications need server push, VAPID keys, and stored browser subscription data.
- Email logs need delivery provider IDs once Resend is wired.

## Backend integration points

Recommended app-facing service seams:

- `src/lib/storage/localStore.js` for safe localStorage read/write compatibility.
- `src/lib/repositories/*` once Supabase starts. Keep UI calling actions, and let actions call repositories.
- `src/modules/*/domain.js` for quote totals, invoice balances, document lock rules, and workflow transitions.
- `src/modules/notifications/push.js` for browser support detection and registration.
- `src/modules/activity/events.js` for event payload builders.

## Suggested migration order

1. `studios`, `users`, auth profiles, role memberships.
2. `clients`, `inquiries`, `locations`.
3. `quotes`, `quote_items`, `quote_option_groups`, `quote_options`.
4. `contracts`, `contract_sections`, `contract_signatures`.
5. `projects`, `sessions`, `calendar_availability`.
6. `invoices`, `invoice_items`, `payments`, payment ledger/refunds.
7. `portal_pages`, `portal_assets`, `portal_messages`.
8. `activity_events`, `email_logs`, `scheduled_emails`.
9. `email_templates`, `quote_templates`, `contract_templates`, `portal_defaults`, `add_ons`.
10. `notification_preferences`, `device_subscriptions`, web push edge functions.
11. Future modules: workflows, marketing campaigns, segmentation, email/SMS logs, deliverability, Stripe/Zelle reconciliation.

## Risk summary

| Risk | Level | Action |
|---|---:|---|
| Large `AdminApp.jsx` and `crm.js` files slow diagnosis | High | Split by module after schema is approved. |
| Build in this sandbox times out during optimized compile | High | Re-run on local/Vercel. If it also hangs, split admin bundle and dynamic import heavy pages. |
| Document locking was inconsistent | Medium | Patched quote/contract/invoice lock and delete guard behavior. |
| localStorage can throw on quota/private mode | Medium | Patched write guard. Extract into storage wrapper next. |
| PWA notifications could be mistaken for real push | Medium | Docs now call this local/demo until server push exists. |
| Project state is derived, not first-class | Medium | Create `projects` table before Supabase feature wiring. |
