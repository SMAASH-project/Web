# Profile Page — Stats & Match History

## What was built

The Stats and Match History sections on the Profile page were previously empty
stubs (`<h2>Stats</h2>` and `<p>Match History</p>`). The page is now a proper
three-panel card matching the layout style of Settings and Admin.

---

## Layout

```
[ Avatar / Name / Edit ] | [ Stats ] | [ Match History ]
```

Responsive — stacks vertically on mobile, side-by-side on `lg+`.
Panels are separated by themed `<Separator />` components.

---

## Left panel

- Avatar (click to upload, same behaviour as before)
- Display name + coin count pulled from `ProfileContext.selectedProfile`
- `UpdateSheet` edit button

---

## Centre — Stats

### Live data (wired, works now)

| Card       | Source                                                  |
| ---------- | ------------------------------------------------------- |
| Coins      | `selectedProfile.coins`                                 |
| Last Login | `selectedProfile.last_login` (newly mapped — see below) |
| Profile ID | `selectedProfile.id`                                    |

### Game stats (dimmed placeholders, waiting on backend)

Wins, Losses, Win Rate, Matches — rendered with `opacity-40` and `—` values.
This communicates "coming soon" rather than hiding them or showing broken UI.

---

## Right — Match History

A `panelBg` rounded container with a centred empty state:
swords icon + "No matches yet" + explanatory subtext.

---

## Backend requirement

Neither the Stats game cards nor Match History can be populated until this
endpoint exists:

```
GET /api/profiles/:id/matches
```

**Response shape needed:**

```json
[
  {
    "match_id": 1,
    "level_name": "Arena",
    "result": "win",
    "character_name": "Slime",
    "started_at": "2026-03-15T12:00:00Z",
    "ended_at": "2026-03-15T12:05:00Z",
    "network_status": "online"
  }
]
```

The `Match`, `MatchParticipation`, and `Character` models all exist in the
backend already. There is no controller or route for them yet.

**Frontend wiring (once endpoint exists):**

1. Add `useProfileMatchesQuery(profileId)` to `src/hooks/useProfileHooks.ts`
2. Derive `wins`, `losses`, `winRate`, `totalMatches` from the response
3. Replace the dimmed `—` cards with real values
4. Map the response into match row components in the History panel

`TODO: BACKEND` comments marking exactly these steps are already in
`ProfilePageConent.tsx`.

---

## Supporting changes

### `ProfilesTypes.ts`

Added `last_login?: string` to the `Profile` interface. The API was already
returning this field from `PlayerProfileReadDTO` but it was being silently
dropped when mapping into the context.

### `ProfilesContext.tsx`

Added `last_login: p.last_login` to the profile mapping so the timestamp
flows through to all consumers.

---

## Filename correction

The component file was renamed from `ProfilePageConent.tsx` (typo) to
`ProfilePageContent.tsx`. The import in `ProfilePage.tsx` was updated
accordingly:

```ts
// Before
import { ProfilePageContent } from "./ProfilePageConent";

// After
import { ProfilePageContent } from "./ProfilePageContent";
```

## Last Login → Last Seen

The "Last Login" stat card label was changed to **"Last Seen"** as it better
describes the data. The underlying field is still `last_login` from the API —
it is not a creation/join date. If a true "Member Since" join date is ever
needed, `created_at` needs to be added to `PlayerProfileReadDTO` on the backend
(the field exists on `gorm.Model`, it just isn't serialised).
