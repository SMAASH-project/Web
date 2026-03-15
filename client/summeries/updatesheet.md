# UpdateSheet — Implementation Notes

## What was built

`UpdateSheet.tsx` is the slide-out sheet on the Profile page that lets users
edit their display name and email. Previously it was entirely hardcoded with
placeholder constants (`Username = "placeholder"`, `Email = "lorem@ipsum.com"`).

---

## What it does now

- **Pre-fills** Display Name from `ProfileContext.selectedProfile.name` and
  Email from `useWhoAmIQuery`, re-syncing every time the sheet opens.
- **Save is disabled** until at least one field actually differs from its
  current server value — no accidental no-op API calls.
- **Saves in parallel** — if both fields changed, both mutations fire with
  `Promise.all` so there's no sequential delay.
- **Auto-updates on save** — after `mutateAsync` resolves, calls
  `refetchQueries({ queryKey: queryKeys.profiles.byUserId(userId), type: "active" })`.
  Because `mutateAsync` awaits the server confirmation, the refetch always
  returns the new name. `type: "active"` targets only queries with live
  subscribers (Navbar, ProfileContext) so the update propagates instantly to
  every component showing the name without a page refresh.
- Shows a spinner during save, a green success flash that auto-closes the sheet
  after 900ms, and a red error panel with the server's message on failure.

---

## Endpoints used

| Field        | Endpoint                | Hook                         |
| ------------ | ----------------------- | ---------------------------- |
| Display Name | `PUT /api/profiles/:id` | `useUpdateProfileMutation`   |
| Email        | `PUT /api/users/:id`    | `useUpdateUserEmailMutation` |

`useUpdateUserEmailMutation` was added to `useAuthHooks.ts`. It sends
`{ id, email, role_id: 0 }` — the zero `role_id` is safe because GORM's
`Updates()` in `BaseRepositoryActions` skips zero-value struct fields,
so the role is preserved unchanged.

---

## Password field

Rendered but permanently disabled. The backend explicitly excludes password
from `UserUpdateDTO` ("You can't change the password here, that requires
separate functionality" — `users_controller.go`). A detailed
`TODO: BACKEND` comment block is in `UpdateSheet.tsx` describing exactly what
needs to be added:

- `POST /api/auth/change-password` endpoint
- Body: `{ current_password: string, new_password: string }`
- Add `useChangePasswordMutation` to `useAuthHooks.ts`
- Then replace the disabled field

---

## Cache behaviour (why it works)

`useProfilesQuery` had `staleTime: 5 * 60 * 1000`. This caused `refetchQueries`
to silently skip the refetch if React Query deemed the data "not stale enough".
Changed to `staleTime: 0` in `useProfileHooks.ts` so every triggered refetch
always goes through.

Earlier attempts used `setQueryData` (optimistic write) followed by
`refetchQueries`. This cancelled itself out — the optimistic write pushed the
new name to subscribers, React started re-rendering, then the refetch returned
and wrote over the cache again before React committed the first render, losing
the update. The fix is to skip `setQueryData` entirely and only call `refetchQueries`
after the server has confirmed the save.

---

## Files changed

- `src/components/pages/profileDependents/profile/UpdateSheet.tsx` — full rewrite
- `src/hooks/useAuthHooks.ts` — added `useUpdateUserEmailMutation`
- `src/hooks/useProfileHooks.ts` — `staleTime` set to `0`, added `refetchQueries`
  to `useUpdateProfileMutation.onSuccess`
