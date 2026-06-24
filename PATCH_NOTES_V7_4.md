# EC Creative Studios CRM v7.4 — PWA Notifications + Portal More Drawer

## Scope

This pass starts from v7.3 and touches only:

- PWA install/notification infrastructure
- Settings > Notifications
- Client Portal bottom navigation

## Added: PWA install shell

- Added `public/manifest.webmanifest`.
- Added app icons at `public/icons/icon-192.png` and `public/icons/icon-512.png`.
- Updated `app/layout.jsx` with manifest, Apple web app metadata, app icons, and theme color viewport settings.
- Added `public/sw.js` service worker.

## Added: browser notification system

The CRM now has a frontend notification bridge that can notify the current browser/device for CRM events when notification permission is granted.

Notification trigger categories:

- Client messages
- New/follow-up inquiries
- Quote viewed/accepted/declined
- Contract sent/signed
- Invoice sent/partially paid/paid
- Payments received
- Session scheduled

Behavior:

- The app registers the service worker automatically.
- Existing demo events are bootstrapped silently so the user is not spammed on first load.
- New events after setup can create browser notifications.
- Quiet hours prevent automatic notifications during the configured window.
- Categories can be turned on/off individually.

## Added: Settings > Notifications

Settings now has a new Notifications tab with:

- Enable notifications
- Refresh device registration
- Send test notification
- Global on/off toggle
- Category toggles
- Quiet hours controls
- Registered device list
- Device removal
- Backend-ready note for Supabase push wiring

## Added: backend-ready push routes

Added placeholder API routes:

- `POST /api/push/subscribe`
- `POST /api/push/test`

These do not send real server push yet. They exist so the Supabase backend phase has the right shape for saving browser subscriptions and sending push from Edge Functions with VAPID keys.

## Important iPhone note

For iPhone notifications:

1. Open the CRM in Safari.
2. Share > Add to Home Screen.
3. Open the CRM from the Home Screen icon.
4. Go to Settings > Notifications.
5. Tap Enable notifications.
6. Allow notifications.

Normal Safari tab mode may not expose iPhone Web Push behavior.

## Client Portal update

- Changed the last mobile portal bottom nav item to **More**.
- Tapping **More** opens the portal sidebar drawer.
- Payments, Gallery, Plan & Prep, Vision Board, and Session Details remain available from the drawer.

## Verification

Ran:

```bash
npm install --no-audit --no-fund
NEXT_TELEMETRY_DISABLED=1 npm run build
```

Build passed.
