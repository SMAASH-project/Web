# SMAASH Web — Fejlesztői útmutató (Magyar)

## Technológiai stack

| Réteg | Technológia |
|-------|-------------|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, Motion React, shadcn/ui |
| Állapotkezelés | TanStack Query (React Query) v5, React Context |
| Routing | React Router v6 |
| HTTP | Axios |
| i18n | i18next (en / hu) |
| Backend | Go, Gin, GORM, SQLite |
| Hitelesítés | HTTP-only cookie (JWT), bcrypt jelszavak |
| Build eszköz | `just` (justfile) |

---

## Adattár-struktúra

```
/
├── client/            # React frontend (Vite)
│   └── src/
│       ├── components/    # Újrafelhasználható UI + nav + debug overlay-ek
│       ├── context/       # AuthContext, NavbarContext
│       ├── hooks/         # Query/mutation hook-ok (useAuth, useDebug, useAdmin, …)
│       ├── lib/           # apiClient, queryKeys, utils, i18n, toast
│       ├── locales/       # en/ és hu/ fordítási JSON fájlok
│       ├── pages/         # Útvonal-szintű oldal komponensek
│       └── types/         # TypeScript típusdefiníciók
├── cmd/
│   ├── api/main.go        # Backend belépési pont
│   └── seeder/main.go     # Adatbázis-feltöltő belépési pont
├── internal/
│   ├── controllers/       # Gin HTTP kezelők
│   ├── services/          # Üzleti logika (auth)
│   ├── repository/        # Általános + domain-specifikus GORM repository-k
│   ├── models/            # GORM modell struktúrák
│   ├── DTOs/              # Kérés / válasz adatátviteli objektumok
│   ├── middlewares/       # Auth, CRUD validátor, logger
│   ├── database/          # DB inicializálás + auto-migrálás
│   └── initializer/       # Függőség-injektálás
├── docs/                  # Dokumentáció + Swagger specifikációk
├── justfile               # Feladatfuttató
└── .air.toml              # Go élő-újratöltés konfiguráció
```

---

## Helyi fejlesztés

### Előfeltételek

- Go 1.22+
- Node 20+
- `just` feladatfuttató (`cargo install just` vagy csomagkezelőn keresztül)

### Fejlesztői szerver indítása (hot reload)

```sh
just dev          # Windows Terminal megnyitása Go szerverrel + Vite dev szerverrel
# vagy külön-külön:
just run          # Go backend a :8080 porton
cd client && npm run dev   # Vite a :5173 porton (proxyk /api → :8080)
```

### Build

```sh
just build-client   # tsc + vite build → build/client/
just build          # go build → build/main.exe
just build-fullstack  # mindkettő
```

### Tesztelés

```sh
just test-client    # ESLint + Vitest egységtesztek + Prettier formátum-ellenőrzés
just test           # Go tesztek (go test ./... -v)
```

### Adatbázis feltöltése

```sh
just seed
```

### Swagger dokumentáció generálása

```sh
just swagger        # swag init → docs/swagger/
```

---

## Frontend architektúra

### Query kulcsok

Az összes React Query kulcs a `client/src/lib/queryKeys.ts` és a `client/src/hooks/useDebug.ts` fájlokban (`debugQueryKeys`) van definiálva. Mindig ezeket a konstansokat használd nyers sztringek helyett a gyorsítótár-kulcs eltérések elkerülése érdekében.

### API kliens

`client/src/lib/apiClient.ts` — Axios példány előre konfigurálva:
- Alap URL: `/api`
- Hitelesítő adatok beküldve (`withCredentials: true`)
- Opcionális mesterséges hálózati késleltetés (debug panel Emulation fülön beállítható)

### Auth folyamat

1. `POST /api/auth/login` visszaadja `{ id, role }` és beállít egy HTTP-only `Authorization` cookie-t.
2. `AuthProvider` az `GET /api/users/whoami` végpontot hívja meg mountoláskor. Ha sikerül, a felhasználó be van jelentkezve.
3. `RequireAuth` komponens védi az összes `/app/*` útvonalat.
4. Kijelentkezéskor `POST /api/auth/logout` törli a cookie-t, majd `queryClient.removeQueries` törli a kliens oldali gyorsítótárat.

### i18n

