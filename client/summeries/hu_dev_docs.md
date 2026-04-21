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
    main.tsx               router definíció, lazy-loadolt route-ok
    RootLayout.tsx         globális provider-ek, React Query kliens
    App.tsx                gyökér átirányítás (login vs releases)
    Wrapper.tsx            háttéranimáció, CSS változó kibocsátás
    index.css              globális stílusok, CSS animációk @keyframes-ei
    context/               React context-ek és provider-eik
    hooks/                 React Query hook-ok (adatlekérés)
    lib/                   közös segédprogramok, konstansok, sémák, konfig
    components/            közös UI komponensek és route guard-ok
    backgrounds/           animált háttér komponensek
    animations/            motion wrapperek és animációs primitívek
    pages/                 feature oldalak (oldalanként egy könyvtár)
    locales/               i18n JSON fájlok (en/, hu/)
    assets/                statikus fájlok (zászlók, OS logók, hangsávok)
  summeries/               dokumentációs fájlok (ez a könyvtár)
  vite.config.ts
  tsconfig.app.json
```

---

## Belépési pontok

### `src/main.tsx`

Létrehozza a React Router-t `createBrowserRouter`-rel. Az autentikációs oldalak (login, signup, jelszóvisszaállítás) eager importálva vannak, tehát az első bundle-ben szerepelnek — a felhasználók először ezeket érik el, és soha ne kelljen várniuk rájuk. Az összes többi oldal `React.lazy`-vel van lazy-loadolva:

```typescript
const ReleasesPage = lazy(() =>
  import("./pages/releases/ReleasesPage.tsx").then((m) => ({
    default: m.ReleasesPage,
  })),
);
```

A védett route-ok egy `RequireAuth` outlet-be vannak csomagolva. Minden lazy-loadolt route ezenkívül `withBoundary`-ba van csomagolva, amely egy `ErrorBoundary`-t helyez köré, így az egyik oldalon bekövetkező hiba nem dönti le az egész alkalmazást:

```typescript
{ path: "/app/releases", element: withBoundary(<ReleasesPage />) }
```

### `src/RootLayout.tsx`

A React Router által renderelt szülőkomponens az összes route felett. Tartalmazza a React Query klienst, az összes context provider-t és a Suspense fallback-et. A fallback egy közép-igazított CSS spinner, hogy a felhasználók látjanak aktivitást a lazy-load közben.

A React Query kliens konfigurációja:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,   // 2 perc, mielőtt háttérbeli újralekérés
      gcTime: 10 * 60 * 1000,      // 10 perc, mielőtt cache eltávolítás
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
```

A kliens `PersistQueryClientProvider`-t használ `createSyncStoragePersister`-rel `localStorage` háttérrel. Ez azt jelenti, hogy a query cache túléli a kemény böngészőfrissítést. Az autentikációs query-k (`whoami`) szándékosan ki vannak zárva a perzisztenciából (`gcTime: 0`), hogy egy elavult session soha ne kerüljön kiszolgálásra a cache-ből.

Fejlesztési módban a `ReactQueryDevtools` és négy debug overlay komponens kerül csatolásra a fa végére.

A `MotionWrapper` komponens a `RootLayout`-on belül beolvassa az `animationSpeed` értékét a debug beállításokból, és azt a motion/react átmenet időtartammá alakítja:

```typescript
const SPEED_TO_MOTION: Record<number, number> = {
  0.25: 2,    // nagyon lassú
  0.5:  0.8,
  1:    0.3,  // alapértelmezett
  2:    0.1,
  4:    0.05, // nagyon gyors
};
```

Ez teszi lehetővé, hogy az alkalmazás összes motion/react átmenete reagáljon a debug sebességcsúszkára.

---

## Provider architektúra

A provider-ek szándékos sorrendben vannak egymásba ágyazva a `RootLayout.tsx`-ben. Mindegyik az felette lévőktől függ:

