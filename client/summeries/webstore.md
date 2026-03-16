# Webstore — Coins & Known TODOs

## What was fixed

`userCoins` in `WebstorePage.tsx` was hardcoded as `5000`.

**Fix:** import `useProfiles` from ProfileContext and read
`selectedProfile?.coins ?? 0` instead. The `coins` field is already returned
by `GET /api/users/:id/profiles` (`PlayerProfileReadDTO.coins`) and is live
in the cache — no new API calls needed.

```tsx
// Before
const userCoins = 5000; // Replace with actual coin balance from API

// After
const { selectedProfile } = useProfiles();
const userCoins = selectedProfile?.coins ?? 0;
```

The coin balance in the top-right of the Webstore header now reflects the
real value from the API and updates reactively whenever the profile cache
refreshes (e.g. after coins are spent or awarded).

---

## Remaining TODOs in Webstore

### 1. Unlock / purchase is local-only

`unlockItem(id)` in `useItems.ts` just flips `item.owned = true` in local
state. It does not call the backend. There is no purchase/unlock endpoint yet.

**Needed:**

```
POST /api/profiles/:profileId/purchases
Body: { item_id: number }
```

Logic: deduct coins from the profile, create a `Purchase` record,
return updated coin balance. Frontend then needs to:

- Call the purchase endpoint instead of just `setAllItems`
- Refresh the profile coins after a successful purchase
- Refresh ownership state from the server

### 2. Items are example data

`useItems.ts` uses `exampleItems` from `src/types/ExampleItems.ts`.
The real items endpoint exists (`GET /api/items`) but `useItems` doesn't
call it. Wiring this up requires replacing the local `useState(exampleItems)`
with a React Query hook that fetches from `/api/items` and maps the response
to `WebstoreItem`.

### 3. `handleCreateItem` and `handleDeleteItem` are console.log stubs

Both in `WebstorePage.tsx` log to the console but don't call the API.
The items controller has `POST /api/items` and `DELETE /api/items/:id` already.

---

## Files changed

- `src/components/pages/mainPages/WebstorePage.tsx` — `userCoins` wired to
  `selectedProfile?.coins`, added `useProfiles` import
