# SMAASH Client — User Documentation

Last updated: 2026-04-02

## 1) Getting started

1. Open the app and sign in at `/app/login`.
2. If you have no account, use `/app/signup`.
3. After login, you are redirected into the app (usually releases/home flow).

## 2) Main navigation

Top navigation gives access to:

- Releases
- News
- Webstore
- Leaderboard
- Gallery
- Profile
- Profile Selector
- Settings

Admin-only users also see **Admin**.
Support/admin users also see **Debug**.

## 3) Profile selector

- Choose your active game profile.
- Add profile via the add dialog.
- The selected profile is remembered per account.

## 4) Profile page

- View avatar, display name, coins, and basic stats.
- Edit sheet allows:
  - display name update
  - email update
- Password change in this sheet may be disabled depending on backend support.

## 5) Webstore

- Browse items by type/rarity/search.
- Buy items (when account and profile permissions allow).
- Your displayed coins come from the selected profile.

## 6) News

- Read community/game posts.
- Filtering and searching available.
- Admin users can create/edit/remove news items.

## 7) Releases

- Browse release cards.
- Filter/search by platform and keywords.
- Download button is enabled only when that release has a valid URL for selected platform.

## 8) Leaderboard

Shows top data such as:

- win leaderboard
- most active players
- most played levels
- most purchased items

If loading is slow, it usually means stats endpoints are still computing server-side.

## 9) Gallery

- Browse visual/audio/media entries available in gallery.
- Use next/previous controls where supported.

## 10) Settings

You can change:

- language (English/Hungarian)
- visual mode (dark/light, liquid glass)
- animation behavior
- theme colors/effects

## 11) Debug page (support/admin)

Tabs include:

- System: runtime and environment-style diagnostics
- Cache: inspect and invalidate query cache entries
- Endpoints: run API requests manually
- Game Data: inspect domain entities
- Sight: visual/debug toggles

## 12) Troubleshooting

- If actions fail after long idle time, sign in again.
- If data looks stale, refresh page or use debug cache invalidation.
- If profile-specific data is wrong, re-open profile selector and reselect profile.