```
PersistQueryClientProvider  ← React Query cache; legkülső kell legyen
  AuthProvider              ← identitást old fel a /users/whoami-ból
    SecurityKeyProvider     ← biztonsági kulcs állapot a jelszóvisszaállítási folyamathoz
      SettingsProvider      ← téma kapcsolókat tölt, mielőtt bármi vizuális renderelne
        NavbarProvider      ← legördülő nyitott/hover állapot
          ColorProvider     ← CSS változókat bocsát ki a gradiens színekből
            ProfileProvider ← userId-re van szüksége (az auth-ból) a kiválasztott profil betöltéséhez
              MotionWrapper ← globális animációs sebességet alkalmaz
                Wrapper     ← háttéranimáció és layout keret
                  Outlet    ← tényleges oldalak tartalma
```

A sorrend megfordítása csendben elront dolgokat. A `ColorProvider`-nek a `SettingsProvider` után kell futnia, mert `useLiquidGlass` és `useDarkMode` kapcsolókat olvas ki a CSS változók kibocsátásakor.

---

## Autentikáció

### Hogyan működik

A session kezelése szerver oldalon történik HTTP-only cookie-n keresztül. A kliensnek nincs hozzáférése a token értékéhez — ez kiküszöböl egy egész XSS token-lopás támadásosztályt.

Csatoláskor az `AuthProvider` meghívja a `GET /api/users/whoami` végpontot a React Query `useWhoAmIQuery` hook-on keresztül. A válasz alakja:

```typescript
interface WhoAmIResponse {
  id: number;
  email: string;
  role: string;        // "admin" | "support" | "user"
  is_banned: boolean;
  last_login: string;
}
```

A provider egy kétfázisú inicializálási guard-ot használ. Miután a `whoami` query feloldódik, egy `useEffect` fut és több állapot setter-t hív ugyanabban a React 18 kötegelt renderben. Egy külön `isAuthSettled` boolean csak akkor vált `true`-ra, miután ez az effekt lefutott:

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

Az `isInitializing` értéke `true`, amíg vagy a query tölt, vagy az effekt még nem futott le. A `RequireAuth` spinner-t mutat ebben az ablakban, hogy megakadályozza az idő előtti átirányítást a `/app/login`-ra.

### Route-védelem

A `RequireAuth` az `isLoggedIn` és `isInitializing` értékeket olvassa az `AuthContext`-ből:

- Ha `isInitializing` true: spinner renderelése.
- Ha `isLoggedIn` false: `<Navigate to="/app/login">` `state.from` értékkel a megkísérelt útvonalra, hogy a felhasználó bejelentkezés után visszairányítható legyen.
- Ha `isLoggedIn` true: `<Outlet />` renderelése.

A debug és admin oldalak másodlagos szerepkör-ellenőrzést végeznek a komponens szintjén, miután a route guard átengedi:

```typescript
if (!isAdmin) return <NotFoundPage />;
```

### 401-es kezelés az API kliensben

A `src/lib/apiClient.ts` tartalmaz egy response interceptor-t, amely elkapja a 401-es hibákat. Az autentikációs végpontok (`/auth/` és `/users/whoami`) ki vannak zárva az átirányításból, hogy elkerülje az átirányítási hurkot, amikor a felhasználó rossz jelszót ad meg (ami szintén 401-et ad vissza):

```typescript
const isAuthEndpoint =
  requestUrl.includes("/auth/") || requestUrl.includes("/users/whoami");

if (error.response.status === 401 && !isAuthEndpoint) {
  window.location.href = "/app/login";
  return new Promise(() => {});  // soha nem oldódik fel — megállítja a downstream hibakezelőket
}
```

A soha fel nem oldódó promise megakadályozza, hogy bármilyen folyamatban lévő UI hibaállapotot próbáljon renderelni egy oldalon, amelyről éppen navigálnak el.

---

## API kliens

A `src/lib/apiClient.ts` létrehoz egy megosztott Axios instance-t:

```typescript
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
```

A request interceptor két dolgot kezel:

