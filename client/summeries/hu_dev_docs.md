# SMAASH Web Kliens — Fejlesztői Dokumentáció

## A stack dióhéjban

| Réteg | Technológia |
|---|---|
| Framework | React 19 + TypeScript 5.9, strict mód |
| Build eszköz | Vite 7 |
| Stílusozás | Tailwind CSS 4 |
| Animáció | motion/react (Framer Motion v11) |
| Szerver állapot | TanStack Query v5 (React Query) |
| HTTP kliens | Axios |
| Séma validáció | Zod |
| Routing | React Router DOM v7 |
| Lokalizáció | i18next (angol és magyar) |
| Tesztelés | Vitest + @testing-library/react |

Az alkalmazás egy single-page app, amely a `/app/` base path alatt fut. Egy Go backend REST API-val kommunikál a `/api/` útvonalon. A session hitelesítés cookie alapú — a tokenek soha nem kerülnek JavaScript memóriába.

---

## Projektstruktúra

```
client/
  src/
    main.tsx                router definíció, lazy-loadolt route-ok
    RootLayout.tsx          globális provider-ek, React Query kliens
    App.tsx                 gyökér átirányítás (login vs releases)
    Wrapper.tsx             háttéranimáció, CSS változók kibocsátása
    index.css               globális stílusok, @keyframes a CSS animációkhoz
    App.css                 App-specifikus stílusok
    test-setup.ts           Vitest globális setup (jest-dom matcherek regisztrálása)
    context/                Auth, SecurityKey, Navbar context-ek és provider-ek
    hooks/                  React Query hook-ok (adatlekérés)
    lib/                    megosztott segédprogramok, konstansok, sémák, konfiguráció
    components/             megosztott UI komponensek, guard-ok, debug overlay-ek
    backgrounds/            animált háttér komponensek
    animations/             motion wrapperek és animáció primitívek
    pages/                  feature oldalak (oldalanként egy könyvtár)
    locales/                i18n JSON fájlok (en/, hu/)
    assets/                 statikus fájlok (zászlók, OS logók, hangsávok)
  summeries/                dokumentációs fájlok (ez a könyvtár)
  vite.config.ts
  tsconfig.app.json
  package.json
```

A **`context/`** könyvtár kizárólag az `AuthProvider`, `AuthContext`, `SecurityKeyProvider`, `SecurityKeyContext`, `NavbarContext` és `NavbarContextUtils` fájlokat tartalmazza. A feature-szintű provider-ek (`SettingsProvider`, `ColorProvider`, `ProfileProvider`) a saját oldal-könyvtárukban találhatók.

---

## Útvonaltábla

| Útvonal | Komponens | Bundle |
|---|---|---|
| `/app` | `App` | eager |
| `/app/login` | `LoginPage` | eager |
| `/app/signup` | `SignUpPage` | eager |
| `/app/reset-password` | `PasswordResetPage` | eager |
| `/app/releases` | `ReleasesPage` | lazy, ErrorBoundary |
| `/app/leaderboard` | `LeaderboardPage` | lazy, ErrorBoundary |
| `/app/gallery` | `GalleryPage` | lazy, ErrorBoundary |
| `/app/webstore` | `WebstorePage` | lazy, ErrorBoundary |
| `/app/news` | `NewsPage` | lazy, ErrorBoundary |
| `/app/profile` | `ProfilePage` | lazy, ErrorBoundary |
| `/app/settings` | `SettingsPage` | lazy, ErrorBoundary |
| `/app/profile-selector` | `ProfileSelectorPage` | lazy, ErrorBoundary |
| `/app/admin` | `AdminPage` | lazy, ErrorBoundary |
| `/app/debug` | `DebugPage` | lazy, ErrorBoundary |
| `*` | `NotFoundPage` | lazy, nincs ErrorBoundary |

Az auth oldalak (`/app/login`, `/app/signup`, `/app/reset-password`) eager betöltéssel kerülnek a kezdeti bundle-be. Az összes védett route egy `RequireAuth` outlet gyereke. A `NotFoundPage` catchall szándékosan nem kap `ErrorBoundary` wrappert — a `RequireAuth` outleten kívül renderelődik, hogy a nem bejelentkezett felhasználók is lássák a 404 oldalakat.

---

## Belépési pontok

### `src/main.tsx`

A `createBrowserRouter` segítségével hozza létre a React Routert. A `withBoundary` segédfüggvény `<ErrorBoundary>`-be csomagolja a route elemet:

```typescript
function withBoundary(element: React.ReactNode) {
  return <ErrorBoundary>{element}</ErrorBoundary>;
}
```

A lazy oldalak a named-export mintát használják:

```typescript
const ReleasesPage = lazy(() =>
  import("./pages/releases/ReleasesPage.tsx").then((m) => ({
    default: m.ReleasesPage,
  })),
);
```

A router modul scope-ban jön létre és egy `<RouterProvider>`-nek adódik át, amely `<StrictMode>` wrapperben van.

### `src/RootLayout.tsx`

A React Router az összes route szülőjeként rendereli. Tartalmazza a React Query klienst, az összes context providert és a Suspense fallbacket.