A fordítási fájlok a `client/src/locales/{en,hu}/*.json` könyvtárakban vannak. A névtér egy oldalra vagy funkcióra mapel (pl. `auth`, `nav`, `debug`). Új kulcsokat egyszerre add hozzá az `en/` és `hu/` fájlokhoz. Komponensekben `useTranslation("névtér")` segítségével használd.

### Beállítások

`SettingsContext` (a `client/src/pages/settings/SettingsContext.tsx` fájlban) elérhetővé teszi a `settings` és `updateSetting` értékeket. A beállítások `localStorage`-ban tárolódnak. Kulcsok: `useDarkMode`, `useLiquidGlass`, `useAnimations`, `language`.

---

## Backend architektúra

### Routing

Az `internal/server/router.go` az összes útvonalcsoportot `/api` alá csatolja. Minden controller implementálja a `MountRoutes(apiGroup *gin.RouterGroup)` metódust.

### Hitelesítés

- Jelszavak bcrypt-tel titkosítva (cost 12) az `internal/services/authn_service.go`-ban.
- JWT egy HTTP-only cookie-ban tárolva (`Authorization`).
- `internal/middlewares/authz.go` elemzi a cookie-t és injektálja a felhasználót a Gin kontextusba.

### Hibaválaszok

Minden hibaválasz `dtos.ErrResp` formátumot használ:
```json
{ "timestamp": "...", "error": "hibaüzenet szövege", "path": "/api/..." }
```
A frontend `extractErrorMessage()` segédfüggvénye az `error` mezőt olvassa.

### Ismert backend hibák

- `authn_controller.go:46–48`: hiányzó `return` a második `c.JSON` hívás után a `CreateDTOToUser` hibakezelési ágában. Ha nem `ErrRecordNotFound` hiba történik, a végrehajtás továbbesik az `authService.SignUp()` hívásra egy nil `newUser` mutatóval, ami pánikot okoz. Szükséges egy `return` hozzáadása a 48. sor után.
- A `useDebugItemsQuery` a `client/src/hooks/useDebug.ts`-ben `/characters` végpontról tölt be a szándékozott `/items` végpont helyett (ami esetleg még nem létezik). Az Items CRUD mutációk is a `/characters` végpontra mutatnak. Ez egy helyfoglaló — egy valódi `/items` végpontot kell bekötni, amikor a backend támogatja.

---

## Debug panel

A `/app/debug` útvonalon érhető el admin és support szerepkörű felhasználóknak.

| Fül | Cél |
|-----|-----|
| System | Böngésző info, munkamenet, környezet |
| Endpoints | Ad-hoc API kérésszerkesztő |
| Cache | React Query gyorsítótár-néző — Clear törli az összes bejegyzést, Refresh újra lekéri |
| Game Data | CRUD karakterekhez, pályákhoz, tárgyakhoz; felhasználói tiltás/előléptetés/lefokozás |
| Database | Teljes adatbázis-tábla böngésző inline szerkesztéssel |
| Visual | Téma, blur, elrendezés-keretek, elem-vizsgáló |
| Emulation | Viewport előbeállítások, hálózati késleltetés szimuláció |
| Diagnostics | A11y, renderelési számlálók, z-index vizsgáló |

### Oldalsáv Frissítés gomb

Meghívja a `queryClient.invalidateQueries + refetchQueries` függvényt a `["debug"]` kulcselőtagra szűkítve — újra lekéri a debug füleken látható összes adatot.

---

## Navbar elrendezés (asztali)

Az asztali navbar CSS grid-et használ (`grid-cols-[1fr_auto_1fr]`):
- **Bal oszlop** (`1fr`): admin + debug panel gyorsgombok (csak ikon `lg` alatt, ikon+szöveg `lg`-től felfelé).
- **Középső oszlop** (`auto`): fő NavMenu — mindig középre igazítva, a bal oldali gombok számától függetlenül.
- **Jobb oszlop** (`1fr`): felhasználónév + fiókmenü, jobbra igazítva.

Ez megakadályozza, hogy az admin/debug gombok átfedjék a NavMenu-t közepes képernyőszélességeken (~768–900 px).

---

## Commit konvenció

```
típus(hatókör): rövid összefoglaló (≤ 72 karakter)

Részletes leírás, amely elmagyarázza, mi és miért változott.
Emlitsd meg az érintett fájlokat és a kiváltó okot, ha hibát javítasz.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Típusok: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