1. **Debug hálózati késleltetés**: beolvassa a `networkDelayMs` és `networkJitterMs` értékeket a `localStorage["debug-settings"]`-ből, és a kiszámított időtartamig alszik, mielőtt a kérés folytatódna. Ez lassú hálózatokat szimulál fejlesztés közben.

2. **Content-Type fejléc**: automatikusan `application/json`-t állít be, kivéve, ha a test egy `FormData` objektum, amelynek esetén a `Content-Type` fejlécet törli, hogy a böngésző automatikusan beállíthassa a helyes `multipart/form-data; boundary=...` értéket.

```typescript
const isFormData = config.data instanceof FormData;
if (isFormData) {
  delete config.headers["Content-Type"];  // hagyja a böngészőt beállítani a multipart boundary-t
  return config;
}
config.headers["Content-Type"] = "application/json";
```

---

## API séma validáció

A `src/lib/apiSchemas.ts` Zod-ot használ runtime sémák definiálásához az ismert API végpontokhoz. A `validateKnownApiResponse` egy HTTP metódust és URL útvonalat illeszt szabályok listájához, és validálja a válasz adatát:

```typescript
const KNOWN_RESPONSE_SCHEMAS: KnownSchemaRule[] = [
  { method: "post", path: /^\/auth\/login$/,         schema: loginResponseSchema },
  { method: "get",  path: /^\/users\/whoami$/,        schema: whoAmIResponseSchema },
  { method: "get",  path: /^\/users\/\d+\/profiles$/, schema: profileListSchema },
  { method: "get",  path: /^\/items$/,                schema: itemListSchema },
  { method: "get",  path: /^\/profiles\/\d+\/purchases$/, schema: purchaseListSchema },
];

export function validateKnownApiResponse(method, url, data) {
  const path = normalizePath(url);  // levágja a query stringet, biztosítja a vezető perjelet
  for (const rule of KNOWN_RESPONSE_SCHEMAS) {
    if (rule.method !== method || !rule.path.test(path)) continue;
    const parsed = rule.schema.safeParse(data);
    if (!parsed.success) throw new Error(`[API schema validation failed] ...`);
    return { matched: true, data: parsed.data };
  }
  return { matched: false, data };  // nincs illeszkedő szabály — változatlanul átengedi
}
```

Ha a backend nem a sémának megfelelő alakú adatot küld vissza, a függvény hibát dob, amely felsorolja az összes validációt megbuktató mezőt. Ez fejlesztés közben azonnal felszínre hozza a backend törésváltozásait, ahelyett, hogy csendes runtime hibákat okozna később.

---

## React Query hook-ok

Minden adatlekérés a `src/hooks/` alatt él. A query key struktúra a `src/lib/queryKeys.ts`-ben van centralizálva:

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

A factory használata az összes `queryKey` argumentumnál biztosítja, hogy a cache invalidációs célok ne legyenek gépelési hibával érintve. Egy felhasználó összes profil query-jának invalidálása így néz ki:

```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.profiles.byUserId(userId) });
```

### Auth hook-ok (`src/hooks/useAuth.ts`)

`useWhoAmIQuery`: `GET /users/whoami`. A `staleTime: 0` és `gcTime: 0` biztosítja, hogy ez a query soha ne szolgáltasson ki elavult adatot a perzisztált cache-ből. A `retry: false` azért van beállítva, hogy egy 401 azonnal hibázzék, ne próbálkozzon újra.

`useLoginMutation`: `POST /auth/login` `{ email, password }` tartalmmal. Visszaadja az `{ id, role }` adatokat.

`useSignupMutation`: `POST /auth/signup` `{ email, password, role_id: 1 }` tartalmmal. Visszaadja az `{ id, email, security_key }` adatokat.

`useLogoutMutation`: `POST /auth/logout`. Siker esetén `queryClient.clear()`-t hív `invalidateQueries` helyett. A különbség lényeges: az `invalidateQueries` újralekérést indítana az összes aktív query-n, amelyek a most már nem érvényes session ellen futnak, és 401-et kapnak vissza, ami az átirányítási interceptor-t indítja el, és versenyzik a React Router puha navigációval. A `clear()` törli a cache-t anélkül, hogy bármilyen újralekérést ütemezne.