**React Query kliens konfiguráció:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,    // 2 perc a háttér-újralekérés előtt
      gcTime: 10 * 60 * 1000,       // 10 perc a cache törlése előtt
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: "online",
    },
    mutations: {
      retry: 1,
      networkMode: "online",
    },
  },
});
```

A kliens `PersistQueryClientProvider`-t használ, `createSyncStoragePersister`-rel, `localStorage` háttértárolóval. A query cache így túléli a kemény böngésző-frissítést. Az auth query-k (`whoami`) ki vannak zárva a perzisztálásból (`gcTime: 0`, `staleTime: 0`), hogy elavult session soha ne kerüljön a cache-ből kiszolgálásra.

**`MotionWrapper` (a `RootLayout.tsx`-ben definiálva)** két forrásból olvassa az animáció viselkedését:

```typescript
function MotionWrapper({ children }: { children: React.ReactNode }) {
  const { settings: dbg } = useDebugSettings();
  const { settings } = useSettings();
  const duration = SPEED_TO_MOTION[dbg.animationSpeed] ?? 0.3;
  const noMotion = !settings.useAnimations || dbg.forceReducedMotion;
  return (
    <MotionConfig transition={{ duration }} reducedMotion={noMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
```

A `SPEED_TO_MOTION` a debug sebességcsúszkát másodpercekben megadott átmeneti időtartamra képezi le:

```typescript
const SPEED_TO_MOTION: Record<number, number> = {
  0.25: 2,    // nagyon lassú
  0.5:  0.8,
  1:    0.3,  // alapértelmezett
  2:    0.1,
  4:    0.05, // nagyon gyors
};
```

Ha a `noMotion` értéke `true` (azaz `useAnimations` ki van kapcsolva, vagy `forceReducedMotion` be van kapcsolva), a `MotionConfig`-nak `reducedMotion="always"` kerül átadásra, ami arra utasítja a `motion/react`-et, hogy az összes gyermek átmenetre alkalmazza a reduced-motion presetet. Ha a `noMotion` értéke `false`, a `reducedMotion="never"` felülírja az operációs rendszer szintű `prefers-reduced-motion` media query-t, így az alkalmazás animáció kapcsolója rendelkezik kizárólagos hatáskörrel.

**Debug overlay-ek és Toaster elhelyezése** a `RootLayout`-on belül:

- A `<Toaster />` a `MotionWrapper`-en belül, de a `<Wrapper>`-en kívül van, az oldaltartalom testvéreként renderelődik.
- Fejlesztői módban (`import.meta.env.DEV`) a `<DebugEffects />`, `<DebugOverlay />`, `<BreakpointOverlay />` és `<ElementInspectorOverlay />` szintén a `MotionWrapper`-en belül, de a `<Wrapper>`-en kívül találhatók.
- A `<ReactQueryDevtools />` a `PersistQueryClientProvider`-en belül, de az `AuthProvider`-en és a többi provider-en kívül van.

**reCAPTCHA scope:** A `GoogleReCaptchaProvider` NEM a `RootLayout`-ban van. Kizárólag a `SignUpPage.tsx`-en belül él, csak a regisztrációs form köré csomagolva. Ez megakadályozza, hogy a reCAPTCHA jelvény és script minden oldalon betöltődjön.

### `src/App.tsx`

A `/app` gyökér átirányítást kezeli. Az `AuthContext`-ből olvassa az `isLoggedIn` és `isInitializing` értékeket. Inicializálás közben egy középre igazított spinnert renderel. Inicializálás után `/app/releases`-re (bejelentkezett) vagy `/app/login`-ra (nem bejelentkezett) irányít.

### `src/Wrapper.tsx`

Az összes oldaltartalmat fogja közre. A `ColorContext`-ből (három gradiens hex szín és a feloldott `animationKey`) és a `SettingsContext`-ből olvas.

**CSS változók kiszámítása és gradiens:** `useMemo`-val számolódik, a három gradiens szín és a `useDarkMode` értékétől függően:

```typescript
const themeAverage = getAverageHexColor([colorLeft, colorMiddle, colorRight]);
const themeAccent       = lightenHexColor(themeAverage, useDarkMode ? 0.08 : 0.02);
const themeAccentHover  = lightenHexColor(themeAverage, useDarkMode ? 0.22 : 0.14);
const themeAccentSoft   = toRgbaColor(themeAverage, useDarkMode ? 0.32 : 0.25);
const themeNavBorder    = themeAverage;
const themeNavShadow    = toRgbaColor(
  lightenHexColor(themeAverage, useDarkMode ? 0.25 : 0.16),
  useDarkMode ? 0.42 : 0.34,
);
```

Öt CSS custom property kerül beállításra a gyökér wrapper `<div>` inline `style` prop-jaként (nem a `document.documentElement`-en):

| Változó | Forrás |
|---|---|
| `--theme-accent` | `lightenHexColor(themeAverage, ...)` |
| `--theme-accent-hover` | `lightenHexColor(themeAverage, ...)` nagyobb értékkel |
| `--theme-accent-soft` | `toRgbaColor(themeAverage, ...)` |
| `--theme-nav-border` | `themeAverage` közvetlenül |
| `--theme-nav-shadow` | `toRgbaColor(lightenHexColor(themeAverage, ...), ...)` |

A `themeAverage` a három gradiens stop szín számtani átlaga. Mind az öt változó cascadel a wrapperen belüli összes elemre.

**Szövegszín:** a `themeClasses.ts`-ből való `getTextColor(useLiquidGlass, useDarkMode)` Tailwind classként kerül a wrapper divra. Liquid glass módban mindig `text-white` az eredmény; nem-glass sötét módban `text-white`; nem-glass világos módban `text-gray-900`.

**Animáció feloldása:**

```
animationOverride === null   → a téma animationKey-jét használja a ColorContext-ből
animationOverride === "none" → nem renderelődik háttér
animationOverride === "custom" && az effectMix-nek van engedélyezett effektje → CompositeBackground
animationOverride === <AnimationKey> → adott AnimatedBackground kényszerítve
```

Ha a `useAnimations` ki van kapcsolva, a háttér továbbra is renderelődik, de `paused={true}`-t kap, ami lefagyasztja az összes canvas/CSS animációt anélkül, hogy lecsatolná őket.

---

## Provider architektúra

A provider-ek a `RootLayout.tsx`-ben ebben a sorrendben vannak egymásba ágyazva:

```
PersistQueryClientProvider   ← React Query cache és localStorage perzisztálás
  AuthProvider               ← azonosság feloldása /users/whoami-ból
    SecurityKeyProvider      ← biztonsági kulcs állapota jelszó-visszaállítási folyamathoz
      SettingsProvider       ← felhasználói preferenciák betöltése minden vizuális render előtt
        NavbarProvider       ← dropdown nyitott/hover állapot
          ColorProvider      ← gradiens színek és animáció kulcs kezelése
            ProfileProvider  ← userId-t igényel (auth-ból) a kiválasztott profil betöltéséhez
              MotionWrapper  ← MotionConfig: globális átmeneti időtartam és reduced-motion
                Wrapper      ← gradiens háttér, CSS változók, animált háttér
                  Suspense   ← középre igazított spinner fallback lazy route-okhoz
                    Outlet   ← tényleges oldaltartalom
                Toaster      ← toast értesítési overlay (Wrapper testvére)
                [DEV] DebugEffects, DebugOverlay, BreakpointOverlay, ElementInspectorOverlay
  [DEV] ReactQueryDevtools   ← összes provider-en kívül, PersistQueryClientProvider-en belül
```

A `ColorProvider`-nek a `SettingsProvider` után kell futnia, mivel az CSS értékek kiszámításakor olvassa a `useLiquidGlass` és `useDarkMode` értékeket. A `ProfileProvider`-nek az `AuthProvider` után kell futnia, mivel a profil query kezeléséhez `userId` szükséges.

---

## Hitelesítés

### Session modell

A session szerver oldalon, HTTP-only cookie segítségével van kezelve. A kliensnek nincs hozzáférése a token értékéhez — ez kiküszöböli az XSS token-lopási támadásokat. Az egyetlen módja, hogy a kliens tudja, hogy hitelesített, a `/api/users/whoami` sikeres meghívása.

### AuthProvider (`src/context/AuthProvider.tsx`)

Mount-oláskor a `useWhoAmIQuery`-n keresztül hívja a `GET /users/whoami`-t. Kétfázisú inicializálási guard-ot használ:

```typescript
const [isAuthSettled, setIsAuthSettled] = useState(false);

useEffect(() => {
  if (isLoading) return;

  if (data?.id) {
    setUserId(BigInt(data.id));
    setIsAdmin(data.role === "admin");
    setIsSupport(data.role === "support");
    setIsLoggedIn(true);
  } else {
    setIsLoggedIn(false);
    setUserId(null);
    setIsAdmin(false);
    setIsSupport(false);
  }

  setIsAuthSettled(true);
}, [data, isLoading]);
```

Az `isInitializing` `true`, amíg a query tölt, vagy az effect még nem futott le. Ez megakadályozza, hogy a router a session ellenőrzés befejezése előtt `/app/login`-ra irányítson.

### AuthContext (`src/context/AuthContext.ts`)

```typescript
interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  isInitializing: boolean;
  userId: bigint | null;
  setUserId: (v: bigint | null) => void;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  isSupport: boolean;
  setIsSupport: (v: boolean) => void;
}
```

A `userId` `bigint`-ként van tárolva, mivel a Go `uint64` meghaladja a JavaScript `number` típus biztonságos egész tartományát.

### RequireAuth (`src/components/RequireAuth.tsx`)

Route guard komponens, amelyet layout route-ként használ a router:

- `isInitializing` `true` → spinner renderelése
- `isLoggedIn` `false` → `<Navigate to="/app/login" state={{ from: location }}>`
- `isLoggedIn` `true` → `<Outlet />` renderelése

A `state.from` location megőrződik, hogy a login oldal sikeres bejelentkezés után vissza tudjon irányítani az eredetileg kért URL-re.

Az admin és debug oldalak másodlagos szerepellenőrzést végeznek a komponensen belül, miután a route guard átment:

```typescript
if (!isAdmin) return <NotFoundPage />;
```

### 401 kezelés az API kliensben

Az `apiClient.ts` egy response interceptorral rendelkezik, amely elkapja a 401 hibákat. Az auth végpontok ki vannak zárva, hogy elkerüljék az átirányítási hurkokat helytelen jelszó megadásakor:

```typescript
const isAuthEndpoint =
  requestUrl.includes("/auth/") || requestUrl.includes("/users/whoami");

if (error.response.status === 401 && !isAuthEndpoint) {
  window.location.href = "/app/login";
  return new Promise(() => {});
}
```

A soha nem feloldódó promise megakadályozza, hogy a folyamatban lévő UI hibaállapotot próbáljon renderelni egy oldalon, amely hamarosan el fog navigálni.

---

## API kliens (`src/lib/apiClient.ts`)

Egy megosztott Axios instance-t hoz létre:

```typescript
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
```

**Request interceptor** két dolgot kezel:

1. **Debug hálózati késleltetés**: a `localStorage["debug-settings"]`-ből olvassa a `networkDelayMs` és `networkJitterMs` értékeket, és a kérés folytatása előtt kiszámított ideig vár.

2. **Content-Type fejléc**: automatikusan `application/json`-t állít be, kivéve ha a body `FormData` objektum, ekkor a fejlécet törli, hogy a böngésző maga állíthassa be a helyes `multipart/form-data; boundary=...` értéket:

```typescript
const isFormData = config.data instanceof FormData;
if (isFormData) {
  delete config.headers["Content-Type"];
  return config;
}
config.headers["Content-Type"] = "application/json";
```

**Response interceptor** a 401 hibákat kezeli a Hitelesítés szekcióban leírtak szerint.

---

## API séma validáció (`src/lib/apiSchemas.ts`)

Zod-ot használ az ismert API válaszok runtime sémáinak meghatározásához. A `validateKnownApiResponse` egy szabálylista alapján egyezteti a HTTP metódust és URL útvonalat:

```typescript
const KNOWN_RESPONSE_SCHEMAS: KnownSchemaRule[] = [
  { method: "post", path: /^\/auth\/login$/,             schema: loginResponseSchema },
  { method: "get",  path: /^\/users\/whoami$/,           schema: whoAmIResponseSchema },
  { method: "get",  path: /^\/users\/\d+\/profiles$/,    schema: profileListSchema },
  { method: "get",  path: /^\/items$/,                   schema: itemListSchema },
  { method: "get",  path: /^\/profiles\/\d+\/purchases$/, schema: purchaseListSchema },
];
```

Ha a válasz adat nem egyezik a sémával, a függvény hibát dob, felsorolva az összes nem megfelelő mezőt. Az egyezetlen route-ok `{ matched: false, data }` értékkel térnek vissza és változatlanul kerülnek továbbításra. Ez a fejlesztés során azonnal felszínre hozza a backend szerződés megszegéseket.

A `useDebug.ts`-ben lévő hook-ok szándékosan megkerülik a `validateKnownApiResponse`-t, mivel a debug végpontok ad-hoc formátumokat adnak vissza, amelyek nem szerepelnek a séma regiszterben.

---

## React Query kulcsok

### Fő query kulcsok (`src/lib/queryKeys.ts`)

```typescript
export const queryKeys = {
  profiles: {
    all: ["profiles"],
    byUserId: (userId: number) => ["profiles", "byUserId", userId],
  },
  githubReleases: { all: ["githubReleases"] },
  characters: {
    all: ["characters"],
    ownedByProfileId: (profileId: number) => ["characters", "owned", profileId],
  },
  purchases: {
    byProfileId: (profileId: number) => ["purchases", "byProfileId", profileId],
  },
};
```

### Admin query kulcsok (`src/hooks/useAdmin.ts`)

```typescript
export const adminQueryKeys = {
  users: {
    all: ["admin", "users"] as const,
    search: (q: string) => ["admin", "users", "search", q] as const,
  },
};
```

### Debug query kulcsok (`src/hooks/useDebug.ts`)

```typescript
export const debugQueryKeys = {
  topItems:   ["debug", "stats", "topItems"] as const,
  topPlayers: ["debug", "stats", "topPlayers"] as const,
  topLevels:  ["debug", "stats", "topLevels"] as const,
  leaderboard:["debug", "stats", "leaderboard"] as const,
  characters: ["debug", "game", "characters"] as const,
  levels:     ["debug", "game", "levels"] as const,
  profiles:   ["debug", "db", "profiles"] as const,
  purchases:  ["debug", "db", "purchases"] as const,
  roles:      ["debug", "db", "roles"] as const,
  categories: ["debug", "db", "categories"] as const,
  rarities:   ["debug", "db", "rarities"] as const,
  posts:      ["debug", "db", "posts"] as const,
};
```

Mindig a kulcs factory-kat kell használni, ne inline string tömböket. Az összes profil query invalidálása így néz ki:

```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.profiles.byUserId(userId) });
```

---

## Hitelesítési hook-ok (`src/hooks/useAuth.ts`)

**`useWhoAmIQuery()`** — `GET /users/whoami`. A `staleTime: 0` és `gcTime: 0` biztosítja, hogy ez a query soha ne a perzisztált cache-ből szolgáljon ki adatot. A `retry: false` azt jelenti, hogy egy 401 azonnal hibát dob újrapróbálkozás nélkül.

A válasz formátuma:

```typescript
interface WhoAmIResponse {
  id: number;
  email: string;
  role: string;         // "admin" | "support" | "user"
  is_banned: boolean;
  last_login: string;
}
```

**`useLoginMutation()`** — `POST /auth/login`, payload: `{ email, password }`. Visszaadja: `{ id, role }`.

**`useSignupMutation()`** — `POST /auth/signup`, payload: `{ email, password, role_id: 1 }`. Visszaadja: `{ id, email, security_key }`.

**`useLogoutMutation()`** — `POST /auth/logout`. Sikeres kijelentkezéskor `queryClient.clear()`-t hív, nem `invalidateQueries`-t. A `clear()` törli a cache-t újralekérések ütemezése nélkül; az `invalidateQueries` az érvénytelen session ellen indítana újralekéréseket, amelyek versenyhelyzetbe kerülnének az átirányítással.

**`useChangePasswordMutation()`** — `PUT /auth/change-password`, payload: `{ email, security_key, new_password }`. Visszaadja: `{ new_key }`. A hívónak kell megjelenítenie az új biztonsági kulcsot a felhasználónak — sehol nincs tárolva.

**`useUpdateUserEmailMutation()`** — `PUT /users/:id`, payload: `{ id, email, role_id: 0 }`. A `role_id: 0` szándékos — a GORM `Updates()` kihagyja a nulla értékű mezőket, így a szerepkör változatlan marad. Sikeres végrehajtáskor invalidálja a `["auth", "whoami"]`-t, hogy a navbar azonnal tükrözze a frissített e-mail címet.

---

## Profil hook-ok (`src/hooks/useProfile.ts`)

**`useProfilesQuery(userId)`** — `GET /users/:id/profiles`. `staleTime: 0` biztosítja, hogy a mutációk mindig friss lekérést indítsanak. Az egyes profilokon az `avatar_url` a `getProfilePictureUrl` által kerül átírásra, amely injektálja a `?v=` cache-busting paramétert.

**`useAddProfileMutation()`** — `POST /users/:id/profiles`. Ha kép is meg van adva, a profil létrehozása után meghívódik az `uploadProfilePicture`. A profil létrehozása akkor is sikerül, ha a feltöltés meghiúsul. Sikeres végrehajtáskor invalidálja és újra lekéri a profil listát.

**`useUploadProfilePictureMutation()`** — `POST /profiles/:id/pfp`, `FormData` body-val. Sikeres végrehajtáskor verziószámot ír a `sessionStorage`-be, és hálózati kérés nélkül frissíti a gyorsítótárban lévő `avatar_url`-t a `queryClient.setQueriesData` segítségével:

```typescript
queryClient.setQueriesData<ProfileResponse[]>(
  { queryKey: queryKeys.profiles.all },
  (cached) =>
    cached?.map((p) =>
      p.id === profileId
        ? { ...p, avatar_url: getProfilePictureUrl(profileId) }
        : p,
    ),
);
```

**`useUpdateProfileMutation()`** — `PUT /profiles/:id`. Optimistic UI-t támogat: a megjelenítési nevet a kérés feloldása előtt azonnal frissíti a cache-ben. Az `invalidateAfterSuccess` flag szabályozza, hogy szükség van-e szerver-oldali újralekérésre.

**`useDeleteProfileMutation()`** — `DELETE /profiles/:id`. Teljes optimista eltávolítás: megszakítja a folyamatban lévő query-ket, pillanatképet készít az aktuális listáról, azonnal eltávolítja a profilt a cache-ből, és hiba esetén visszaállítja a pillanatképet.

---

## Admin hook-ok (`src/hooks/useAdmin.ts`)

### Típusok

**`AdminUserDTO`** — megfelel a backend `UserReadDTO`-jának:

```typescript
interface AdminUserDTO {
  id: number;
  email: string;
  username?: string;   // még nem adja vissza a backend; a UI az emailre esik vissza
  role: string;
  is_banned: boolean;
  banned_until: string; // formázott datetime; üres string = nincs tiltás
  last_login: string;
}
```

**`BanPayload`** — a tiltási kérés frontend-oldali reprezentációja:

```typescript
interface BanPayload {
  ban_type: "permanent" | "temporary";
  ban_until?: string;  // ISO 8601; kötelező, ha ban_type "temporary"
  reason?: string;
}
```

A "permanent" tiltás `PERMANENT_BAN_MINUTES = 1 000 × 365 × 24 × 60` (≈ 50 év) értékkel van közelítve, mivel a backend konkrét `BannedUntil` timestamp-et tárol, nem határozatlan flag-et.

### Query-k

**`useAdminUsersQuery(searchQuery?)`** — `GET /api/users`. `staleTime: 30s`. A backend jelenleg nem támogatja a `?search=` szűrést; az összes szűrés kliens-oldalon történik.

### Mutációk

**`useBanUserMutation()`** — `POST /api/users/:id/ban`, payload: `{ id, period }`, ahol a `period` percben értendő. A `BanPayload`-ot percekre konvertálja a `banPayloadToMinutes` segítségével. Sikeres végrehajtáskor invalidálja az `adminQueryKeys.users.all`-t.

**`useUnbanUserMutation()`** — `POST /api/users/:id/unban`. Nincs body. Sikeres végrehajtáskor invalidálja a felhasználói listát.

**`usePromoteUserMutation()`** — `POST /api/users/:id/promote`, payload: `{ id, target_role: "admin" | "support" }`. Sikeres végrehajtáskor invalidálja a felhasználói listát.

**`useDemoteUserMutation()`** — `POST /api/users/:id/demote`. Nincs body. A felhasználót visszalépteti az alap `"user"` szerepkörre. Sikeres végrehajtáskor invalidálja a felhasználói listát.

---

## Debug hook-ok (`src/hooks/useDebug.ts`)

A fájlban lévő összes hook közvetlenül az `apiClient`-et használja és megkerüli a `validateKnownApiResponse`-t. Egyik típusuk sem szerepel a Zod séma regiszterben.

### DTO-k

| Típus | Mezők |
|---|---|
| `TopItemDTO` | id, name, description, price, rarity, categories[], count_of_purchases |
| `TopPlayerDTO` | id, display_name, coins, count_of_matches |
| `TopLevelDTO` | id, name, img_uri, count_of_plays |
| `BestPlayerDTO` | id, display_name, coins, count_of_wins |
| `DebugCharacterDTO` | id, name, img_uri |
| `DebugLevelDTO` | id, name, img_uri |
| `AdminProfileDTO` | id, display_name, user_id, coins, pfp_uri |
| `PurchaseDTO` | id, player_profile_id, character_id, count |
| `RoleDTO` | id, name |
| `CategoryDTO` | id, name |
| `RarityDTO` | id, name |
| `PostDTO` | id, created_at, updated_at |

### Statisztika query-k (a LeaderboardPage is ezeket használja)

- **`useTopItemsQuery()`** — `GET /stats/top/items`. `staleTime: 60s`.
- **`useTopPlayersQuery()`** — `GET /stats/top/players`. `staleTime: 60s`.
- **`useTopLevelsQuery()`** — `GET /stats/top/levels`. `staleTime: 60s`.
- **`useLeaderboardQuery()`** — `GET /stats/leaderboard`. `staleTime: 60s`.

### Játék adat query-k és mutációk

- **`useDebugCharactersQuery()`** — `GET /characters`. `staleTime: 2m`.
- **`useDebugLevelsQuery()`** — `GET /levels`. `staleTime: 2m`.
- **`useCreateCharacterMutation()`** — `POST /characters`, payload: `{ name }`. Invalidálja a karaktereket.
- **`useUpdateCharacterMutation()`** — `PUT /characters/:id`, payload: `{ name }`. Invalidálja a karaktereket.
- **`useDeleteCharacterMutation()`** — `DELETE /characters/:id`. Invalidálja a karaktereket.
- **`useCreateLevelMutation()`** — `POST /levels`, payload: `{ name }`. Invalidálja a pályákat.
- **`useUpdateLevelMutation()`** — `PUT /levels/:id`, payload: `{ name }`. Invalidálja a pályákat.
- **`useDeleteLevelMutation()`** — `DELETE /levels/:id`. Invalidálja a pályákat.

### DB panel query-k

- **`useAdminProfilesQuery()`** — `GET /profiles?page=1&page_size=200`. `staleTime: 30s`.
- **`useAdminPurchasesQuery()`** — `GET /purchases`. `staleTime: 30s`.
- **`useRolesQuery()`** — `GET /roles`. `staleTime: 5m`.
- **`useCategoriesQuery()`** — `GET /categories`. `staleTime: 5m`.
- **`useRaritiesQuery()`** — `GET /rarities`. `staleTime: 5m`.
- **`usePostsQuery()`** — `GET /posts?page=1&page_size=100`. `staleTime: 30s`.

### DB panel mutációk

- **`useUpdateProfileMutation()`** — `PUT /profiles/:id`, payload: `{ display_name, coins }`. Invalidálja a DB profilokat.
- **`useDeleteProfileMutation()`** — `DELETE /profiles/:id`. Kaszkádol a vásárlásokra. Invalidálja a DB profilokat.
- **`useCreatePurchaseMutation()`** — `POST /purchases`, payload: `{ player_profile_id, character_id }`. A backend automatikusan levonja az érméket. Invalidálja a vásárlásokat.
- **`useUpdatePurchaseMutation()`** — `PUT /purchases/:id`. Invalidálja a vásárlásokat.
- **`useDeletePurchaseMutation()`** — `DELETE /purchases/:id`. Invalidálja a vásárlásokat.
- **`useCreateRoleMutation()`** — `POST /roles`, payload: `{ name }`. Invalidálja a szerepköröket.
- **`useUpdateRoleMutation()`** — `PUT /roles/:id`, payload: `{ name }`. Invalidálja a szerepköröket.
- **`useDeleteRoleMutation()`** — `DELETE /roles/:id`. Invalidálja a szerepköröket.
- **`useCreateCategoryMutation()`** — `POST /categories`, payload: `{ name }`. Invalidálja a kategóriákat.
- **`useUpdateCategoryMutation()`** — `PUT /categories/:id`, payload: `{ name }`. Invalidálja a kategóriákat.
- **`useDeleteCategoryMutation()`** — `DELETE /categories/:id`. Invalidálja a kategóriákat.
- **`useCreateRarityMutation()`** — `POST /rarities`, payload: `{ name }`. Invalidálja a ritkaságokat.
- **`useUpdateRarityMutation()`** — `PUT /rarities/:id`, payload: `{ name }`. Invalidálja a ritkaságokat.
- **`useDeleteRarityMutation()`** — `DELETE /rarities/:id`. Invalidálja a ritkaságokat.
- **`useCreatePostMutation()`** — `POST /posts`. Invalidálja a posztokat.
- **`useUpdatePostMutation()`** — `PUT /posts/:id`. Invalidálja a posztokat.
- **`useUpdateUserMutation()`** — `PUT /users/:id`, payload: `{ email, role_id? }`. Ezen a végponton nem lehet jelszót módosítani. Invalidálja az admin felhasználói listát.
- **`useDeleteUserMutation()`** — `DELETE /users/:id`. Kaszkádol a profilokra, vásárlásokra és meccs rekordokra. Invalidálja az admin felhasználói listát.

---

## Debug beállítások hook (`src/hooks/useDebugSettings.ts`)

Biztosítja a `useDebugSettings()` React hook-ot és a `getDebugSettings()` egyszerű függvényt (amely komponenseken kívülről is hívható). Mindkettő a `localStorage["debug-settings"]`-ből olvas.

A teljes beállítások formátuma:

```typescript
{
  animationSpeed: number;        // a SPEED_TO_MOTION leképezésre kerül a MotionWrapper-ben
  forceReducedMotion: boolean;   // letiltja az összes motion/react átmenetet
  compactDensity: boolean;
  safeAreaOutlines: boolean;
  forceViewportEnabled: boolean;
  forceViewportPreset: string;
  forceViewportWidth: number;
  forceViewportHeight: number;
  noBackdropBlur: boolean;
  layoutBorders: boolean;
  navbarOverride: string;
  networkDelayMs: number;        // az apiClient request interceptora használja
  networkJitterMs: number;       // az apiClient request interceptora használja
  showFps: boolean;
  showScrollPos: boolean;
  showBreakpointBadge: boolean;
  clickTargetChecker: boolean;
  zIndexInspector: boolean;
  elementInspector: boolean;
}
```

A változások egy egyéni DOM eseményen keresztül kerülnek szétküldésre, hogy a komponensfa különböző részein lévő több hook instance React context nélkül is szinkronban maradjon:

```typescript
window.dispatchEvent(new CustomEvent("debug-settings", { detail: next }));
```

---

## Görgetés irány hook (`src/hooks/useScrollDirection.ts`)

```typescript
export function useScrollDirection(threshold = 8): boolean
```

Egy `hidden` boolean értéket ad vissza. Passzív `scroll` eseményfigyelőt csatol a `window`-ra. Az érték csak akkor vált `true`-ra, ha a felhasználó lefelé görget **és** a `scrollY > 80` — ez megakadályozza, hogy a navbar eltűnjön, mielőtt a felhasználó az oldal teteje felett görget. Az érték `false`-ra vált vissza, ha a felhasználó felfelé görget. A `threshold` paraméter (alapértelmezett 8 px) minimális görgetési deltát ír elő, mielőtt az irány rögzítésre kerül, megakadályozva a rugalmas/lendületes görgés miatti vibrálást.

A navbar használja, hogy görgetéskor elrejtse és megmutassa magát.

---

## Hook barrel (`src/hooks/useQueryHooks.ts`)

Mindent re-exportál az `useAuth.ts`-ből és az `useProfile.ts`-ből. Az olyan oldalkomponensek, amelyeknek mindkét fájlból több hook-ra van szükségük, importálhatnak ebből az egyetlen barrel fájlból, két különálló útvonal helyett.

---

## Profilkép gyorsítótárazás

A profilképek a `/api/profiles/:id/pfp` útvonalon vannak kiszolgálva. Mivel a URL útvonal feltöltés után soha nem változik, egy böngésző cache találat örökre a régi képet mutatná. A kliens `sessionStorage`-ban, a `pfp_versions` kulcs alatt, profilonként verziószámot tart nyilván:

```typescript
function getProfilePictureUrl(profileId: number): string {
  const version = pfpVersions.get(profileId);
  return `/api/profiles/${profileId}/pfp${version ? `?v=${version}` : ""}`;
}
```

Sikeres feltöltés után a `Date.now()` értéke kerül az új verzióba. Mivel a verzió `sessionStorage`-ban van, ugyanazon böngészőfülön belüli komponens-remount-okon túl él, de a fül bezárásakor törlődik.

A kliens-oldali validáció a `useProfile.ts`-ben érvényesíti a `MAX_PFP_SIZE_BYTES = 5 * 1024 * 1024` (5 MB) korlátot és ellenőrzi a `file.type`-t az `ACCEPTED_IMAGE_TYPES` listával szemben, mielőtt bármilyen HTTP kérést küld.

---

## Profilok context (`src/pages/profile-selector/ProfilesContext.tsx`)

A **`ProfileProvider`** kezeli az aktív profil kiválasztását. A kiválasztott profil ID-ját `localStorage`-ban tárolja, `userId`-val kulcsolva, így minden felhasználói fiók önállóan emlékezik a saját utoljára kiválasztott profiljára.

Mount-oláskor meghívja a `useProfilesQuery(userId)`-t. Amikor a profilok betöltődnek, visszaállítja a korábban kiválasztott profilt a tárolóból, és az első profilra esik vissza, ha semmi nincs tárolva, vagy a tárolt ID már nem létezik.

A context-en keresztül elérhetők:
- `profiles`: `Profile` objektumok listája, kiszámított `avatar_url`-lel
- `selectedProfile`: az aktuálisan aktív `Profile | null`
- `setSelectedProfile(profile)`: a kiválasztást perzisztálja a tárolóba
- `addProfile(params)` / `deleteProfile(id)`: mutációk cache invalidálással
- `isLoading` / `isError`

**`useProfiles()`** — egyszerű hook, amely a `ProfilesContext`-et olvassa. A navbar és a profile-selector oldal használja.

---

## Beállítások rendszere (`src/pages/settings/SettingsContext.tsx`)

A **`SettingsProvider`** a `localStorage["settings"]`-be perzisztálja a beállításokat. A teljes állapot formátuma:

```typescript
interface SettingsState {
  useAnimations: boolean;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
  language: "en" | "hu";
  animationOverride: AnimationKey | "none" | "custom" | null;
}
```

- `animationOverride: null` — az aktív téma alapértelmezett animációját használja.
- `animationOverride: "none"` — teljesen letiltja a hátteret.
- `animationOverride: "custom"` — aktiválja a kompozit réteg rendszert.
- Bármilyen `AnimationKey` string — témától függetlenül kényszeríti azt az animációt.

A beállítások szinkron módon inicializálódnak a `useState` initializer függvényből, így nincs alapértelmezett-beállítások-villanás betöltéskor. Egy `useEffect` minden frissítés után visszaperzisztálja a változásokat a tárolóba. Egy külön `useEffect` meghívja az `i18n.changeLanguage`-t, ha a `language` megváltozik.

**`useSettings()`** — hook, amely a `SettingsContext`-et olvassa. Visszaadja a `{ settings, updateSetting }` objektumot. Az `updateSetting(key, value)` részleges frissítést alkalmaz.

---

## Szín rendszer (`src/pages/settings/ColorProvider.tsx`)

A **`ColorProvider`** kezeli a három gradiens stop színt (`colorLeft`, `colorMiddle`, `colorRight`), az aktív `animationKey`-t és az `effectMix`-et (kompozit réteg konfiguráció). Minden érték `localStorage`-ba kerül perzisztálásra.

A **`ColorContext`** (`src/pages/settings/ColorContext.ts`) meghatározza a context típusát:

```typescript
interface ColorContextType {
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  setColorLeft: (v: string) => void;
  setColorMiddle: (v: string) => void;
  setColorRight: (v: string) => void;
  animationKey: AnimationKey | null;
  setAnimationKey: (v: AnimationKey | null) => void;
  effectMix: EffectLayerConfig | null;
  setEffectMix: (v: EffectLayerConfig | null) => void;
}
```

Az `effectMix` egy részleges `AnimationKey → SubEffects` leképezés, amely meghatározza, hogy a kompozit módban mely rétegek aktívak.

---

## Téma rendszer (`src/pages/settings/Themes.ts`)

18 előre beállított témát definiál. Minden témának van három gradiens szín stoppja és egy opcionális alapértelmezett animációja:

```typescript
interface Theme {
  name: string;
  colorLeft: string;
  colorMiddle: string;
  colorRight: string;
  animationKey?: AnimationKey;
}
```

| Téma | Animáció |
|---|---|
| Azure | — |
| Slate | Storm |
| Emerald | Sakura |
| Amethyst | Lava Lamp |
| Coral | — |
| Sunset | Sakura |
| Ocean | Fishtank |
| Lavender | Aurora |
| Midnight | Deep Space |
| Fire | Lava Lamp |
| Aurora | Aurora |
| Neon Noir | Synthwave |
| Rose Gold | Sakura |
| Monsoon | Puddle Ripples |
| Nebula | Particle Web |
| Abyss | Bioluminescence |
| Starmap | Constellation |
| Void | Void |

Az `applyTheme(theme, context)` egyetlen hívással írja be a három színt és az animáció kulcsot a `ColorContext`-be:

```typescript
export const applyTheme = (theme: Theme, context: ColorContextType) => {
  context.setColorLeft(theme.colorLeft);
  context.setColorMiddle(theme.colorMiddle);
  context.setColorRight(theme.colorRight);
  context.setAnimationKey(theme.animationKey ?? null);
};
```

---

## Animáció rendszer

### AnimationKey (`src/lib/animationTypes.ts`)

```typescript
type AnimationKey =
  | "fishtank" | "deepspace" | "aurora" | "lavalamp" | "synthwave"
  | "sakura" | "storm" | "particleweb" | "puddleripples" | "bioluminescence"
  | "constellation" | "void";
