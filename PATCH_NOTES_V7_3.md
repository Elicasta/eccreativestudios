# EC Creative Studios CRM v7.3

Focused Activity / Alerts layout cleanup.

## Changed

- Moved the Activity stats into a compact top summary strip.
- Removed the large stacked stat cards that pushed the feed lower on mobile.
- Reduced the top spacing on the Activity page so stats sit directly under the Activity header.
- Kept the Activity & Notifications feed underneath the stats.
- Kept the existing filters: All Activity, Client Activity, Messages, Notifications.
- Kept existing navigation/actions for messages, invoices, and contracts.

## Verified

Ran:

```bash
npm install --no-audit --no-fund
NEXT_TELEMETRY_DISABLED=1 npm run build
```

Build passed.