`useChangePasswordMutation`: `PUT /auth/change-password` `{ email, security_key, new_password }` tartalmmal. Visszaadja az `{ new_key }` értéket — a hívó felelős az új biztonsági kulcs megjelenítéséért a felhasználónak.

`useUpdateUserEmailMutation`: `PUT /users/:id` `{ id, email, role_id: 0 }` tartalmmal. A `role_id: 0` szándékos — a GORM `Updates()` hívása kihagyja a nulla értékű mezőket, tehát a szerepkör változatlan marad. Siker esetén invalidálja az `["auth", "whoami"]` kulcsot, hogy a navigációs sáv azonnal tükrözze az új e-mail címet.

### Profil hook-ok (`src/hooks/useProfile.ts`)

`useProfilesQuery(userId)`: `GET /users/:id/profiles`. Visszaad egy profil listát `avatar_url`-lel kiegészítve a `getProfilePictureUrl` segítségével. A `staleTime: 0` biztosítja, hogy a mutációk mindig friss lekérést indítsanak.

`useAddProfileMutation`: `POST /users/:id/profiles`. A profil létrehozása után meghívja az `uploadProfilePicture`-t, ha volt kép megadva. A profil létrehozása akkor is sikerül, ha a feltöltés sikertelen. Siker esetén invalidálja és azonnal újra lekéri a profil listát.

`useUploadProfilePictureMutation`: `POST /profiles/:id/pfp` `FormData` tartalmmal. Siker esetén egy verziószámot ír a `sessionStorage`-ba, és frissíti a cached `avatar_url`-t a `queryClient.setQueriesData` segítségével hálózati kérés nélkül:

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

Az URL-en lévő `?v=timestamp` query paraméter kényszeríti a böngészőt az image újralekérésére, még akkor is, ha az útvonal változatlan.

`useUpdateProfileMutation`: `PUT /profiles/:id`. Támogatja az optimista UI-t — ha az `optimistic` opció nincs explicit `false`-ra állítva, a megjelenített nevet azonnal frissíti a cache-ben, mielőtt a kérés megoldódna. Az `invalidateAfterSuccess` jelző szabályozza, hogy ezután van-e újralekérés.

`useDeleteProfileMutation`: `DELETE /profiles/:id`. Teljes optimista eltávolítást valósít meg: megszakítja a folyamatban lévő query-ket, pillanatfelvételt készít az előző listáról, azonnal eltávolítja a profilt a cache-ből, és hiba esetén visszagörget a pillanatfelvételre.

---

## Profilkép cache-elés

A profilképek a `/api/profiles/:id/pfp` útvonalon vannak kiszolgálva. Mivel az URL útvonal feltöltés után nem változik, egy böngészőcache találat örökké a régi képet mutatná. A kliens egy verziószámlálót tart profil-anként a `sessionStorage`-ban a `pfp_versions` kulcs alatt:

```typescript
function getProfilePictureUrl(profileId: number): string {
  const version = pfpVersions.get(profileId);
  return `/api/profiles/${profileId}/pfp${version ? `?v=${version}` : ""}`;
}
```

Sikeres feltöltés után a `Date.now()` értéke kerül be mint új verzió. Mivel a verzió a `sessionStorage`-ban van tárolva, túléli a komponens lecsatolásait ugyanabban a böngészőlapon.

---

## Beállítások rendszer

A `src/pages/settings/SettingsContext.tsx` a beállításokat a `localStorage["settings"]`-ben tárolja. A teljes állapot alakja:

```typescript
interface SettingsState {
  useAnimations: boolean;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
  language: "en" | "hu";
  animationOverride: AnimationKey | "none" | "custom" | null;
}
```

Az `animationOverride: null` azt jelenti, hogy az aktív téma alapértelmezett animációját kell használni. A `"none"` letiltja a hátteret. A `"custom"` aktiválja a kompozit réteg rendszert. Bármilyen `AnimationKey` string kényszeríti azt az adott animációt.