```

Minden animációnak saját `SubEffects` interfésze van, amely a kapcsolható rétegeket definiálja. Példák:

```typescript
interface FishtankSubEffects {
  showFish: boolean;
  showBubbles: boolean;
  showSeaweed: boolean;
  showCaustics: boolean;
  showLightShafts: boolean;
}

interface StormSubEffects {
  showRain: boolean;
  showLightning: boolean;
  showClouds: boolean;
  showGroundShimmer: boolean;
}
```

A `DEFAULT_SUB_EFFECTS` konstans minden animáció kezdeti állapotát definiálja, az összes réteggel bekapcsolva.

A `hasEnabledEffects(effectMix)` `true`-t ad vissza, ha az `EffectLayerConfig`-ban legalább egy animációnak legalább egy al-effektje engedélyezve van. A `Wrapper` ezt használja annak eldöntéséhez, hogy mountolja-e a `CompositeBackground`-ot.

---

## Háttér komponensek (`src/backgrounds/`)

| Fájl | Feladat |
|---|---|
| `AnimatedBackground.tsx` | Diszpécser: fogad egy `AnimationKey`-t és rendereli a megfelelő hátteret |
| `AuroraBackground.tsx` | Áramló sarki fény effekt |
| `BioluminescenceBackground.tsx` | Mélytengeri biolumineszcencia részecskék |
| `CompositeBackground.tsx` | Több hátteret renderel egymásra rakott `position: absolute` rétegekként |
| `ConstellationBackground.tsx` | Csillagkép összekötő vonalakkal |
| `DeepSpaceBackground.tsx` | Csillagok és köd a mélységes űrben |
| `FishtankBackground.tsx` | Animált akváriumháttér halakkal, buborékokkal, hínárral, kausztikával és fénysugárral |
| `LavaLampBackground.tsx` | Felfelé emelkedő lávafény gömbök |
| `ParticleWebBackground.tsx` | Összekötött részecske háló |
| `PuddleRipplesBackground.tsx` | Animált tócsahatás |
| `SakuraBackground.tsx` | Hulló cseresznyevirág szirmok |
| `StormBackground.tsx` | Eső, villámlás, felhők és talajcsillogás |
| `SynthwaveBackground.tsx` | Retrowave rács és nap |
| `VoidBackground.tsx` | Sötét üresség finom részecske mozgással |

Minden háttérkomponens fogadja a `colorLeft`, `colorMiddle`, `colorRight` és `paused` prop-okat. Ha a `paused` `true`, az összes canvas renderelés és CSS animáció a helyszínen lefagy, anélkül hogy lecsatolódna.

A `CompositeBackground` fogad egy `effectMix`-et (`EffectLayerConfig`) és minden engedélyezett animációt önálló rétegként renderel, `position: absolute` segítségével egymásra rakva. A letiltott al-effektekkel rendelkező rétegek nem mountolódnak.

---

## Animáció primitívek (`src/animations/`)

| Fájl | Feladat |
|---|---|
| `AnimatedAccordion.tsx` | Magasságot animáló accordion ki-/becsukás |
| `AnimatedPress.tsx` | Lenyomás visszajelzés (méret csökkentés) wrapper |
| `CardAnimation.tsx` | Rugó alapú kártya belépési animáció |
| `ColorInterpolation.tsx` | Két szín közötti sima interpoláció az idő múlásával |
| `LoadPost.tsx` | Lépcsőzetes lista-belépési animáció hírekhez |
| `NavbarAnimation.tsx` | Navbar be-/kicsúszás wrapper |

Ezek a komponensek `motion/react` primitíveket burkolnak és projektszabványos átmeneti beállításokat alkalmaznak. Az oldalkomponensek ezeket használják nyers `motion.div` elemek helyett, hogy konzisztensek maradjanak a globális `MotionConfig` időtartam és reduced-motion beállításaival.

---

## Toast rendszer (`src/lib/toast.ts`)

Egy nulla-függőségű pub/sub értesítési rendszer. Modul-szintű `ToastItem` objektum tömböt és listener callback-ek halmazát tartja fenn. A `RootLayout`-ban lévő `Toaster` komponens feliratkozik erre a store-ra.

```typescript
toast.success("Profil mentve.");
toast.error("Feltöltés sikertelen.");
toast.info("Betöltés...");
```

A toast-ok 4000 ms után automatikusan eltűnnek. Nem használ külső könyvtárat.

---

## Lokalizáció (`src/lib/i18n.ts`)

Az i18next-et 12 névtérrel konfigurálja nyelvenként: `auth`, `nav`, `settings`, `profile`, `releases`, `news`, `webstore`, `admin`, `common`, `debug`, `gallery`, `leaderboard`. Mindkét (`en` és `hu`) locale a build idején kerül a bundle-be — nincsenek futásidejű hálózati kérések a fordítási fájlokhoz.

```typescript
i18n.use(initReactI18next).init({
  resources: { en: { auth: enAuth, nav: enNav, /* ... */ }, hu: { /* ... */ } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
```

Az alapértelmezett `lng: "en"` induláskor felülíródik, amikor a `SettingsProvider` meghívja az `i18n.changeLanguage(settings.language)`-t. A komponensek így fogyasztják a fordításokat:

```typescript
const { t } = useTranslation("webstore");
return <p>{t("item.purchase")}</p>;
```

---

## Felhasználónév generátor (`src/lib/generateUsername.ts`)

Két statikus tömbből generál megjelenítési név javaslatokat — **110 melléknév prefix** (Fluffy, Cosmic, Majestic stb.) és **109 suffix**, amelyek állathangokból és természeti szavakból állnak (Paws, Thunder, Ember stb.). A regisztrációs és profil létrehozási folyamatban használják:

```typescript
const { prefix, suffix } = generateRandomUsername();
// Példa: { prefix: "Cosmic", suffix: "Thunder" }
```

---

## Tárgy konstansok (`src/lib/constants/itemConstants.ts`)

```typescript
export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
export const COMBAT_TYPES = ["Melee", "Ranged"] as const;

export const RARITY_COLORS: Record<string, string> = {
  Common:    "#9ca3af",
  Uncommon:  "#10b981",
  Rare:      "#3b82f6",
  Epic:      "#8b5cf6",
  Legendary: "#f59e0b",
};

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
```

Az `ACCEPTED_IMAGE_TYPES` a `useProfile.ts`-ben is hivatkozva van a kép-feltöltések validálásához a HTTP kérés elküldése előtt. A `RARITY_COLORS` hajtja a webáruházban a színes ritkaság-jelölőket.

---

## Komponensek (`src/components/`)

### `ErrorBoundary.tsx`

Osztálykomponens, amely implementálja a `getDerivedStateFromError`-t és a `componentDidCatch`-et. Fogad egy opcionális `fallback` prop-ot. Az alapértelmezett fallback egy "Something went wrong on this page." szöveggel és az `error.message`-gel ellátott középre igazított kártya. Egy "Try again" gomb visszaállítja a `hasError` értékét `false`-ra.

Minden lazy-loadolt route-ot a `withBoundary` csomagol a `main.tsx`-ben. Egy oldal összeomlása az elrendezésen belül rendereli a hibakártyát, anélkül hogy az egész alkalmazást tönkre tenné.

### `RequireAuth.tsx`

Funkcionális komponens, amely a React Router `<Outlet>` mintáját használja. Az `AuthContext`-ből olvassa az `isLoggedIn` és `isInitializing` értékeket. A Hitelesítés szekcióban leírtak szerint működik.

### `ImageCropDialog.tsx`

Dialógus komponens képek vágásához feltöltés előtt. A profilkép feltöltési folyamatokban használják. Megjelenít egy vágási felületet és kibocsátja a vágott `File` vagy `Blob` eredményt, amikor a felhasználó megerősíti.

---

## Navbar context (`src/context/NavbarContext.tsx` / `NavbarContextUtils.ts`)

A **`NavbarProvider`** két boolean értéket tárol:
- `isDropdownHovering` — a mutató az account dropdown trigger felett van-e
- `isDropdownOpen` — nyitva van-e a dropdown menü

**`useNavbarContext()`** — a `NavbarContextUtils.ts`-ből exportált hook. Visszaadja mindkét boolean értéket és a beállítóikat. A `Navbar.tsx` és az `AccountMenu.tsx` használja, hogy koordinálja a hover és nyitott állapotot a testvér komponensek között.

---

## Biztonsági kulcs context (`src/context/SecurityKeyProvider.tsx` / `SecurityKeyContext.ts`)

A **`SecurityKeyProvider`** tárolja:
- `securityKey: string | null` — a regisztrációkor vagy jelszó-visszaállításkor kiállított kulcs
- `isFirstSession: boolean` — szabályozza, hogy megjelenjen-e a "mentsd el a kulcsodat" banner a profil oldalon
- `setSecurityKey(key)` — a kulcs tárolása regisztráció után
- `clearSecurityKey()` — törlés, miután a felhasználó elismerte a bannert
- `markKeySeen()` — elrejti a bannert és perzisztálja az elismert állapotot `localStorage`-ba, hogy frissítés után se jelenjen meg újra

**`useSecurityKey()`** — hook, amely a `SecurityKeyContext`-et olvassa. A regisztrációs folyamat és a profil oldal használja.

---

## Segédfüggvények

### `src/lib/utils.ts` — barrel

Minden függvényt re-exportál az öt utility modulból:

```typescript
export * from "./utils/classnames";
export * from "./utils/dateFormat";
export * from "./utils/liquidGlass";
export * from "./utils/themeClasses";
export * from "./utils/colorMath";
export * from "./utils/sectionStyle";
```

Az egyedi fájlok helyett ebből a barrel-ből kell importálni (`@/lib/utils`).

### `cn(...inputs)` (`src/lib/utils/classnames.ts`)

Kombinálja a `clsx`-t és a `tailwind-merge`-öt egyetlen függvénybe. Helyesen oldja fel a Tailwind konfliktusokat (pl. `cn("p-2", "p-4")` → `"p-4"`) és kezeli a `clsx`-ből érkező feltételes class objektumokat és tömböket:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `extractErrorMessage(error, fallback)` (`src/lib/utils/extractErrorMessage.ts`)

Ember-olvasható stringet nyer ki egy Axios hibából. A Go backend három formátumot adhat vissza:

| Válasz formátum | Kinyerés |
|---|---|
| `{ error: "üzenet" }` | `data.error` |
| `{ message: "üzenet" }` | `data.message` |
| `"sima string"` | `data` közvetlenül |

Az Axios beépített `error.message`-re esik vissza (pl. `"Network Error"`), majd a `fallback` argumentumra.

### `formatDate(value)` / `formatDateTime(value)` (`src/lib/utils/dateFormat.ts`)

Mindkettő fogad `DateTime | Date | string | undefined | null` típust. Luxon-t használ belül. A `formatDate` `DATE_MED` formátumot ad (pl. "Apr 22, 2026"). A `formatDateTime` `DATETIME_MED` formátumot ad (pl. "Apr 22, 2026, 3:45 PM"). Hamis bemenetekre `""`-t ad vissza. `DateTime.fromISO`-n, majd `DateTime.fromJSDate(new Date(...))`-n keresztül próbál értelmezni, és ha egyik sem sikerül, a nyers stringet adja vissza.

### Liquid glass segédprogramok (`src/lib/utils/liquidGlass.ts`)

Minden függvény `""`-t ad vissza, ha a `useLiquidGlass` értéke `false` — a hívók biztonságosan összefűzhetik a visszatérési értéket más class stringekkel anélkül, hogy ellenőriznék.

| Függvény | Feladat |
|---|---|
| `getLiquidGlassClasses(useLiquidGlass, useDarkMode, variant?)` | Panel/kártya háttér. `variant`: `"base"` (alap) \| `"input"` \| `"accent"` |
| `getLiquidGlassTextShadow(useLiquidGlass, useDarkMode)` | Szövegárnyék az olvashatóság érdekében üvegen |
| `getLiquidGlassHighlight(useLiquidGlass, useDarkMode)` | Kiemelő csík egy glass elemen belül |
| `getLiquidGlassNavHighlight(useLiquidGlass, useDarkMode)` | Navbar elemekhez való kiemelő változat |
| `getLiquidGlassDialogClasses(useLiquidGlass, useDarkMode)` | Dialógus/modal felszín |
| `getLiquidGlassDialogFooterClasses(useLiquidGlass, useDarkMode)` | Dialógus lábléc szegély és padding |
| `getLiquidGlassControlClasses(useLiquidGlass, useDarkMode)` | Beviteli mező/textarea/select dialóguson belül |

### Téma class segédprogramok (`src/lib/utils/themeClasses.ts`)

Minden függvény fogad `(useLiquidGlass, useDarkMode)` paramétert és Tailwind class stringet ad vissza.

| Függvény | Feladat |
|---|---|
| `getTextColor(useLiquidGlass, useDarkMode)` | Elsődleges szövegszín (`text-white` vagy `text-gray-900`) |
| `getSubtextColor(useLiquidGlass, useDarkMode)` | Tompított/másodlagos szövegszín |
| `getTextShadow(useLiquidGlass, useDarkMode)` | Szövegárnyék a kontraszthoz |
| `getBackgroundClasses(useLiquidGlass, useDarkMode, variant?)` | Kártya/konténer háttér. `variant`: `"base"` \| `"light"` \| `"strong"` |
| `getButtonClasses(useLiquidGlass, useDarkMode, variant?)` | Gomb stílusok. `variant`: `"primary"` \| `"secondary"` \| `"outline"` |
| `getInputClasses(useLiquidGlass, useDarkMode)` | Beviteli mező stílusok |
| `getDialogClasses(useLiquidGlass, useDarkMode)` | Modal/dialógus felszín |
| `getDialogFooterClasses(useLiquidGlass, useDarkMode)` | Dialógus lábléc szegély |

### `sectionStyle(animReady, delayMs)` (`src/lib/utils/sectionStyle.ts`)

`CSSProperties` objektumot ad vissza egy fade + slide-in animációhoz:

```typescript
export function sectionStyle(animReady: boolean, delayMs: number): CSSProperties {
  return {
    opacity: animReady ? 1 : 0,
    transform: animReady ? "translateY(0px)" : "translateY(10px)",
    transition: animReady
      ? `opacity 200ms ease-out ${delayMs}ms, transform 200ms ease-out ${delayMs}ms`
      : "none",
    willChange: "opacity, transform",
  };
}
```

Az `animReady` `false`-ról `true`-ra vált, miután egy kártya belépési rugóanimáció befejeződik. Amíg `false`, a szakasz láthatatlan és nincs kompozitálva, ami a fő teljesítményelőny.

### Szín matematika (`src/lib/utils/colorMath.ts`)

| Függvény | Szignatúra | Feladat |
|---|---|---|
| `getAverageHexColor` | `(colors: string[]) => string` | Több hex szín számtani átlaga |
| `lightenHexColor` | `(hex: string, amount?: number) => string` | Fehérrel való keverés; `amount` 0–1 |
| `toRgbaColor` | `(hex: string, alpha?: number) => string` | Konvertálás `rgba(r, g, b, a)` formátumra |
| `hexToRgbTuple` | `(hex: string) => [number, number, number]` | `[r, g, b]` tömböt ad canvas műveletekhez |
| `lerp` | `(a: number, b: number, t: number) => number` | Lineáris interpoláció |

Mindkét 3-karakteres rövid formátum (`#abc`) és 6-karakteres (`#aabbcc`) hex bemenet elfogadott és normalizált. Érvénytelen bemenetek `"#808080"`-ra esnek vissza.

### `useForwardedRef(ref)` (`src/lib/useForwardedRef.tsx`)

```typescript
export function useForwardedRef<T>(ref: React.ForwardedRef<T>): React.RefObject<T>
```

Normalizál egy `React.ForwardedRef<T>`-t (amely callback ref vagy `RefObject` lehet) egy stabil `RefObject`-té. Mindkét esetet kezeli:

- **Callback ref**: a `useEffect`-ben meghívja a `ref(innerRef.current)`-et, és cleanup-kor törli.
- **Object ref**: `Object.assign`-t használ, hogy beírja az `innerRef.current` értékét a `ref.current`-be.

Visszaadja a belső `RefObject`-et, hogy a felhasználó mindig közvetlenül a `.current`-et használhassa.

---

## Oldalspecifikus funkciók

### Hírek (`src/pages/news/`)

**`useNewsPosts`** — lekéri, létrehozza, frissíti és törli a hírek posztokat. Szerver-oldali keresést és végtelen görgetést (kurzor alapú lapozás) valósít meg. A kategória szűrő szerver-oldalon kerül alkalmazásra. Minden posztnak van kategóriája, címe, törzse (Markdown) és opcionális képe.

**`useNewsForm`** — form állapot a posztok létrehozásához és szerkesztéséhez. Kezeli a képfájl kiválasztást, az előnézetet és a beküldési folyamatot.

**`useNewsCategoryFilter`** — kezeli az aktív kategória szűrőt. Kategóriák: Major update, Minor update, Patch, Unrelated news. Egy kategória váltásakor frissíti a `useNewsPosts` query paraméterét.

Az admin és support fiókok látják a létrehozás/szerkesztés/törlés vezérlőket. A sima felhasználói fiókok csak olvasási módban látják a feedet.

### Admin (`src/pages/admin/`)

**`useAdminPageLogic`** — az admin panel orchestrálása: felhasználói lista, kliens-oldali keresési szűrés az `useAdminUsersQuery` adatain, lapozás és kiválasztási állapot. Stílusozási segédprogramokat is biztosít (a `useLiquidGlass` és `useDarkMode` flag-eket átadja az admin-specifikus UI helyes class stringjeinek előállításához).

**`useBanDialogLogic`** — a tiltás dialógus állapotát kezeli. Előre beállított időtartamok: 1 nap, 1 hét, 1 hónap, végleges. Egyéni dátumtartomány választó állapotot biztosít tetszőleges lejárati dátumokhoz. A kiválasztott időtartamot `BanPayload`-ra konvertálja, amelyet a `useBanUserMutation`-nak ad át.

### Kiadások (`src/pages/releases/`)

**`useReleases`** — a GitHub Releases API-ból kéri le a játék kliens letöltési kiadásait. OS alapú szűrést (Windows, macOS, Linux) és végtelen görgetést valósít meg. A `staleTime` konfigurálva van a túlzott GitHub API hívások elkerülésére.

### Webáruház (`src/pages/webstore/`)

**`useItems`** — lekéri a tárgy katalógust. Támogatja a vásárlást (az aktív profil érméiből levon), és admin fiókok számára tárgyak létrehozását, frissítését és törlését. A szűrők ritkaság, harci típus és tulajdonlási állapot szerint kliens-oldalon kerülnek alkalmazásra.

**`ItemFilters`** — komponens, amely a szűrő chip sort rendereli. Fogad `label`, `options`, `selected` és `onSelect` prop-okat. A téma-tudatos stílusozáshoz az `useSettings`-t olvassa.

### Galéria (`src/pages/gallery/`)

**`ostTracks.ts`** — két hangsáv statikus tömbje (cím és `src` elérési út az `src/assets/`-ba). Az OST fül audiojátékosa fogyasztja.

### Ranglista (`src/pages/leaderboard/`)

Az `useDebug.ts`-ből használja az `useTopPlayersQuery`-t és az `useLeaderboardQuery`-t. Az oldal kategória fülekre van osztva, amelyek mindegyike különböző statisztika query-re épül. A top három bejegyzés emelvény elrendezést kap; az alatta lévő teljes lista játékos névre szűrhető.

### Debug (`src/pages/debug/`)

Az `useDebug.ts`-ből a hook-ok teljes készletét használja — statisztika query-k, játék adat query-k és mutációk, DB panel query-k és mutációk. Fülekre szervezve: Stats, Characters, Levels, Profiles, Purchases, Roles, Categories, Rarities, Posts, Users.

---

## Build konfiguráció (`vite.config.ts`)

A manuális chunk szétválasztás megakadályoz egy nagy bundle képzését:

```typescript
manualChunks(id) {
  if (id.includes("@tanstack/react-query"))  return "query-vendor";
  if (id.includes("motion") || id.includes("lucide-react")) return "ui-vendor";
  if (id.includes("react-markdown") || id.includes("remark-gfm")) return "markdown-vendor";
  if (id.includes("luxon"))   return "date-vendor";
  if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/")) return "react-vendor";
  if (id.includes("/src/backgrounds/"))  return "backgrounds";
  if (id.includes("/src/pages/debug/") || id.includes("/src/pages/admin/")) return "ops-pages";
}
```

A `backgrounds` chunk külön van választva, mivel a háttérkomponensek nagy canvas renderelési kódot tartalmaznak, amelyek csak akkor töltődnek be, amikor a `Wrapper` rendereli őket. Az `ops-pages` chunk az admin és debug kódot tartja ki a fő bundle-ből, mivel a legtöbb felhasználó soha nem látogatja ezeket az oldalakat.

A kimenet a `../build/client`-be kerül. Egy bundle méret riport generálódik a `./build/stats.html`-re a `rollup-plugin-visualizer` által.

A fejlesztői szerver proxylja a `/api/*` kéréseket a `http://localhost:8080`-ra, hogy a frontend egy helyi backendel szemben fejleszthető legyen CORS konfiguráció nélkül.

Teszt környezet: `jsdom`. Setup fájl: `./src/test-setup.ts`. A globálisok (`describe`, `it`, `expect`, `vi`) minden tesztfájlban elérhetők import nélkül.

---

## Konvenciók

### Téma és glass segédprogramok

Minden olyan komponensnek, amely témázott UI-t renderel, a `src/lib/utils/themeClasses.ts`-ből és a `src/lib/utils/liquidGlass.ts`-ből kell használnia a megosztott segédprogramokat. Az olyan inline ternáris láncok írása, mint a `useDarkMode ? "text-white" : "text-black"`, megkerüli a téma rendszert és megnehezíti a jövőbeli globális változtatásokat.

### Query kulcs használat

Mindig a `queryKeys.*`, `adminQueryKeys.*` vagy `debugQueryKeys.*` értékeket kell használni inline string tömbök helyett. Ez megelőzi a cache kulcs elgépeléseket és megkönnyíti az adott query összes fogyasztójának megtalálását.

### Locale fájlok

Minden felhasználó-felé néző stringnek szerepelnie kell mind az `src/locales/en/*.json`-ban, mind az `src/locales/hu/*.json`-ban. Mindkét fájlba egyszerre kell hozzáadni.

### Nincs style tag a komponensekben

Az összes `@keyframes` definíciónak az `src/index.css`-ben kell lennie. A komponensek nem injektálhatnak `<style>` elemeket. A Tailwind tetszőleges `animate-[...]` szintaxisa, vagy a globális stíluslapból hivatkozott keyframe nevekre mutató inline `style` attribútumok a helyes megközelítés.

### FormData feltöltések

Amikor az `apiClient`-et fájlok feltöltésére használják, a `FormData` objektumot kell request body-ként átadni, és nem szabad manuálisan beállítani a `Content-Type`-ot. A request interceptor érzékeli a `FormData`-t és eltávolítja a fejlécet, hogy a böngésző automatikusan beállíthassa a helyes `multipart/form-data; boundary=...` értéket.

### Utility barrel import

A segédprogramokat az `@/lib/utils` barrel-ből kell importálni, nem az egyes `src/lib/utils/` alatti fájlokból. A barrel mindent re-exportál és ez a kanonikus import útvonal.
