# Patch Notes: Refactor v1

## Goal

Create the first working app skeleton from the original prototype without deleting any existing screens.

## Completed

- Created a Next.js app shell.
- Preserved the original prototype in `/legacy`.
- Moved brand tokens to `src/features/eccs/lib/brand.js`.
- Moved pipeline state rules to `src/features/eccs/lib/pipeline.js`.
- Moved Sarah/demo mock data to `src/features/eccs/lib/mock-data.js`.
- Moved shared UI primitives to `src/features/eccs/components/ui.jsx`.
- Split admin and client experiences into separate files.
- Split global controls into `TopSwitcher` and `ManualOverride`.
- Moved document modal into its own shared component.
- Passed `setPortal` into the client portal so date selection can persist.

## Intentional non-changes

- No Supabase connection yet.
- No auth yet.
- No Stripe yet.
- No email sending yet.
- No route split yet.
- No visual redesign.

This patch is a safe foundation pass.