A beállítások inicializálása a `useState` inicializáló függvényből szinkron módon, tárolásból történik, ami azt jelenti, hogy nincs alapértelmezett beállítások villanása betöltéskor. Egy `useEffect` minden frissítés után visszamenti a változásokat a tárolóba. Egy külön `useEffect` hívja az `i18n.changeLanguage`-t, amikor a nyelv beállítás megváltozik.

---

## Animációs rendszer

### A 12 animáció

A `src/lib/animationTypes.ts`-ben van definiálva:

```typescript
type AnimationKey =
  | "fishtank" | "deepspace" | "aurora" | "lavalamp" | "synthwave"
  | "sakura" | "storm" | "particleweb" | "puddleripples" | "bioluminescence"
  | "constellation" | "void";
```

Minden animációnak van egy `SubEffects` interface-e, amely meghatározza, milyen rétegeket támogat. Például:

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

A `DEFAULT_SUB_EFFECTS` konstans meghatározza minden animáció kezdeti állapotát az összes engedélyezett réteggel.

### Téma-animáció leképezés

A `src/pages/settings/Themes.ts` 18 témát definiál. Mindegyik opcionálisan tartalmaz egy `animationKey`-t. Amikor a felhasználó témát választ és az `animationOverride` értéke `null`, a témából származó animáció kerül használatra. Ha az `animationOverride` bármilyen nem-null értékre van állítva, a téma animációja figyelmen kívül marad.

```typescript
export const THEMES: Theme[] = [
  { name: "Midnight", colorLeft: "#232526", colorMiddle: "#414345", colorRight: "#000000", animationKey: "deepspace" },
  { name: "Ocean",    colorLeft: "#2e3192", colorMiddle: "#1bffff",  colorRight: "#1e9600", animationKey: "fishtank" },
  // ...
];
```

Téma alkalmazása:

```typescript
export const applyTheme = (theme: Theme, context: ColorContextType) => {
  context.setColorLeft(theme.colorLeft);
  context.setColorMiddle(theme.colorMiddle);
  context.setColorRight(theme.colorRight);
  context.setAnimationKey(theme.animationKey ?? null);
};
```

### Kompozit háttér

Amikor az `animationOverride === "custom"`, a `CompositeBackground` csatolódik. Beolvassa az `EffectLayerConfig`-ot (az `AnimationKey`-ből `SubEffects`-re való részleges leképezést) a szín beállításokból, és minden engedélyezett animációt független rétegként renderel `position: absolute` segítségével. Az engedélyezett aleffektusok nélküli rétegek tisztán lecsatolódnak.

### CSS alapú animációk

Az összes `@keyframes` blokk a `src/index.css`-ben él. A háttér komponensek Tailwind tetszőleges animáció szintaxisán vagy inline style string-eken keresztül hivatkoznak rájuk. Egyetlen `<style>` tag sem kerül injektálásra a komponens render outputban.

---

## Téma szín változók

A `ColorProvider` három felhasználó által kiválasztott hex színt alakít CSS egyéni tulajdonságokká a `document.documentElement`-en. Ez azt jelenti, hogy minden CSS-ben `var(--theme-accent)`-et használó elem automatikusan frissül komponens újrarenderelés nélkül.

A kulcs változó a `colorMiddle`-ból van levezetve. A provider `hexToRgba`-t használ a `src/lib/utils/colorMath.ts`-ből alpha variánsok előállításához, amelyeket keretekhez, árnyékokhoz és puha hátterekhez alkalmaznak:

```typescript
document.documentElement.style.setProperty("--theme-accent", colorMiddle);
document.documentElement.style.setProperty("--theme-nav-border", hexToRgba(colorMiddle, 0.2));
document.documentElement.style.setProperty("--theme-accent-soft", hexToRgba(colorMiddle, 0.15));
```

---

## Toast rendszer

A `src/lib/toast.ts` egy nulla függőségű pub/sub értesítési rendszer. Egy modul-szintű `ToastItem` objektum tömböt és hallgató callbackek halmazát tartja karban. A `Toaster` komponens a `RootLayout`-ban feliratkozik erre a store-ra és rendereli a toast listát.

