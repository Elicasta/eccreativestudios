# Engineering Hardening Changelog

## 2026-06-23 Hardening pass

### Changed

- Removed the floating Manual Override trigger.
- Added a secondary Manual Override pill in the admin topbar when a client is selected.
- Added safe-area-aware layout rules for mobile topbars, drawers, modals, and bottom navigation.
- Added global horizontal overflow protection.
- Wrapped localStorage persistence in a safe try/catch.
- Added ESLint project configuration.
- Added lightweight diagnostics script and npm command.
- Added Supabase readiness audit document.
- Added engineering review document.

### Fixed

- Fixed conditional React hook usage in the project workspace card.
- Locked accepted quotes consistently.
- Locked sent/signed contracts consistently.
- Prevented quote editing when accepted, declined, or locked.
- Prevented contract editing when signed or locked.
- Prevented invoice editing when paid or locked.
- Blocked deleting accepted/downstream quotes.
- Blocked deleting signed/downstream contracts.
- Blocked deleting paid invoices and invoices with payments.

### Diagnostics

- `npm run diagnostics` passes.
- `npm run lint` runs and passes with warnings.
- `next build` did not complete in the sandbox before timeout. Re-run locally or in Vercel and split the admin bundle if reproducible.

### Not changed

- No current modules were removed.
- No broad redesign was done.
- No Supabase migrations were created.
- No fake production push/email/payment behavior was added.
