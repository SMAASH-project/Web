# SMAASH Kliens — Fejlesztői Dokumentáció

> **Stack:** React 19 · TypeScript · Vite · Tailwind CSS · React Query · Axios · react-i18next · Motion (Framer)  
> **Alap útvonal:** `client/src/`

---

## Tartalomjegyzék

1. [Projektstruktúra](#1-projektstruktúra)
2. [Belépési pontok és útvonalak](#2-belépési-pontok-és-útvonalak)
3. [Provider-réteg](#3-provider-réteg)
4. [Téma-rendszer](#4-téma-rendszer)
5. [Kontextusok](#5-kontextusok)
6. [Hook-ok és API-réteg](#6-hook-ok-és-api-réteg)
7. [Oldalak](#7-oldalak)
8. [Navigáció](#8-navigáció)
9. [Űrlapok](#9-űrlapok)
10. [i18n / Többnyelvű támogatás](#10-i18n--többnyelvű-támogatás)
11. [UI komponenskönyvtár](#11-ui-komponenskönyvtár)
12. [Típusok](#12-típusok)
13. [Segédeszközök](#13-segédeszközök)
14. [Teljesítmény és build](#14-teljesítmény-és-build)
15. [Ismert teendők és backend-függőségek](#15-ismert-teendők-és-backend-függőségek)

---

## 1. Projektstruktúra

```
client/
├── index.html                  # Belépési HTML — preconnect tippek az API-kiszolgálóhoz
├── vite.config.ts              # Build konfiguráció, manuális chunk-felosztás
├── tsconfig.app.json           # Alkalmazás TypeScript konfiguráció
└── src/
    ├── main.tsx                # Router beállítása, lusta importok, StrictMode
    ├── App.tsx                 # Hitelesítési átirányítás kapuja
    ├── RootLayout.tsx          # Minden provider, Suspense határ
    ├── Wrapper.tsx             # Teljes oldalas átmenet + CSS egyéni tulajdonságok
    ├── context/                # Hitelesítési és navigációs kontextusok
    ├── hooks/                  # React Query hook-ok (domain szerint felosztva)
    ├── lib/
    │   ├── I18n.ts             # i18next inicializálás (minden komponens előtt importálandó)
    │   ├── apiClient.ts        # Axios példány + interceptorok
    │   ├── queryKeys.ts        # Centralizált query kulcs-gyár
    │   ├── utils.ts            # Az összes segédmodul barrel re-exportja
    │   ├── utils/              # dateFormat, themeClasses, liquidGlass, colorMath, classnames
    │   ├── miscAnimations/     # Újrafelhasználható Motion burkolók
    │   └── pageAnimations/     # Oldal-szintű animáció komponensek
    ├── components/
    │   ├── forms/              # Hitelesítési űrlapok + ProfileSelector + AddNewProfile
    │   ├── nav/                # Navigációs sáv, mobil fiók, fiókmenü
    │   ├── pages/
    │   │   ├── mainPages/      # Kiadások, Hírek, Webáruház, Rólunk, Galéria
    │   │   └── profileDependents/  # Profil, Beállítások, Admin
    │   └── ui/                 # Megosztott UI primitívek (shadcn-stílusban)
    ├── locales/
    │   ├── en/                 # Angol JSON — 9 névtér-fájl
    │   └── hu/                 # Magyar JSON — azonos struktúra
    └── types/                  # Megosztott TypeScript interfészek + példaadatok
```

---

## 2. Belépési pontok és útvonalak

### `src/main.tsx`

Az alkalmazás gyökere. Beállítja a React Router-t, importálja az i18n-t minden komponens renderelése előtt, és lusta betöltést alkalmaz az összes nehéz oldalra.

**A hitelesítési útvonalak eager-betöltésűek** (gyorsabb bejelentkezési/regisztrációs élmény). Minden más oldal lusta:

```tsx
// Eager — a kezdeti bundle-lel töltődik be
import { LoginForm } from "./components/forms/LoginForm.tsx";
import { SignupForm } from "./components/forms/SignUpForm.tsx";
import { PasswordResetForm } from "./components/forms/PasswordResetForm.tsx";

// Lusta — külön chunk-okba van szétválasztva
const ReleasesPage = lazy(() =>
  import("./components/pages/mainPages/ReleasesPage.tsx").then((m) => ({
    default: m.ReleasesPage,
  })),
);
```

**Útvonaltáblázat:**

| Útvonal                 | Komponens                 | Hitelesítés szükséges  |
| ----------------------- | ------------------------- | ---------------------- |
| `/app`                  | `App` (átirányítási kapu) | Nem                    |
| `/app/login`            | `LoginForm`               | Nem                    |
| `/app/signup`           | `SignupForm`              | Nem                    |
| `/app/reset-password`   | `PasswordResetForm`       | Nem                    |
| `/app/releases`         | `ReleasesPage`            | Igen                   |
| `/app/news`             | `NewsPage`                | Igen                   |
| `/app/webstore`         | `WebstorePage`            | Igen                   |
| `/app/profile`          | `ProfilePage`             | Igen                   |
| `/app/profile-selector` | `ProfileSelectorForm`     | Igen                   |
| `/app/settings`         | `SettingsPage`            | Igen                   |
| `/app/admin`            | `AdminPage`               | Igen + Admin szerepkör |
| `/app/about`            | `AboutPage`               | Nem                    |
| `/app/gallery`          | `GalleryPage`             | Nem                    |
| `*`                     | `NotFoundPage`            | Nem                    |

### `src/App.tsx`

Beolvassa az `AuthContext.isLoggedIn` és `isInitializing` értékeket, majd átirányít `/app/releases`-re vagy `/app/login`-ra. Betöltési animációt mutat, amíg a hitelesítés inicializálódik.

---

## 3. Provider-réteg

A `RootLayout.tsx` minden útvonalat ebbe a provider-fába csomagol (legbelső rétegtől kifelé haladva):

```
PersistQueryClientProvider   ← React Query + localStorage perzisztencia
  AuthProvider               ← isLoggedIn, userId, isAdmin
    SettingsProvider         ← settings, updateSetting (localStorage-ban tárolva)
      NavbarProvider         ← legördülő menü hover/nyitott állapota
        ColorProvider        ← gradiens színek (localStorage-ban tárolva)
          ProfileProvider    ← profiles[], selectedProfile, hozzáadás/törlés/kiválasztás
            Wrapper          ← teljes oldalas gradiens div + CSS egyéni tulajdonságok
              Suspense       ← pörgő ikon fallback lusta útvonalakhoz
                Outlet       ← aktív útvonal
```

**React Query konfiguráció (`RootLayout.tsx`-ben beállítva):**

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 perc
      gcTime: 10 * 60 * 1000, // 10 perc
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
```

A gyorsítótár `localStorage`-ba kerül mentésre a `createSyncStoragePersister` segítségével, így a lekérdezések túlélik az oldalfrissítést. A `whoami` lekérdezés szándékosan kimarad ebből (`gcTime: 0`), hogy megelőzzük az elavult hitelesítési adatok beszivárgását a gyorsítótárba.

---

## 4. Téma-rendszer

A téma három, a `ColorContext`-ben és `localStorage`-ban tárolt gradiens-szín által van meghatározva. A `Wrapper.tsx` ezen színekből számított CSS egyéni tulajdonságokat számol ki és fecskendezi be a gyökérelemre.

### CSS egyéni tulajdonságok (`Wrapper.tsx` által beállítva)

| Változó                | Leírás                                          |
| ---------------------- | ----------------------------------------------- |
| `--theme-accent`       | A három gradiens-szín megvilágított átlaga      |
| `--theme-accent-hover` | Világosabb verzió hover állapotokhoz            |
| `--theme-accent-soft`  | Félig átlátszó hangsúlyszín finom kitöltésekhez |
| `--theme-nav-border`   | Átlagszín a navigációs sáv keretéhez            |
| `--theme-nav-shadow`   | Félig átlátszó árnyékszín                       |

### Beállítási kapcsolók

| Kapcsoló         | Alapértelmezett | Hatás                                                 |
| ---------------- | --------------- | ----------------------------------------------------- |
| `useLiquidGlass` | `true`          | Fagyott üveg megjelenés (backdrop-blur + átlátszóság) |
| `useDarkMode`    | `false`         | Az összes témázott osztály sötét változata            |
| `useAnimations`  | `true`          | Motion animációk globálisan engedélyezve/letiltva     |
| `language`       | `"en"`          | i18next nyelv (`"en"` vagy `"hu"`)                    |

### Téma segédfüggvények (`src/lib/utils/themeClasses.ts`)

Minden komponensnek ezeket a függvényeket kell használnia — soha ne írj inline ternáris téma logikát.

```ts
import {
  getTextColor, // Elsődleges szöveg
  getSubtextColor, // Halvány/másodlagos szöveg
  getTextShadow, // Szövegárnyék a gradiens háttéren való olvashatósághoz
  getBackgroundClasses, // Kártya/panel hátterek — változatok: "base" | "light" | "strong"
  getButtonClasses, // Gomb stílus — változatok: "primary" | "secondary" | "outline"
  getInputClasses, // Input/textarea/select stílus
  getDialogClasses, // Modal/párbeszédpanel felület
  getDialogFooterClasses, // Modal lábléc elválasztó
} from "@/lib/utils";

// Példa komponensben való használatra:
const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
const bgClass = getBackgroundClasses(
  settings.useLiquidGlass,
  settings.useDarkMode,
  "strong",
);
```

### Folyékony üveg segédeszközök (`src/lib/utils/liquidGlass.ts`)

További segédeszközök a folyékony üveg vizuális hatáshoz:

```ts
getLiquidGlassClasses(useLiquidGlass, useDarkMode, variant?)
// variant: "base" | "input" | "accent"

getLiquidGlassTextShadow(useLiquidGlass, useDarkMode)
getLiquidGlassHighlight(useLiquidGlass, useDarkMode)
getLiquidGlassNavHighlight(useLiquidGlass, useDarkMode)
getLiquidGlassDialogClasses(useLiquidGlass, useDarkMode)
getLiquidGlassDialogFooterClasses(useLiquidGlass, useDarkMode)
getLiquidGlassControlClasses(useLiquidGlass, useDarkMode)
```

### Előre beállított témák (`src/components/.../settingsLogic/Themes.ts`)

```ts
import { THEMES } from "@/components/pages/profileDependents/settings/settingsLogic/Themes";
// THEMES: Theme[] — mindegyiknek van { name, colorLeft, colorMiddle, colorRight }
// Előre beállítottak: Azure, Slate, Emerald, Amethyst, Coral, Sunset, Ocean, …
```

---

## 5. Kontextusok

### `AuthContext` (`src/context/AuthContext.ts`)

```ts
interface AuthContextShape {
  isLoggedIn: boolean;
  isInitializing: boolean; // true, amíg a whoami lekérdezés fut
  userId: bigint | null;
  setUserId: (value: bigint | null) => void;
  setIsLoggedIn: (value: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}
```

Az `AuthProvider` tölti fel, amely induláskor meghívja a `useWhoAmIQuery()`-t. Importáld a `useContext(AuthContext)` segítségével.

```tsx
const { isLoggedIn, isAdmin, userId } = useContext(AuthContext);
```

### `SettingsContext` (`src/components/.../settingsLogic/SettingsContext.tsx`)

```ts
// Hook — hibát dob, ha SettingsProvider-en kívül használják
const { settings, updateSetting } = useSettings();

// Egyetlen kulcs frissítése
updateSetting("useDarkMode", true);
updateSetting("language", "hu");
```

`"settings"` kulcs alatt tárolódik a `localStorage`-ban. Az i18next-et is szinkronban tartja induláskor és nyelvváltáskor.

### `ProfileContext` (`src/components/forms/addNewProfile/ProfilesContext.tsx`)

```ts
const { profiles, selectedProfile, addProfile, removeProfile, selectProfile } =
  useProfiles();
// useProfiles() = useContext(ProfileContext) — az useProfiles.ts-ből

// Profil alakja:
interface Profile {
  id?: number;
  name: string; // display_name
  avatar: string; // /api/profiles/:id/pfp URL
  avatarFile?: File | null;
  coins?: number;
  last_login?: string;
}
```

A `selectedProfile` alapértelmezés szerint az első profilra mutat, ha nincs explicit kiválasztás. Kiválasztás névvel:

```ts
selectProfile("MiKarakterem"); // a kiválasztást komponens állapotban tárolja (csak munkamenetig)
```

### `ColorContext` (`src/components/.../settingsLogic/color/ColorContext.ts`)

```ts
const {
  colorLeft,
  colorMiddle,
  colorRight,
  setColorLeft,
  setColorMiddle,
  setColorRight,
} = useContext(ColorContext);
```

Három hex-szöveg, amely a `Wrapper.tsx` gradiensét hajtja meg. `"color-settings"` kulcs alatt tárolódik a `localStorage`-ban.

---

## 6. Hook-ok és API-réteg

### `src/lib/apiClient.ts`

Megosztott Axios példány. Minden API-hívás ezen keresztül megy.

- **Alap URL:** `/api`
- **Hitelesítő adatok:** `withCredentials: true` (sütialapú hitelesítés)
- **Content-Type:** automatikusan `application/json`-ra van beállítva; `FormData` esetén kihagyva (a böngésző állítja be a multipart határt)
- **401-es interceptor:** Bármely nem-hitelesítési végponttól érkező 401-es válasz esetén keményen átirányít `/app/login`-ra. A hitelesítési végpontok (`/auth/*`, `/users/whoami`) ki vannak zárva, hogy elkerüljük az átirányítási hurkokat hibás jelszavas válaszoknál.

```ts
import apiClient from "@/lib/apiClient";

// Példa közvetlen használatra (inkább hook-okat használj, ahol lehetséges):
const { data } = await apiClient.get<SajátTípus>("/endpoint");
await apiClient.post("/endpoint", body);
await apiClient.put("/endpoint/1", body);
await apiClient.delete("/endpoint/1");
```

### `src/lib/queryKeys.ts`

Centralizált kulcs-gyár — minden `queryKey` és `invalidateQueries` híváshoz ezeket használd a következetes gyorsítótár-kezelés érdekében.

```ts
import { queryKeys } from "@/lib/queryKeys";

queryKeys.auth.all; // ["auth"]
queryKeys.profiles.byUserId(userId); // ["profiles", "byUserId", 5]
queryKeys.releases.infinite(os); // ["releases", "infinite", "windows"]
queryKeys.news.byCategory(categories); // ["news", "byCategory", ["Patch"]]
queryKeys.items.all; // ["items"]
queryKeys.purchases.byProfileId(profileId);
```

### Hook fájlok

A hook-ok domain szerint vannak felosztva. Mindegyik újra exportálva van a `useQueryHooks.ts`-ből kényelmes elérés céljából.

#### `src/hooks/useAuthHooks.ts`

| Hook                           | Metódus | Végpont         |
| ------------------------------ | ------- | --------------- |
| `useWhoAmIQuery()`             | GET     | `/users/whoami` |
| `useLoginMutation()`           | POST    | `/auth/login`   |
| `useSignupMutation()`          | POST    | `/auth/signup`  |
| `useLogoutMutation()`          | POST    | `/auth/logout`  |
| `useUpdateUserEmailMutation()` | PUT     | `/users/:id`    |

```ts
// Bejelentkezési példa
const loginMutation = useLoginMutation();
try {
  const data = await loginMutation.mutateAsync({ email, password });
  // data: { id: number, role: string }
} catch (err) { ... }

// Kijelentkezés — törli a gyorsítótárat és a whoami-t, navigálj be/ki magad
const logoutMutation = useLogoutMutation();
await logoutMutation.mutateAsync();
setIsLoggedIn(false);
navigate("/app/login");
```

#### `src/hooks/useProfileHooks.ts`

| Hook                                | Leírás                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `useProfilesQuery(userId)`          | Egy felhasználó összes profiljának lekérése. `?v=` paramétert fűz hozzá az avatar URL-ekhez a gyorsítótár-elkerülés érdekében. |
| `useAddProfileMutation()`           | POST a `/users/:id/profiles` végpontra. Opcionális `profile_picture: File` paramétert fogad.                                   |
| `useUpdateProfileMutation()`        | PUT a `/profiles/:id` végpontra. **Optimista frissítést** támogat az `onMutate` segítségével.                                  |
| `useDeleteProfileMutation()`        | DELETE `/profiles/:id`. **Optimista eltávolítás** hiba esetén visszaállítással.                                                |
| `useUploadProfilePictureMutation()` | POST multipart a `/profiles/:id/pfp` végpontra. Automatikusan növeli a verziószámot a gyorsítótár-elkerüléshez.                |

```ts
// Profil hozzáadása képpel
const addProfileMutation = useAddProfileMutation();
await addProfileMutation.mutateAsync({
  display_name: "HősSlime",
  user_id: 42,
  profile_picture: fajlInputbol,
});

// Optimista megjelenítési név frissítés
const updateMutation = useUpdateProfileMutation();
await updateMutation.mutateAsync({
  profileId: 7,
  payload: { id: 7, display_name: "ÚjNév", coins: 500 },
  optimistic: true, // gyorsítótár frissítése a szerver megerősítése előtt
  invalidateAfterSuccess: true,
});
```

**Megjelenítési név szabályok:** 20 karakterre van korlátozva a `clampDisplayName()` segítségével. Az ismétlődő nevekhez automatikusan egy véletlenszerű 4 karakteres utótag kerül hozzáfűzésre.

**Avatar gyorsítótár-elkerülés:** A profilkép-verziók a `sessionStorage`-ban tárolódnak `"pfp_versions"` kulcs alatt. Feltöltés után a verzió növekszik, megváltoztatva a `?v=` query paramétert és arra kényszerítve a böngészőt, hogy lekérje az új képet.

#### `src/hooks/useContentHooks.ts` + `useQueryHooks.ts`

Végtelen lekérdezési hook-ok lapozható tartalomhoz. Mindegyik ugyanazt a válaszboritékot használja:

```ts
interface PaginatedResponse<T> {
  items: T[]; // vagy releases / posts
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}
```

| Hook                                           | Fő paraméterek                              | Végpont                                 |
| ---------------------------------------------- | ------------------------------------------- | --------------------------------------- |
| `useReleasesInfiniteQuery(os, pageSize?)`      | `os: string`                                | `GET /releases?os=&page=&pageSize=`     |
| `useItemsInfiniteQuery(filters?, pageSize?)`   | `kind`, `rarity`, `combatType`, `ownership` | `GET /items?...`                        |
| `useNewsInfiniteQuery(categories?, pageSize?)` | `categories: string[]`                      | `GET /news?categories=&page=&pageSize=` |

```ts
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useReleasesInfiniteQuery("windows", 8);

const releases = data?.pages.flatMap((p) => p.releases) ?? [];
```

#### `src/hooks/useAdminHooks.ts`

Admin panel hook-ok. Mindegyik megköveteli, hogy a hívó admin legyen (a backend middleware fogja kikényszeríteni, ha implementálva lesz).

| Hook                          | Végpont                 | Megjegyzések                                                              |
| ----------------------------- | ----------------------- | ------------------------------------------------------------------------- |
| `useAdminUsersQuery(search?)` | `GET /users`            | Kliensoldali szűrés, amíg a backend nem támogatja a `?search=` paramétert |
| `useAdminUserQuery(userId)`   | `GET /users/:id`        |                                                                           |
| `useBanUserMutation()`        | `POST /users/:id/ban`   | A `BanPayload`-ot `{ id, period }` formátumra konvertálja percekben       |
| `useUnbanUserMutation()`      | `POST /users/:id/unban` |                                                                           |

```ts
const banMutation = useBanUserMutation();
await banMutation.mutateAsync({
  userId: 99,
  payload: {
    ban_type: "temporary",
    ban_until: "2026-06-15T14:00:00Z",
    reason: "Mérgező viselkedés",
  },
});
```

**Végleges kitiltás** `50 * 365 * 24 * 60` percet (~50 év) használ, mert a backend egy konkrét időbélyeget tárol.

---

## 7. Oldalak

### Kiadások (`/app/releases`)

`src/components/pages/mainPages/ReleasesPage.tsx`

Játékverzió-kiadásokat jelenít meg operációs rendszer szerinti szűréssel. Végtelen görgetést használ. Az adminok Hozzáadás/Törlés gombokat látnak.

Fő alkomponensek:

- `Releases.tsx` — a kiadások listájának megjelenítése
- `SelectOs.tsx` — operációs rendszer szűrő (Windows / Android / stb.)
- `AddRelease.tsx` — admin párbeszédpanel
- `RemoveReleaseButton.tsx` — admin törlés megerősítéssel
- `DownloadReleaseButton.tsx` — közvetlen letöltési link
- `SearchRelease.tsx` — kliensoldali keresés
- `useReleases.ts` — helyi állapotkezelés a listához + mutációk

### Hírek (`/app/news`)

`src/components/pages/mainPages/NewsPage.tsx`

Markdown-megjelenítésű hírbejegyzések kategóriajelvényekkel és képtámogatással. Reszponzív: az oldalsó képek mobilon egymás alá kerülnek.

Fő funkciók:

- A bejegyzések támogatják az `imagePosition: "Top" | "Right"` és `imageSize: number` tulajdonságokat  
  Asztali gépen az oldalsó képek a beállított `imageSize%` értéket használják. Mobilon teljes szélességben jelennek meg.
- `react-markdown` + `remark-gfm` rendereli a bejegyzés tartalmát
- Kategória szűrő `FilterSelect` felugróval
- Az adminok `EditButton` és `RemoveButton` gombokat látnak bejegyzésenként
- Bejegyzés belépési animációk `LoadPost` segítségével (tiszteli a `useAnimations` beállítást)

Alkomponensek:

- `AddNews.tsx` — admin létrehozó párbeszédpanel
- `EditButton.tsx` — admin szerkesztő párbeszédpanel
- `RemoveButton.tsx` — admin törlés megerősítés
- `Search.tsx` — szöveges keresés
- `Filter.tsx` / `FilterSelection.tsx` — kategória szűrő
- `CategoryBadge.tsx` — színkódolt kategóriajelvény
- `useNewsPosts.ts` — bejegyzések CRUD állapota
- `useNewsCategoryFilter.ts` — szűrő állapota
- `useNewsForm.ts` — űrlap állapota létrehozáshoz/szerkesztéshez

**Kategória-színek** (`types/PageTypes.ts`-ben definiálva):

| Kategória      | Szín                  |
| -------------- | --------------------- |
| Major update   | `#3b82f6` (kék)       |
| Minor update   | `#10b981` (zöld)      |
| Patch          | `#f59e0b` (borostyán) |
| Unrelated news | `#8b5cf6` (lila)      |

### Webáruház (`/app/webstore`)

`src/components/pages/mainPages/WebstorePage.tsx`

Tárgy bolt. Az érmeegyenleg a `ProfileContext.selectedProfile.coins`-ból jön.

Alkomponensek:

- `Item.tsx` — egyedi tárgyak kártyája feloldó gombbal
- `CreateItemDialog.tsx` — admin létrehozás
- `RemoveItemButton.tsx` — admin törlés
- `SearchItem.tsx` — szöveges keresés
- `ItemFilters.tsx` — szűrés típus, ritkaság, harci típus és tulajdonlás szerint
- `useItems.ts` — teljes React Query integráció: lekéri a `GET /api/items` végpontot, összefésüli a tulajdonlási adatokat a `GET /profiles/:id/purchases` alapján, kezeli a létrehozási/törlési/vásárlási mutációkat

**Tulajdonlás** meghatározása: a kiválasztott profil vásárlási előzményeit lekérve felépít egy `Set`-et a már megvásárolt tárgyak neveiből. Vásárlás után mind a vásárlások lekérdezése, mind a profil érmék lekérdezése érvénytelenítésre kerül, így az érmeegyenleg azonnal frissül.

**Item → WebstoreItem leképezés:** a backend a típust és harci típust kategória-szövegekként kódolja (`"Character"`, `"Skin"`, `"Melee"`, `"Ranged"`). Az `itemDTOToWebstoreItem()` ezeket visszaalakítja a felhasználói felület által várt típusos mezőkre.

### Profil (`/app/profile`)

`src/components/pages/profileDependents/profile/ProfilePage.tsx`

Háromoszlopos elrendezés: avatar/név/szerkesztés | statisztikák | meccs-előzmények.

```
[ Avatar / Név / Szerkesztés ] | [ Statisztikák ] | [ Meccs-előzmények ]
```

Élő adatok: érmék, utoljára aktív, profil azonosító (`ProfileContext`-ből).  
Helyőrző adatok (halvány, `opacity-40`): győzelmek, vereségek, győzési arány, meccsszám.  
Meccs-előzmények: üres állapot — a `GET /api/profiles/:id/matches` végpontra vár.

Fő fájlok:

- `ProfilePageContent.tsx` — mindhárom panel
- `UpdateSheet.tsx` — kihúzható lap a profil átnevezéséhez és az avatar megváltoztatásához

### Beállítások (`/app/settings`)

`src/components/pages/profileDependents/settings/SettingsPage.tsx`

Kapcsolókártyák: Animációk, Folyékony üveg, Sötét mód, Nyelv.  
Témaválasztó szakasz előre beállított színsémákkal és egyéni 3-megállós színválasztóval.

Fő fájlok:

- `SettingsPageContent.tsx` — teljes oldal elrendezés
- `SettingToggle.tsx` — újrafelhasználható kapcsolósor
- `ThemePicker.tsx` — előre beállított rács + egyéni színválasztók
- `SettingsContext.tsx` — állapot, perzisztencia, i18n szinkronizálás

### Admin (`/app/admin`)

`src/components/pages/profileDependents/admin/AdminPage.tsx`

Hitelesítés-védelmes: a nem-adminok `<NotFoundPage />`-t látnak (megkülönböztethetetlen egy valódi 404-estől).

Háromoszlopos elrendezés:

```
[ Felhasználólista + Keresés ] | [ Felhasználó részletei + Statisztikák ] | [ Felhasználó profiljai ]
```

Fő fájlok:

- `AdminPageContent.tsx` — háromoszlopos kártya
- `UserList.tsx` — görgethető lista kliensoldali kereséssel
- `UserListItem.tsx` — sor kitiltás-jelzővel
- `UserDetail.tsx` — kiválasztott felhasználó fejléce, fiókstatisztikák, szerepkörjelvény, kitilt/felold gomb
- `ProfilesPanel.tsx` — kiválasztott felhasználó profiljai
- `ban/BanDialog.tsx` — teljes kitiltó modal (előre beállítottak + egyéni dátumtartomány + ok)
- `ban/BanPresetCard.tsx` — egyedi előre beállított opció
- `ban/BanCustomRange.tsx` — egyéni naptár + időpörgetők
- `adminLogic/useAdminPageLogic.ts` — oldal állapota + témázás
- `adminLogic/useBanDialogLogic.ts` — kitiltó párbeszédpanel állapota

**Szerepkörjelvény-leképezés:**

| Backend szerepkör | Jelvény színe   | Ikon         |
| ----------------- | --------------- | ------------ |
| `"admin"`         | Lila            | Pajzs        |
| `"support"`       | Égkék           | Fejhallgató  |
| `"user"`          | Semleges szürke | Felhasználók |

**Kitiltási párbeszédpanel folyamata:**

1. Előre beállított időszak kiválasztása (1ó / 12ó / 24ó / 7n / 31n / 365n / Végleges) VAGY egyéni dátumtartomány
2. Opcionálisan ok kiválasztása/beírása
3. Megerősítés — elküldi a `{ id, period }` adatokat (időszak percekben) a `POST /users/:id/ban` végpontra

---

## 8. Navigáció

### `Navbar.tsx`

Rögzített felső sáv. A `NavbarContext`-et használja a legördülő menü hover-követéséhez az idő előtti bezárás megakadályozása érdekében.

- Asztali: logó balra, navigációs linkek középre, fiókmenü jobbra. Az Admin gomb csak akkor jelenik meg, ha `isAdmin === true`.
- Mobil töréspontnál: hamburger → `MobileNavMenu` kihúzható lap.

### `MobileNavMenu.tsx`

Kihúzható lap mobilra. Tartalmaz teljes navigációs linkeket + fiókszakaszt (Profil, Beállítások, Admin Panel ha admin, Kijelentkezés).

### `AccountMenu.tsx`

Legördülő menü a navigációs sáv jobb oldalán. Tartalmaz: Profil, Beállítások, Kijelentkezés.

### `navLogic/navItems.ts`

```ts
// Új navigációs elemek hozzáadása itt:
export const navItems = [
  { path: "/app/releases", labelKey: "nav.releases", icon: Download },
  { path: "/app/news", labelKey: "nav.news", icon: Newspaper },
  // ...
];
```

A `labelKey` közvetlenül a `src/locales/*/nav.json` fájl egy kulcsára mutat.

---

## 9. Űrlapok

### `LoginForm.tsx`

- E-mail + jelszó mezők
- Meghívja a `useLoginMutation()`-t, sikerkor beállítja az `isLoggedIn`/`userId`/`isAdmin` értékeket, és navigál `/app/profile-selector`-ra
- Nyelvváltó a jobb felső sarokban

### `SignUpForm.tsx`

- Felhasználónév / e-mail / jelszó / jelszó megerősítése
- reCAPTCHA v3 — a `GoogleReCaptchaProvider` burkolja a belső form komponenst. A token csak a beküldéskor kerül lekérésre az `executeRecaptcha("signup")` segítségével — **nem** folyamatosan. Ez megakadályozza a `reload`/`clr` kérés-áradatot.
- A webhelytitok a komponensbe van kódolva; éles környezetben env változóba kell áthelyezni.

```tsx
// Hogyan van strukturálva a reCAPTCHA a kérés-spam elkerülésére:
export function SignupForm(props) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="...">
      <SignupFormInner {...props} /> {/* useGoogleReCaptcha() itt él */}
    </GoogleReCaptchaProvider>
  );
}
// A token egyszer kerül lekérésre beküldéskor:
const token = await executeRecaptcha("signup");
```

### `PasswordResetForm.tsx`

> ⚠️ **Az űrlap beküld, de semmilyen mutációt nem indít.** Blokkolva van a `POST /api/auth/reset-password` backend végpontra való várakozás miatt. Lásd [§15](#15-ismert-teendők-és-backend-függőségek).

### `ProfileSelectorForm.tsx`

A felhasználó profiljait avatarként jeleníti meg. Kiválasztással be lehet lépni az alkalmazásba; a "Profilok kezelése" mód engedélyezi a törlést. A Kijelentkezés gomb meghívja a `useLogoutMutation()`-t és visszaállítja a hitelesítési állapotot.

`React.memo` + `useCallback` segítségével memoizálva az újrarenderelések csökkentése érdekében.

### `AddNewProfile.tsx`

Párbeszédpanel-forma új profil létrehozásához. Elfogad megjelenítési nevet és opcionális avatar képfeltöltést. Korlát: 5 profil felhasználónként.

---

## 10. i18n / Többnyelvű támogatás

**Nyelvek:** Angol (`en`) · Magyar (`hu`)

### Beállítás

A `src/lib/I18n.ts`-t a `main.tsx`-ben kell importálni **minden komponens renderelése előtt:**

```ts
import "@/lib/I18n.ts"; // main.tsx 4. sor
```

### Használat

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation("auth");
// t("login.title")   → "Login to your account" (en) / "Bejelentkezés" (hu)
// t("signup.submit") → "Create Account" / "Fiók létrehozása"
```

### Névterek

| Fájl            | Felhasználva                                                   |
| --------------- | -------------------------------------------------------------- |
| `auth.json`     | Bejelentkezés, Regisztráció, Jelszó-visszaállítás űrlapok      |
| `nav.json`      | Navigációs sáv, fiókmenü, navigációs elemek                    |
| `settings.json` | Beállítások oldal                                              |
| `profile.json`  | Profil oldal, UpdateSheet, ProfileSelector, AddNewProfile      |
| `releases.json` | Kiadások oldal + alkomponensek                                 |
| `news.json`     | Hírek oldal + alkomponensek                                    |
| `webstore.json` | Webáruház oldal + alkomponensek                                |
| `admin.json`    | Admin panel, kitiltási párbeszédpanel, minden kitiltási szöveg |
| `common.json`   | 404 oldal, megosztott feliratok                                |

### Nyelvváltás

A nyelv a `SettingsContext`-ben tárolódik (`settings.language`). Az `updateSetting("language", "hu")` megváltoztatása automatikusan meghívja az `i18n.changeLanguage()`-t egy `useEffect` segítségével a `SettingsContext`-ben.

A nyelvválasztó elérhető a Beállítások oldalon és `<LanguageToggle />` komponensként mindhárom hitelesítési oldalon.

### Új nyelv hozzáadása

1. Hozz létre `src/locales/<kód>/` mappát ugyanazzal a 9 JSON fájllal
2. Importáld az összes fájlt a `src/lib/I18n.ts`-ben, és add hozzá a `resources` objektumhoz
3. Adj hozzá egy gombot a `SettingsPageContent.tsx`-ben és a `LanguageToggle.tsx`-ben
4. Add hozzá a kódot a `Language` típushoz a `SettingsContext.tsx`-ben

### Magyar nyelvű megjegyzések

A magyar agglutináló nyelv — a fordítások teljes, kontextustudatos szövegek, nem összerakott töredékekből állnak. A kitiltás időtartam-feliratok (`"1 óra"`, `"7 nap"`) teljes szövegek a JSON-ban. Az interpolált szövegek i18next szintaxist használnak: `"Tiltva {{date}}-ig"`.

---

## 11. UI komponenskönyvtár

A komponensek a `src/components/ui/` mappában találhatók, és shadcn mintákat követnek (Radix UI primitívek + Tailwind).

| Komponens        | Fájl                 | Megjegyzések                                           |
| ---------------- | -------------------- | ------------------------------------------------------ |
| `Button`         | `button.tsx`         | Változatok a `button-variants.ts` segítségével         |
| `ButtonGroup`    | `button-group.tsx`   | Vízszintes/függőleges csoportosított gombok            |
| `Input`          | `input.tsx`          | Standard szövegbeviteli mező                           |
| `Card`           | `card.tsx`           | Konténer kártya                                        |
| `Avatar`         | `avatar.tsx`         | Felhasználói/profil avatar tartalék kezdőbetűkkel      |
| `Badge`          | `badge.tsx`          | Állapot/kategória feliratok                            |
| `Label`          | `label.tsx`          | Űrlapmező felirat                                      |
| `Field`          | `field.tsx`          | Field + FieldLabel + FieldDescription elrendezés       |
| `Dialog`         | `dialog.tsx`         | Modális párbeszédpanel                                 |
| `Sheet`          | `sheet.tsx`          | Kihúzható oldalpanel                                   |
| `DropdownMenu`   | `dropdown-menu.tsx`  | Radix legördülő menü                                   |
| `Popover`        | `popover.tsx`        | Radix felugró ablak                                    |
| `Switch`         | `switch.tsx`         | Kapcsolókapcsoló                                       |
| `Checkbox`       | `checkbox.tsx`       | Jelölőnégyzet                                          |
| `RadioGroup`     | `radio-group.tsx`    | Rádiógomb-csoport                                      |
| `Accordion`      | `accordion.tsx`      | Összecsukható szakaszok                                |
| `Separator`      | `separator.tsx`      | Vízszintes/függőleges elválasztó                       |
| `Calendar`       | `calendar.tsx`       | Egyéni dátumtartomány-naptár (react-day-picker nélkül) |
| `ColorPicker`    | `color-picker.tsx`   | Hex szín beviteli mező                                 |
| `Resizable`      | `resizable.tsx`      | Húzással átméretezhető panelek                         |
| `LanguageToggle` | `LanguageToggle.tsx` | EN/HU zászlógombok hitelesítési oldalakhoz             |

### Egyéni naptár (`calendar.tsx`)

Önálló, nincs külső datepicker-függőség. Támogatja az `single` és `range` módokat.

A tartomány-kiemelés összefüggő pillulasávként jelenik meg — `rounded-l-full` a kezdő dátumon, `rounded-r-full` a végén, lapos oldalak a belső napokon.

```tsx
<Calendar
  mode="range"
  selected={{ from: kezdoDatum, to: vegDatum }}
  onSelect={handleSelect}
  fromDate={new Date()} // múltbeli dátumok blokkolása
/>
```

---

## 12. Típusok

### `src/types/PageTypes.ts`

Fő domain interfészek, amelyek az oldalakon és hook-okban használatosak.

```ts
interface NewsPost {
  id: string;
  title: string;
  category: "Major update" | "Minor update" | "Patch" | "Unrelated news";
  image?: string;
  imageAlt?: string;
  imagePosition?: "Top" | "Right";
  imageSize?: number; // vh a Top-hoz; % szélesség a Right-hoz
  content: string; // Markdown
  createdAt: DateTime; // Luxon DateTime
}

interface WebstoreItem {
  id: string;
  name: string;
  kind: "Skin" | "Character";
  combatType?: "Melee" | "Ranged";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  description: string;
  price: number;
  owned: boolean;
  createdAt: DateTime;
}

interface Release {
  id: string;
  version: string;
  supports: string[]; // operációs rendszer azonosítók
  createdAt: DateTime;
}
```

### `src/types/OsTypes.ts`

Operációs rendszer azonosító konstansok a kiadás-szűréshez.

### `src/types/ExampleItems.ts` / `ExampleReleases.ts`

Helyőrző adatok. Az `ExampleItems`-t jelenleg a `useItems.ts` használja — lásd [§15](#15-ismert-teendők-és-backend-függőségek).

---

## 13. Segédeszközök

### `src/lib/utils.ts`

Barrel re-export. Mindent importálj a `@/lib/utils`-ból:

```ts
import {
  cn, // osztálynév összevonás (clsx + tailwind-merge)
  formatDate, // Luxon DateTime | Date | string → "2026. márc. 21."
  formatDateTime, // → "2026. márc. 21., 17:30"
  // Téma segédeszközök:
  getTextColor,
  getSubtextColor,
  getTextShadow,
  getBackgroundClasses,
  getButtonClasses,
  getInputClasses,
  getDialogClasses,
  getDialogFooterClasses,
  // Folyékony üveg segédeszközök:
  getLiquidGlassClasses,
  getLiquidGlassTextShadow,
  getLiquidGlassHighlight,
  getLiquidGlassNavHighlight,
  getLiquidGlassDialogClasses,
  getLiquidGlassControlClasses,
  // Színmatematika:
  getAverageHexColor,
  lightenHexColor,
  toRgbaColor,
  getTextColor,
} from "@/lib/utils";
```

### `src/lib/utils/colorMath.ts`

Tiszta szín-aritmetika, amelyet a `Wrapper.tsx` használ:

```ts
getAverageHexColor(colors: string[]): string   // N hex szín átlaga
lightenHexColor(hex: string, amount: number): string  // 0.0–1.0
toRgbaColor(hex: string, alpha: number): string
```

### `src/lib/utils/dateFormat.ts`

Luxon csomagolása konzisztens dátummegjelenítéshez. Elfogad Luxon `DateTime`-t, JS `Date`-t, ISO szövegeket vagy `undefined`-t.

```ts
formatDate("2026-03-21T17:30:00Z"); // "2026. márc. 21."
formatDateTime("2026-03-21T17:30:00Z"); // "2026. márc. 21., 17:30"
```

### `src/lib/GenerateRandomUsername.ts`

Véletlenszerű felhasználónév-javaslatokat generál a regisztrációs helyőrzőhöz.

```ts
const { prefix, suffix } = generateRandomUsername();
// prefix: "ClassicFog", suffix: ""  → "ClassicFog"
```

### Animációk

#### `src/lib/miscAnimations/`

| Komponens                   | Leírás                           |
| --------------------------- | -------------------------------- |
| `OnloadAnimationCard.tsx`   | Fade-in + felcsúszás betöltéskor |
| `OnloadAnimationNavbar.tsx` | Navigációs sáv belépési animáció |
| `AnimatedAccordion.tsx`     | Accordion magassági átmenettel   |
| `ColorInterpolation.tsx`    | Sima színátmenet-burkoló         |

#### `src/lib/pageAnimations/newsPageAnimations/LoadPost.tsx`

Az egyes hírbejegyzés-kártyákat lépcsőzetes belépési animációval burkolja:

```tsx
<LoadPost key={post.id} index={index}>
  <Card>...</Card>
</LoadPost>
```

Csak akkor rendereli a motion burkolót, ha a `settings.useAnimations` értéke `true`.

---

## 14. Teljesítmény és build

### Bundle-stratégia

Manuális chunk-ok a `vite.config.ts`-ben definiálva:

| Chunk            | Tartalom                              | Gzip          |
| ---------------- | ------------------------------------- | ------------- |
| `react-vendor`   | react, react-dom, react-router-dom    | ~33 KB        |
| `query-vendor`   | @tanstack/react-query, persist-client | ~12 KB        |
| `ui-vendor`      | framer-motion, motion, lucide-react   | ~45 KB        |
| Útvonal chunk-ok | Oldalanként lustán betöltve           | Igény szerint |

Kezdeti bundle: **~94 KB gzip** (349 KB-ról csökkent az optimalizálás előtt).

### Lusta betöltés

Az összes nem-hitelesítési oldal lustán töltődik be a `main.tsx`-ben:

```ts
const ReleasesPage = lazy(() =>
  import("./components/pages/mainPages/ReleasesPage.tsx").then((m) => ({
    default: m.ReleasesPage,
  })),
);
```

A `RootLayout.tsx`-ben lévő `Suspense` határ pörgő ikont mutat, amíg a chunk-ok betöltődnek.

### Bundle-vizualizáló

```bash
npm run build
# Megnyitja a build/stats.html-t — az összes chunk interaktív faszerkezet-térképe
```

### Erőforrás-tippek

Az `index.html`-ben `preconnect` és `dns-prefetch` található az API-kiszolgálóhoz, hogy az első API-hívás ne okozzon teljes DNS + TLS-kézfogási késést.

### Renderelés-optimalizálás

A `ProfileSelectorForm.tsx` memoizálja a `ProfileAvatar` komponenst és a `handleProfileClick` visszahívást:

```tsx
const ProfileAvatar = memo(function ProfileAvatar({ ... }) { ... });
const handleProfileClick = useCallback(async (name: string) => { ... }, [deps]);
```

---

## 15. Ismert teendők és backend-függőségek

### ⚠️ Frontend hibák (javítható most, backend nélkül)

#### 1. 401 / Munkamenet lejárta ✅ Javítva

Globális Axios interceptor az `apiClient.ts`-ben elfog minden nem-hitelesítési 401-est, és keményen átirányít `/app/login`-ra. Már implementálva van.

#### 2. A jelszó-visszaállítás nem csinál semmit

A `PasswordResetForm.tsx` renderelődik, de semmit nem küld be. Nincs mutáció, nincs visszajelzés.

**Részleges frontend javítás:** Tiltsd le a beküldő gombot, és jelenítsd meg a "még nem elérhető" üzenetet.  
**Teljes javítás:** Először szükséges a `POST /api/auth/reset-password` backend végpont.

---

### 🔧 Szükséges backend végpontok

Teljes specifikációért lásd a `summeries/BACKEND_NOTES.md` fájlt. Összefoglalás:

| #   | Végpont                                                     | Állapot                                        |
| --- | ----------------------------------------------------------- | ---------------------------------------------- |
| 1   | Role preload a `GET /users` és `GET /users/:id` végpontokon | Hiányzik — a jelvények üresen jelennek meg     |
| 2   | `username` + `ban_until` mezők a `UserReadDTO`-ban          | Hiányzik — `"—"` jelenik meg                   |
| 3   | `POST /admin/users/:id/ban`                                 | Nincs implementálva                            |
| 4   | `POST /admin/users/:id/unban`                               | Nincs implementálva                            |
| 5   | Admin-only middleware a `/admin/*` útvonalakon              | Nincs implementálva                            |
| 6   | `?search=` paraméter a `GET /users` végponton               | Kliensoldali megkerülő aktív                   |
| 7   | `POST /api/profiles/:id/purchases`                          | Nincs implementálva — a feloldás csak lokális  |
| 8   | `GET /api/profiles/:id/matches`                             | Nincs implementálva — a statisztikák helyőrzők |
| 9   | `POST /api/auth/reset-password`                             | Nincs implementálva                            |

### 🗂️ Fennmaradó webáruház backend-függőség

A vásárlási folyamat teljes mértékben implementálva van a frontend oldalon. Az egyetlen fennmaradó hiányosság, hogy a backend jelenleg nem vonja le az érméket a profilból vásárláskor — a `POST /purchases` végpont létrehozza a vásárlási rekordot, de az érmék levonásának logikája hiányzik a szerver oldalán. A fejlécben megjelenő érmeegyenleg nem csökken vásárlás után mindaddig, amíg ez a backend oldalon nincs javítva.

---

## Függelék: Új oldal hozzáadása

1. Hozd létre a komponenst az `src/components/pages/mainPages/MyPage.tsx` fájlban
2. Adj hozzá lusta importot a `src/main.tsx`-ben
3. Add hozzá az útvonalat a `createBrowserRouter` konfigurációban
4. Adj hozzá navigációs elemet az `src/components/nav/navLogic/navItems.ts`-ben (`labelKey` használatával)
5. Add hozzá a felirat fordítását az `src/locales/en/nav.json` és `src/locales/hu/nav.json` fájlokhoz
6. Használj `useSettings()` + téma segédeszközöket az összes stílushoz

```tsx
// Minimális oldal sablon
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { getBackgroundClasses, getTextColor } from "@/lib/utils";
import Navbar from "../../nav/Navbar";

export function MyPage() {
  const { settings } = useSettings();
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  return (
    <div className="p-4 h-screen overflow-y-auto">
      <Navbar />
      <div className={`mt-20 ${bgClass} ${textColor} rounded-xl p-6`}>
        {/* tartalom */}
      </div>
    </div>
  );
}
```