```typescript
toast.success("Profil mentve.");
toast.error("Feltöltés sikertelen.");
toast.info("Betöltés...");
```

A toast-ok alapértelmezés szerint 4000ms után automatikusan eltűnnek. Nincs bevont külső könyvtár.

---

## Debug beállítások

A `src/hooks/useDebugSettings.ts` egy hook-ot és egy kísérő `getDebugSettings()` függvényt biztosít a debug konfiguráció olvasásához a `localStorage["debug-settings"]`-ből.

A teljes beállítások tartalmaznak: `animationSpeed`, `forceReducedMotion`, `compactDensity`, `safeAreaOutlines`, `forceViewportEnabled`, `forceViewportPreset`, `forceViewportWidth`, `forceViewportHeight`, `noBackdropBlur`, `layoutBorders`, `navbarOverride`, `networkDelayMs`, `networkJitterMs`, `showFps`, `showScrollPos`, `showBreakpointBadge`, `clickTargetChecker`, `zIndexInspector`, `elementInspector`.

A beállítások változásai egy egyéni DOM esemény `"debug-settings"` segítségével kerülnek sugárzásra, így a komponensfa különböző részein lévő több hook instance szinkronban marad React context nélkül:

```typescript
window.dispatchEvent(new CustomEvent("debug-settings", { detail: next }));
```

---

## Lokalizáció

A `src/lib/i18n.ts` az i18next-et 12 névtérrel konfigurálja nyelvenként: `auth`, `nav`, `settings`, `profile`, `releases`, `news`, `webstore`, `admin`, `common`, `debug`, `gallery`, `leaderboard`. Az összes locale fájl build időben van becsomagolva — nincsenek runtime hálózati kérések fordítási fájlokhoz.

```typescript
i18n.use(initReactI18next).init({
  resources: { en: { auth: enAuth, nav: enNav, /* ... */ }, hu: { /* ... */ } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
```

A kezdeti `lng: "en"` felül lesz írva indításkor, amikor a `SettingsProvider` futtatja az `i18n.changeLanguage(settings.language)` hívást. A komponensek így fogyasztják a fordításokat:

```typescript
const { t } = useTranslation("webstore");
return <p>{t("item.purchase")}</p>;
```

---

## Felhasználónév generátor

A `src/lib/generateUsername.ts` véletlenszerű megjelenítési névjavaslatokat generál két statikus tömbből — 116 melléknévi prefixből (Fluffy, Cosmic, Majestic stb.) és 113 állathang- vagy természet-utótagból (Paws, Thunder, Ember stb.). A regisztrációs vagy profilkészítési folyamatban javasolt névként kerül felhasználásra:

```typescript
const { prefix, suffix } = generateRandomUsername();
// Példa eredmény: { prefix: "Cosmic", suffix: "Thunder" }
```

---

## Tárgy konstansok

A `src/lib/constants/itemConstants.ts` centralizálja a webáruház tárgyainak összes domain konstansát:

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

Az `ACCEPTED_IMAGE_TYPES` a `useProfile.ts`-ben is hivatkozva van, ahol a képfeltöltések a HTTP kérés elkészítése előtt kerülnek validálásra.

---

## Error Boundary

A `src/components/ErrorBoundary.tsx` egy osztálykomponens, amely elkapja a render hibákat bármely gyermek fából. Implementálja a `getDerivedStateFromError`-t, hogy hibaállapotba váltson, és a `componentDidCatch`-et a hiba naplózásához. Az alapértelmezett fallback egy hibakártyát renderel a hibaüzenettel és egy "Próbálja újra" gombbal, amely visszaállítja a hibaállapotot:

```typescript
static getDerivedStateFromError(error: Error): State {
  return { hasError: true, error };
}
```

Minden lazy-loadolt route `withBoundary`-ba van csomagolva a `main.tsx`-ben. Ez biztosítja, hogy egy oldal szintű hiba a hibakártyát rendereli az elrendezésen belül, ahelyett, hogy megtörné az egész alkalmazást.

