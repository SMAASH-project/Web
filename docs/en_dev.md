# SMAASH Web — Developer Guide (English)

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, Motion React, shadcn/ui |
| State | TanStack Query (React Query) v5, React Context |
| Routing | React Router v6 |
| HTTP | Axios |
| i18n | i18next (en / hu) |
| Backend | Go, Gin, GORM, SQLite |
| Auth | HTTP-only cookie (JWT), bcrypt passwords |
| Build tool | `just` (justfile) |

---

## Repository Layout

```
/
├── client/            # React frontend (Vite)
│   └── src/
│       ├── components/    # Reusable UI + nav + debug overlays
│       ├── context/       # AuthContext, NavbarContext
│       ├── hooks/         # Query/mutation hooks (useAuth, useDebug, useAdmin, …)
│       ├── lib/           # apiClient, queryKeys, utils, i18n, toast
│       ├── locales/       # en/ and hu/ translation JSON files
│       ├── pages/         # Route-level page components
│       └── types/         # TypeScript type definitions
├── cmd/
│   ├── api/main.go        # Backend entry point
│   └── seeder/main.go     # Database seeder entry point
├── internal/
│   ├── controllers/       # Gin HTTP handlers
│   ├── services/          # Business logic (auth)
│   ├── repository/        # Generic + domain-specific GORM repositories
│   ├── models/            # GORM model structs
│   ├── DTOs/              # Request / response data transfer objects
│   ├── middlewares/       # Auth, CRUD validator, logger
│   ├── database/          # DB init + auto-migrate
│   └── initializer/       # Dependency injection
├── docs/                  # Documentation + Swagger specs
├── justfile               # Task runner
└── .air.toml              # Go live-reload config
```

---

## Local Development

### Prerequisites

- Go 1.22+
- Node 20+
- `just` task runner (`cargo install just` or via package manager)

### Start dev server (hot reload)

```sh
just dev          # opens Windows Terminal with Go server + Vite dev server
# or separately:
just run          # Go backend on :8080
cd client && npm run dev   # Vite on :5173 (proxies /api → :8080)
```

### Build

```sh
just build-client   # tsc + vite build → build/client/
just build          # go build → build/main.exe
just build-fullstack  # both
```

### Test

```sh
just test-client    # ESLint + Vitest unit tests + Prettier format check
just test           # Go tests (go test ./... -v)
```

### Seed database

```sh
just seed
```

### Generate Swagger docs

```sh
just swagger        # swag init → docs/swagger/
```

---

## Frontend Architecture

### Query keys

All React Query keys are defined in `client/src/lib/queryKeys.ts` and `client/src/hooks/useDebug.ts` (`debugQueryKeys`). Always use these constants rather than raw strings to avoid cache key mismatches.

### API client

`client/src/lib/apiClient.ts` — Axios instance pre-configured with:
- Base URL: `/api`
- Credentials included (`withCredentials: true`)
- Optional artificial network delay (set via debug panel Emulation tab)

### Auth flow

1. `POST /api/auth/login` returns `{ id, role }` and sets an HTTP-only `Authorization` cookie.
2. `AuthProvider` calls `GET /api/users/whoami` on mount. If it succeeds the user is considered logged in.
3. `RequireAuth` component guards all `/app/*` routes.
4. Logout calls `POST /api/auth/logout` which clears the cookie, then `queryClient.removeQueries` clears the client-side cache.

### i18n

Translation files live in `client/src/locales/{en,hu}/*.json`. The namespace maps to a page or feature (e.g. `auth`, `nav`, `debug`). Add new keys to both `en/` and `hu/` files simultaneously. Use `useTranslation("namespace")` in components.

### Settings

`SettingsContext` (in `client/src/pages/settings/SettingsContext.tsx`) exposes `settings` and `updateSetting`. Settings are persisted to `localStorage`. Keys: `useDarkMode`, `useLiquidGlass`, `useAnimations`, `language`.

---

## Backend Architecture

### Routing

`internal/server/router.go` mounts all route groups under `/api`. Each controller implements `MountRoutes(apiGroup *gin.RouterGroup)`.

### Auth

- Passwords hashed with bcrypt (cost 12) in `internal/services/authn_service.go`.
- JWT stored in an HTTP-only cookie (`Authorization`).
- `internal/middlewares/authz.go` parses the cookie and injects the user into the Gin context.

### Error responses

All error responses use `dtos.ErrResp`:
```json
{ "timestamp": "...", "error": "message text", "path": "/api/..." }
```
The frontend's `extractErrorMessage()` utility reads the `error` field.

### Known backend issues

- `authn_controller.go:46–48`: missing `return` after the second `c.JSON` call in the `CreateDTOToUser` error branch. If a non-`ErrRecordNotFound` error occurs, execution falls through to `authService.SignUp()` with a nil `newUser` pointer, causing a panic. Needs a `return` added after line 48.
- `useDebugItemsQuery` in `client/src/hooks/useDebug.ts` fetches from `/characters` instead of the intended `/items` endpoint (which may not exist yet). Items CRUD mutations also point to `/characters`. This is a placeholder — wire up a real `/items` endpoint when the backend supports it.

---

## Debug Panel

Accessible at `/app/debug` for admin and support roles.

| Tab | Purpose |
|-----|---------|
| System | Browser info, session, environment |
| Endpoints | Ad-hoc API request builder |
| Cache | React Query cache viewer — Clear removes all entries, Refresh re-fetches |
| Game Data | CRUD for characters, levels, store items; user ban/promote/demote |
| Database | Full DB table browser with inline editing |
| Visual | Theme, blur, layout borders, element inspector |
| Emulation | Viewport presets, network delay simulation |
| Diagnostics | A11y, render counters, z-index inspector |

### Sidebar Refresh button

Calls `queryClient.invalidateQueries + refetchQueries` scoped to the `["debug"]` key prefix — re-fetches all data visible in the debug tabs.

---

## Navbar Layout (Desktop)

The desktop navbar uses a CSS grid (`grid-cols-[1fr_auto_1fr]`):
- **Left column** (`1fr`): admin + debug panel shortcut buttons (icon-only below `lg`, icon+text at `lg+`).
- **Center column** (`auto`): main NavMenu — always centred regardless of button count on the left.
- **Right column** (`1fr`): username + account menu, right-aligned.

This prevents the admin/debug buttons from overlapping the NavMenu at mid-range viewport widths (~768–900 px).

---

## Commit Convention

```
type(scope): short summary (≤ 72 chars)

Detailed description explaining what changed and why.
Mention affected files and the root cause if fixing a bug.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