---

## Build konfiguráció

A `vite.config.ts` kézi chunk felosztást konfigurál egy egységes nagy bundle elkerüléséhez:

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

A `backgrounds` chunk azért van elkülönítve, mert a háttér komponensek nagyok (canvas renderelési kód), és csak akkor töltődnek be, amikor a `Wrapper` rendereli őket. Az `ops-pages` chunk azért tartja ki az admin és debug kódot a fő bundle-ből, mert a legtöbb felhasználó soha nem látogatja meg ezeket az oldalakat.

A kimenet a `../build/client` könyvtárba kerül. A `rollup-plugin-visualizer` bundle méret riportot generál a `./build/stats.html` fájlba.

A fejlesztői szerver a `/api/*` kéréseket a `http://localhost:8080`-ra proxizálja, hogy a frontend helyi backend ellen fejleszthető legyen CORS konfiguráció nélkül.

Teszt környezet: `jsdom`. Setup fájl: `./src/test-setup.ts`. A globális teszt segédprogramok (`describe`, `it`, `expect`, `vi`) importok nélkül elérhetők.

---

## Navbar Context

A `src/context/NavbarContext.tsx` két boolean-t tárol: `isDropdownHovering` és `isDropdownOpen`. Ezek vezérlik a fiók menü legördülő állapotát. A context-et a `Navbar.tsx` és az `AccountMenu.tsx` fogyasztja.

---

## Security Key Context

A `src/context/SecurityKeyProvider.tsx` tartja a biztonsági kulcs értékét és az első munkamenet jelzőt. Amikor új fiók jön létre, a regisztrációs folyamat ide tárolja el a biztonsági kulcsot. Az `isFirstSession` jelző szabályozza, hogy a "mentsd el a kulcsodat" értesítő látható-e a profiloldalon. A `markKeySeen` elrejti az értesítőt és elmenti az elutasítást, hogy az oldal frissítése után se jelenjen meg újra.

---

## Konvenciók

### Téma helperek használata

Minden témázott UI-t renderelő komponensnek a `src/lib/utils/themeClasses.ts` közös helpereit kell használnia. A függvények elfogadják az `useLiquidGlass` és `useDarkMode` boolean értékeket, és megfelelő Tailwind osztálystring-eket adnak vissza. Az inline ternary láncolatok írása, mint `useDarkMode ? "text-white" : "text-black"`, megkerüli a témarendszert és megnehezíti a jövőbeli témaváltoztatások globális alkalmazását.

### Query key használat

Mindig a `queryKeys.*`-t használd a `src/lib/queryKeys.ts`-ből, ne inline string tömböket. Ez megakadályozza a cache kulcs gépelési hibákat és megkönnyíti az összes olyan hely megtalálását, amelyek egy adott query-től függnek.

### Locale fájlok

Minden felhasználónak szóló string-nek szerepelnie kell mind a `src/locales/en/*.json`, mind a `src/locales/hu/*.json` fájlban. Egyszerre add hozzá mindkét fájlhoz. A csak az egyik fájlban szereplő string-ek visszaesnek angolra, ami elfogadható egy leromlott élményhez, de nem szabad véglegesként hagyni.

### Nincs style tag a komponensekben

Minden `@keyframes` és animációs keyframe definíció a `src/index.css`-be tartozik. A komponensek nem injektálhatnak `<style>` elemeket. A Tailwind tetszőleges `animate-[...]` szintaxis vagy a globális stylesheet-ben definiált keyframe nevekre hivatkozó inline `style` attribútumok a helyes megközelítés.

### FormData feltöltések

Amikor az `apiClient`-et fájlok feltöltésére használod, adj át egy `FormData` objektumot a kérés testjeként, és ne állítsd be kézzel a `Content-Type` fejlécet. A request interceptor felismeri a `FormData`-t, és törli a fejlécet, hogy a böngésző automatikusan beállíthassa a helyes `multipart/form-data; boundary=...` értéket.
