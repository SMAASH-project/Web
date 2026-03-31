# SMAASH Kliens — Fejlesztői Dokumentáció

> **Stack:** React 19 · TypeScript · Vite · Tailwind CSS · React Query · Axios · react-i18next · Motion (Framer)
> **Alap útvonal:** `client/src/`

---

## Tartalomjegyzék

1. [Projektstruktúra](#1-projektstruktúra)
2. [Belépési pontok és útvonalak](#2-belépési-pontok-és-útvonalak)
3. [Provider-réteg](#3-provider-réteg)
4. [Téma-rendszer](#4-téma-rendszer)
5. [Animált hátterek](#5-animált-hátterek)
6. [Kontextusok](#6-kontextusok)
7. [Hook-ok és API-réteg](#7-hook-ok-és-api-réteg)
8. [Oldalak](#8-oldalak)
9. [Admin és Debug panelek](#9-admin-és-debug-panelek)
10. [Navigáció](#10-navigáció)
11. [Űrlapok](#11-űrlapok)
12. [i18n / Többnyelvű támogatás](#12-i18n--többnyelvű-támogatás)
13. [UI komponenskönyvtár](#13-ui-komponenskönyvtár)
14. [Típusok](#14-típusok)
15. [Segédeszközök és animációk](#15-segédeszközök-és-animációk)
16. [Teljesítmény és build](#16-teljesítmény-és-build)
17. [Ismert hibák](#17-ismert-hibák)
18. [Backend-függőségek](#18-backend-függőségek)

---

## 1. Projektstruktúra

```
client/
├── index.html
├── vite.config.ts
├── tsconfig.app.json
└── src/
    ├── main.tsx                # Router, lusta importok, withBoundary(), StrictMode
    ├── App.tsx                 # Hitelesítési átirányítás kapuja
    ├── RootLayout.tsx          # Összes provider + Suspense határ + Toaster
    ├── Wrapper.tsx             # Teljes oldalas gradiens + CSS egyéni tulajdonságok
    ├── animations/             # Újrafelhasználható Motion burkolók + oldal-szintű animációk
    │   ├── CardAnimation.tsx   # Spring scale-in belépés minden fő oldalhoz
    │   ├── LoadPost.tsx        # Lista-sor stagger (opacity + y)
    │   ├── NavbarAnimation.tsx
    │   ├── ColorInterpolation.tsx
    │   └── accordion/
    ├── assets/
    ├── backgrounds/            # Animált háttér canvas komponensek
    ├── components/
    │   ├── ErrorBoundary.tsx   # Osztály-alapú hibaboundary + withBoundary() (main.tsx-ben)
    │   ├── RequireAuth.tsx     # Layout útvonal-őr — nem bejelentkezett felhasználókat a /app/login-ra irányít
    │   ├── nav/                # Navigációs sáv, mobil fiók, fiókmenü
    │   └── ui/                 # Megosztott UI primitívek (shadcn-stílusban)
    ├── context/                # Hitelesítési és navigációs kontextusok
    ├── hooks/                  # React Query hook-ok (domain szerint felosztva)
    │   ├── useAuth.ts
    │   ├── useAdmin.ts
    │   ├── useDebug.ts
    │   ├── useProfile.ts
    │   └── useQueryHooks.ts    # Re-exportok + vegyes hook-ok
    ├── lib/
    │   ├── apiClient.ts        # Axios példány + interceptorok
    │   ├── animationTypes.ts   # AnimationKey típus + ANIMATION_LABELS
    │   ├── i18n.ts             # i18next konfiguráció
    │   ├── queryKeys.ts        # Centralizált query kulcs-gyár
    │   ├── toast.ts            # Pub/sub toast store (nincs külső függőség)
    │   ├── utils.ts            # Az összes segédmodul barrel re-exportja
    │   └── utils/              # dateFormat, themeClasses, liquidGlass,
    │                           #   colorMath, classnames, extractErrorMessage,
    │                           #   sectionStyle
    ├── locales/
    │   ├── en/                 # Angol — 10 névtér-fájl
    │   └── hu/                 # Magyar — azonos struktúra
    ├── pages/
    │   ├── admin/
    │   │   ├── AdminPage.tsx
    │   │   ├── AdminPageContent.tsx
    │   │   ├── useAdminPageLogic.ts
    │   │   ├── useBanDialogLogic.ts
    │   │   └── components/     # UserList, UserDetail, ProfilesPanel,
    │   │                       #   BanDialog, BanPresetCard, BanCustomRange, UserListItem
    │   ├── auth/               # LoginPage, SignUpPage, PasswordResetPage
    │   ├── debug/
    │   │   ├── DebugPage.tsx
    │   │   ├── DebugPageContent.tsx
    │   │   └── tabs/           # SystemTab, CacheTab, EndpointsTab, GameDataTab, shared
    │   ├── gallery/
    │   ├── leaderboard/
    │   ├── news/
    │   │   ├── NewsPage.tsx
    │   │   ├── useNewsPosts.ts
    │   │   ├── useNewsForm.ts
    │   │   ├── useNewsCategoryFilter.ts
    │   │   └── components/     # AddNews, EditButton, RemoveButton, Filter,
    │   │                       #   CategoryBadge, CategorySelector, RadioGroupChoiceCard, …
    │   ├── profile/
    │   ├── profile-selector/
    │   │   ├── ProfileSelectorPage.tsx
    │   │   ├── AddNewProfileDialog.tsx
    │   │   ├── ProfilesContext.tsx
    │   │   ├── ProfilesTypes.ts
    │   │   └── useProfiles.ts
    │   ├── releases/
    │   ├── settings/
    │   │   ├── SettingsContext.tsx
    │   │   ├── ColorContext.ts
    │   │   ├── ColorProvider.tsx
    │   │   ├── Themes.ts
    │   │   ├── SettingsPage.tsx
    │   │   └── components/
    │   ├── webstore/
    │   │   ├── WebstorePage.tsx
    │   │   ├── useItems.ts
    │   │   └── components/     # Item, CreateItemDialog, SearchItem, ItemFilters, RemoveItemButton
    │   └── NotFoundPage.tsx
    └── types/                  # Megosztott TypeScript interfészek
```

---

## 2. Belépési pontok és útvonalak

A hitelesítési oldalak (`login`, `signup`, `reset-password`) **eager-betöltésűek**. Minden más oldal **lustán töltődik be** a `React.lazy` segítségével. Minden lusta útvonal `withBoundary()`-vel van becsomagolva a `components/ErrorBoundary.tsx`-ből — így egy oldal hibája nem omlik össze az egész alkalmazás.

A bejelentkezési, regisztrációs és jelszó-visszaállítási oldalakon, valamint a catch-all útvonalon kívül minden útvonalat a `RequireAuth` (`components/RequireAuth.tsx`) véd — egy útvonal nélküli layout-elem, amely a nem bejelentkezett felhasználókat a `/app/login`-ra irányítja. Az admin és debug útvonalaknak ezen felül saját belső szerepkör-ellenőrzésük is van (nem adminok `<NotFoundPage />`-t látnak).

### Útvonaltáblázat

| Útvonal                 | Komponens                  | Hozzáférés      |
| ----------------------- | -------------------------- | --------------- |
| `/app`                  | `App` (átirányítási kapu)  | —               |
| `/app/login`            | `LoginPage`                | Nyilvános       |
| `/app/signup`           | `SignUpPage`               | Nyilvános       |
| `/app/reset-password`   | `PasswordResetPage`        | Nyilvános       |
| `/app/leaderboard`      | `LeaderboardPage`          | Bejelentkezve   |
| `/app/gallery`          | `GalleryPage`              | Bejelentkezve   |
| `/app/releases`         | `ReleasesPage`             | Bejelentkezve   |
| `/app/news`             | `NewsPage`                 | Bejelentkezve   |
| `/app/webstore`         | `WebstorePage`             | Bejelentkezve   |
| `/app/profile`          | `ProfilePage`              | Bejelentkezve   |
| `/app/profile-selector` | `ProfileSelectorPage`      | Bejelentkezve   |
| `/app/settings`         | `SettingsPage`             | Bejelentkezve   |
| `/app/admin`            | `AdminPage`                | Csak admin      |
| `/app/debug`            | `DebugPage`                | Admin + Support |
| `*`                     | `NotFoundPage`             | —               |

Az `App.tsx` beolvassa az `AuthContext.isLoggedIn` és `isInitializing` értékeket, majd átirányít `/app/releases`-re vagy `/app/login`-ra.

---

## 3. Provider-réteg

```
PersistQueryClientProvider   ← React Query + localStorage perzisztencia
  AuthProvider               ← isLoggedIn, userId, isAdmin, isSupport
    SettingsProvider         ← settings, updateSetting (perzisztált)
      NavbarProvider         ← legördülő menü hover/nyitott állapota
        ColorProvider        ← gradiens színek + animationKey (perzisztált)
          ProfileProvider    ← profiles[], selectedProfile (perzisztált userId szerint)
            Wrapper          ← gradiens div + CSS egyéni tulajdonságok
              Suspense       ← pörgő ikon lusta útvonalakhoz
                Outlet       ← aktív útvonal
```

A `<Toaster />` a provider-fán kívül renderelődik (a `PersistQueryClientProvider` testvéreként), így az értesítések útvonal-hibáktól függetlenül mindig láthatók.

**React Query alapértékek** (`RootLayout.tsx`-ben):

```ts
staleTime: 2 * 60 * 1000; // 2 perc
gcTime: 10 * 60 * 1000; // 10 perc
retry: 1;
refetchOnWindowFocus: true;
refetchOnReconnect: true;
```

A gyorsítótár `localStorage`-ba kerül a `createSyncStoragePersister` segítségével. A `whoami` lekérdezés kimarad ebből (`gcTime: 0`).

**Profilkiválasztás perzisztálása:** `localStorage` alatt `selected_profile_<userId>` kulccsal tárolódik. Visszatöltéskor validálva — ha a profil törölve lett, az első profil kerül kiválasztásra.

---

## 4. Téma-rendszer

A témát a `ColorContext`-ben és `localStorage`-ban tárolt három gradiens-szín vezérli. A `Wrapper.tsx` ebből CSS egyéni tulajdonságokat számít ki.

### CSS egyéni tulajdonságok

| Változó                | Leírás                             |
| ---------------------- | ---------------------------------- |
| `--theme-accent`       | A három szín megvilágított átlaga  |
| `--theme-accent-hover` | Hover állapothoz világosabb verzió |
| `--theme-accent-soft`  | Félig átlátszó hangsúlyszín        |
| `--theme-nav-border`   | Navigációs sáv keret színe         |
| `--theme-nav-shadow`   | Árnyék színe                       |

### Beállítási kapcsolók

| Kapcsoló            | Alapértelmezett | Hatás                                                             |
| ------------------- | --------------- | ----------------------------------------------------------------- |
| `useLiquidGlass`    | `true`          | Fagyott üveg hatás (backdrop-blur + átlátszóság)                  |
| `useDarkMode`       | `false`         | Az összes témázott osztály sötét változata                        |
| `useAnimations`     | `true`          | `false` = hátterek statikus képkockára fagyasztva                 |
| `language`          | `"en"`          | i18next nyelv (`"en"` vagy `"hu"`)                                |
| `animationOverride` | `null`          | `null` = téma alapértelmezett · `"none"` = ki · kulcs = rögzített · `"custom"` = effectMix rétegkészlet |

### Téma segédfüggvények

Mindig a `@/lib/utils`-ból importáld — soha ne írj inline ternáris téma logikát:

```ts
getTextColor(useLiquidGlass, useDarkMode)
getSubtextColor(useLiquidGlass, useDarkMode)
getTextShadow(useLiquidGlass, useDarkMode)
getBackgroundClasses(useLiquidGlass, useDarkMode, variant?)
// variant: "base" | "light" | "strong"
getButtonClasses(useLiquidGlass, useDarkMode, variant?)
// variant: "primary" | "secondary" | "outline"
getInputClasses(useLiquidGlass, useDarkMode)
getDialogClasses(useLiquidGlass, useDarkMode)
getDialogFooterClasses(useLiquidGlass, useDarkMode)
sectionStyle(animReady, delayMs)
// visszaad: { opacity, transform, transition, willChange }
```

### Előre beállított témák (`Themes.ts`)

> **Az `applyTheme()`** csak a `colorLeft/Middle/Right` és az `animationKey` értékeket frissíti. Az `effectMix`-et **nem törli** — az egyéni effektus-kombináció megmarad témák közötti váltáskor. Az `animationOverride` értéke szintén változatlan marad, így ha `"custom"` volt aktív, az egyéni effektus az új palettával együtt tovább fut.



| Téma      | Alapértelmezett animáció |
| --------- | ------------------------ |
| Ocean     | fishtank                 |
| Midnight  | deepspace                |
| Lavender  | aurora                   |
| Aurora    | aurora                   |
| Amethyst  | lavalamp                 |
| Fire      | lavalamp                 |
| Neon Noir | synthwave                |
| Sunset    | sakura                   |
| Emerald   | sakura                   |
| Rose Gold | sakura                   |
| Slate     | storm                    |
| Monsoon   | puddleripples            |
| Abyss     | bioluminescence          |
| Starmap   | constellation            |
| Nebula    | particleweb              |
| Void      | void                     |

---

## 5. Animált hátterek

Minden háttér canvas komponens, amely `fixed inset-0 z-0 pointer-events-none` stílussal renderelődik. Az `AnimatedBackground.tsx` irányítja őket `AnimationKey` alapján.

### Elérhető hátterek

| Kulcs         | Komponens               | Leírás                                                                                                                                                                                                                                                       |
| ------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fishtank`    | `FishtankBackground`    | 8 szóló hal szinuszos útvonallal + 2 iskola (10–18 kis hal). Buborékok, hínár-sziluettek a keret szélén, korall-ágak, kausztikus fénypanelek a felső részen, fénysugarak a felszínről, felszíni csillogás, mélységi sötét vignettel az aljánál (nincs homokos aljzat).       |
| `deepspace`   | `DeepSpaceBackground`   | 300 színes csillag, Tejút-sáv, élénk ködfoltok, hullócsillagok (max. 5 egyszerre).                                                                                                                                                                                           |
| `aurora`      | `AuroraBackground`      | Függőleges függönyrostok, lebegő színsávok, csillagvillogás. CSS + motion/react.                                                                                                                                                                                             |
| `lavalamp`    | `LavaLampBackground`    | Morpholó blobok külső izzással és belső fényszikrával. CSS keyframes.                                                                                                                                                                                                        |
| `synthwave`   | `SynthwaveBackground`   | Perspektívarács, retró nap, scanline réteg. Canvas.                                                                                                                                                                                                                          |
| `sakura`      | `SakuraBackground`      | Hulló szirmok szirmonkénti sodródás/forgás CSS tulajdonságokkal.                                                                                                                                                                                                             |
| `storm`           | `StormBackground`           | Canvas esőcseppek + villámcsapás, lebegő CSS felhőrétegek.                                                                                                                                                                                                                      |
| `puddleripples`   | `PuddleRipplesBackground`   | Felülnézetből eső éri a sötét vizet. Koncentrikus tágulő gyűrűk (3 db/csepp) véletlenszerű helyeken jelennek meg ~280ms-enként, 2,8s alatt 55–100px sugarúra tágulnak, kúposodó vonalszélességgel és elhalványuló átlátszósággal. Canvas.                                      |
| `bioluminescence` | `BioluminescenceBackground` | 38 izzó gömb türkiz/kék/zöld palettán lassan sodródik mélyfekete háttéren. Minden gömbnek radiális halo gradiens + fényes fehér mag van, átlátszósága független szinuszos cikluson pulzál (0,06–0,52 alfa). Canvas.                                                             |
| `constellation`   | `ConstellationBackground`   | 110 villogó csillag lassú parallaxis sodródással. A közeli csillagokat (80–190px távolságon belül) gradiens vonalak kötik össze, amelyek független lassú ciklusokon halványodnak be és ki. A nagyobb csillagok puha fényt bocsátanak ki. Canvas.                                |
| `void`            | `VoidBackground`            | Mélytengeri biolumineszcens jelenet. 3 nagy háttér-mélységi folt (tiszta radiális fény-homály), 12 ambiens gömb, 70 részecskéből álló tengeri hó, és 4 előtéri medúza (lapított kuppola + bezier csáp, fölfelé sodródás, felső szélnél újraindul). Minden medúza ~10–22 másodpercenként finom tágulógyűrű-villámot bocsát ki. Erős széli vignet. Canvas. |
| `particleweb`     | `ParticleWebBackground`     | 80 lebegő részecske. Vonalak rajzolódnak a 160px-en belüli részecskék között. Az egérkurzor csomópontként viselkedik (200px-en belül vonalakat húz, 60px-en belül taszít). A részecskék pulzálnak és puha fényt bocsátanak ki. Színek interpolálva a teljes téma-gradiensen. |

### Animáció-feloldás (`Wrapper.tsx`)

```
useAnimations = false              → a háttér egyetlen statikus képkockát renderel (befagyasztva)
useAnimations = true
  animationOverride = null         → Theme.animationKey használata
  animationOverride = "none"       → kényszer kikapcsolás
  animationOverride = <kulcs>      → rögzítés témától függetlenül
  animationOverride = "custom"     → CompositeBackground rendereli az effectMix rétegkészletet
```

> **Statikus mód:** Minden canvas-alapú háttér egyszer meghívja a `renderFrame(0)`-t mountoláskor, az rAF-ciklus indítása előtt, így `useAnimations = false` esetén is megjelenik egy befagyasztott pillanatkép. Az rAF-ciklus fut tovább, de `paused = true` esetén kihagyja a renderelést — az animáció azonnal folytatódik, ha újra engedélyezik.

### Effektus-keverés (`EffectMixDialog` / `CompositeBackground`)

Az egyéni effektus-kombinációk a `ColorContext.effectMix`-ben (`EffectLayerConfig | null`) tárolódnak, és `localStorage`-ba perzisztálódnak. Ha `animationOverride === "custom"`, a `CompositeBackground` renderel az `AnimatedBackground` helyett, egyszerre több effektust rétegezve.

**`EffectLayerConfig`** — `Partial<SubEffectMap>`. Egy kulcs jelenléte az effektus engedélyezettségét jelenti; hiánya = letiltott.

**`CompositeBackground`** (`src/backgrounds/CompositeBackground.tsx`) rögzített z-index sorrendben rétegezi az engedélyezett effektusokat:

| Z | Effektus          | Al-effektusok (mind boolean, mind `true` alapból)                                        |
|---|-------------------|------------------------------------------------------------------------------------------|
| 1 | `deepspace`       | showStars · showMilkyWay · showNebulae · showShootingStars                               |
| 2 | `aurora`          | showColorBands · showFibers · showStars · showMoon                                       |
| 3 | `void`            | showDepthBlobs · showJellyfish · showAmbientOrbs · showMarineSnow                        |
| 4 | `bioluminescence` | showOrbs · showPulses · showVignette                                                     |
| 5 | `constellation`   | showStars · showConstellationLines                                                        |
| 6 | `lavalamp`        | showBlobs · showHighlight                                                                 |
| 7 | `synthwave`       | showSky · showSun · showGrid · showScanlines                                             |
| 8 | `puddleripples`   | showRipples                                                                               |
| 9 | `fishtank`        | showFish · showBubbles · showSeaweed · showCaustics · showLightShafts                    |
|10 | `particleweb`     | showParticles · showConnections                                                           |
|11 | `storm`           | showRain · showLightning · showClouds · showGroundShimmer                                |
|12 | `sakura`          | showPetals · showBokeh                                                                    |

Propok: `effectMix`, `colorLeft/Middle/Right`, `paused`, `preview?`. Ha `preview={true}`, `absolute` elhelyezést használ `fixed` helyett.

**`EffectMixDialog`** (`src/pages/settings/components/EffectMixDialog.tsx`) — a Beállítások oldalról nyitható meg:

- **Bal panel:** mind a 12 effektus accordion listája, effektusonként be/ki `Switch` kapcsolóval és al-effektus kapcsolókkal.
- **Jobb panel:** élő animációs `CompositeBackground` előnézet (`w-80`, `min-h-100`), amely a `pendingMix`-et mutatja az aktuális szín-gradiensen. Az animációk élőben futnak (nem szünetelnek), hogy minden effektus látható legyen.
- **Alkalmazás:** a `pendingMix`-et elmenti a `context.effectMix`-be + `animationOverride = "custom"`-ra állítja.
- **Törlés:** az `effectMix`-et `null`-ra állítja, és törli az `animationOverride`-ot, ha `"custom"` volt.
- A párbeszédpanel állapota nyitáskor a `context.effectMix`-ből inicializálódik; a meg nem erősített változtatások elvetődnek.

> **Tipp:** A `DEFAULT_SUB_EFFECTS` (az `animationTypes.ts`-ből) az effektus bekapcsolásakor automatikusan kerül alkalmazásra, így minden al-effektus alapból engedélyezett.

### Új háttér hozzáadása

1. Hozd létre a `src/backgrounds/MyBackground.tsx` fájlt — elfogad `{ colorLeft, colorMiddle, colorRight, paused? }` propokat, renderel `<canvas className="fixed inset-0 z-0 opacity-XX pointer-events-none" />`-t
2. Add hozzá `"mykey"`-t az `AnimationKey`-hez a `src/lib/animationTypes.ts`-ben
3. Add hozzá `mykey: "Saját Felirat"` az `ANIMATION_LABELS`-be
4. Add hozzá `case "mykey": return <MyBackground {...shared} />;`-t az `AnimatedBackground.tsx`-ben
5. Opcionálisan adj hozzá téma-presetet a `Themes.ts`-be

### Teljesítmény részletek

**Késleltetett fade-in:** Nehéz backdrop-blur kártyás útvonalakon (`/app/settings`, `/app/profile`, `/app/admin`, `/app/debug`) az `AnimatedBackground` `opacity: 0`-val indul. `FADE_IN_DELAY_MS` (1600ms) után vált `opacity: 1`-re 400ms alatt.

**Keresztfade:** Az `animationKey` változásakor a kimenő réteg `opacity: 0`-ra, a bejövő `opacity: 1`-re halványodik egyszerre, `CROSSFADE_MS` (600ms) alatt.

**`paused` prop:** Canvas hátterek egy képkockát rajzolnak, majd leállítják az `rAF` ciklust. CSS hátterek `animationPlayState: "paused"`-t állítanak be.

---

## 6. Kontextusok

### `AuthContext`

```ts
{
  isLoggedIn: boolean;
  isInitializing: boolean; // true, amíg a whoami fut
  userId: bigint | null;
  isAdmin: boolean;
  isSupport: boolean;
  (setUserId, setIsLoggedIn, setIsAdmin, setIsSupport);
}
```

Az `isSupport` akkor kerül beállításra, ha a `whoami` `role === "support"`-ot ad vissza. Mindkét `isAdmin` és `isSupport` értéket törölni kell kijelentkezéskor — ez a `Navbar`, `AccountMenu` és `ProfileSelectorPage` komponensekben történik.

### `SettingsContext`

```ts
const { settings, updateSetting } = useSettings();
updateSetting("useDarkMode", true);
updateSetting("language", "hu");
// localStorage "settings" kulcs alatt tárolódik
// Az i18next-et is szinkronban tartja induláskor és nyelvváltáskor
```

### `ProfileContext`

```ts
const { profiles, selectedProfile, addProfile, removeProfile, selectProfile } =
  useProfiles();

interface Profile {
  id?: number;
  name: string; // display_name
  avatar: string; // /api/profiles/:id/pfp URL
  avatarFile?: File | null;
  coins?: number;
  last_login?: string;
}
```

A kiválasztott profil `localStorage` alatt `selected_profile_<userId>` kulccsal tárolódik. Visszatöltéskor validálva.

### `ColorContext`

```ts
const {
  colorLeft,
  colorMiddle,
  colorRight,
  animationKey,
  effectMix,          // EffectLayerConfig | null — egyéni rétegzett effektus-kombináció
  setColorLeft,
  setColorMiddle,
  setColorRight,
  setAnimationKey,
  setEffectMix,       // (mix: EffectLayerConfig | null) => void
} = useContext(ColorContext);
// localStorage "color-settings" kulcs alatt tárolódik
// animationKey: AnimationKey | null — az applyTheme() állítja be; figyelmen kívül marad, ha animationOverride === "custom"
// effectMix: alapértelmezetten null; az EffectMixDialog állítja; az applyTheme() NEM törli
```

---

## 7. Hook-ok és API-réteg

### `src/lib/apiClient.ts`

- Alap URL: `/api`, `withCredentials: true`
- `Content-Type`: automatikusan `application/json`; `FormData` esetén kihagyva
- **401-es interceptor:** nem-hitelesítési 401-es válaszoknál `/app/login`-ra irányít. Hitelesítési végpontok kizárva.

### `src/lib/queryKeys.ts`

```ts
queryKeys.profiles.all; // ["profiles"]
queryKeys.profiles.byUserId(id); // ["profiles", "byUserId", id]
queryKeys.githubReleases.all; // ["githubReleases"]
queryKeys.items.all; // ["items"]
queryKeys.purchases.byProfileId(id); // ["purchases", "byProfileId", id]
```

A debug panel saját `debugQueryKeys`-t exportál az `useDebug.ts`-ből.

### `src/hooks/useAuth.ts`

| Hook                           | Metódus | Végpont         |
| ------------------------------ | ------- | --------------- |
| `useWhoAmIQuery()`             | GET     | `/users/whoami` |
| `useLoginMutation()`           | POST    | `/auth/login`   |
| `useSignupMutation()`          | POST    | `/auth/signup`  |
| `useLogoutMutation()`          | POST    | `/auth/logout`  |
| `useUpdateUserEmailMutation()` | PUT     | `/users/:id`    |

### `src/hooks/useProfile.ts`

| Hook                                | Leírás                                                                                                                                                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useProfilesQuery(userId)`          | Összes profil lekérése; `?v=` gyorsítótár-elkerülő paramétert fűz az avatar URL-ekhez                                                                                                                                                                    |
| `useAddProfileMutation()`           | `POST /users/:id/profiles`, opcionális `profile_picture: File`                                                                                                                                                                                           |
| `useUpdateProfileMutation()`        | `PUT /profiles/:id`. Támogatja az `optimistic` és `invalidateAfterSuccess` opciókat                                                                                                                                                                      |
| `useDeleteProfileMutation()`        | `DELETE /profiles/:id`. Optimista eltávolítás hiba esetén visszaállítással                                                                                                                                                                               |
| `useUploadProfilePictureMutation()` | `POST /profiles/:id/pfp` multipart. Siker esetén: frissíti a verziót a `sessionStorage["pfp_versions"]`-ban, majd `setQueriesData`-val csak az `avatar_url` mezőt patcheli az összes profil gyorsítótár-bejegyzésben — **nem indít hálózati refetch-et** |

**Megjelenítési név szabályok:** max. 20 karakter a `clampDisplayName()` segítségével. Duplikált nevekhez véletlenszerű 4 karakteres utótag kerül.

### `src/hooks/useAdmin.ts`

| Hook                       | Végpont                   | Megjegyzések                                                              |
| -------------------------- | ------------------------- | ------------------------------------------------------------------------- |
| `useAdminUsersQuery()`     | `GET /users`              | Kliensoldali szűrés, amíg a backend nem támogatja a `?search=` paramétert |
| `useBanUserMutation()`     | `POST /users/:id/ban`     | Body: `{ id, period }` (percek). Végleges = 50 év percekben               |
| `useUnbanUserMutation()`   | `POST /users/:id/unban`   | Nincs body                                                                |
| `usePromoteUserMutation()` | `POST /users/:id/promote` | Body: `{ id, target_role: "admin"\|"support" }`                           |
| `useDemoteUserMutation()`  | `POST /users/:id/demote`  | Nincs body — mindig `"user"`-re fokoz le                                  |

### `src/hooks/useDebug.ts`

Statisztikai lekérdezések (a `LeaderboardPage` is használja):

- `useTopItemsQuery()` — `GET /stats/top/items`
- `useTopPlayersQuery()` — `GET /stats/top/players`
- `useTopLevelsQuery()` — `GET /stats/top/levels`
- `useLeaderboardQuery()` — `GET /stats/leaderboard`

Játékadatok (csak admin végpontok):

- `useDebugCharactersQuery()` — `GET /characters`
- `useDebugLevelsQuery()` — `GET /levels`
- `useDebugItemsQuery()` — `GET /items?page=1&page_size=100`

### Tartalmi hook-ok (`useQueryHooks.ts`)

```ts
useReleasesInfiniteQuery(os, pageSize?)
useItemsInfiniteQuery(filters?, pageSize?)
useNewsInfiniteQuery(categories?, pageSize?)
```

### `src/lib/toast.ts`

Minimális pub/sub store — nincs külső függőség.

```ts
import { toast } from "@/lib/toast";
toast.success("Mentve!");
toast.error("Valami hiba történt.");
toast.info("Betöltés…");
// subscribe(fn): visszaad egy leiratkozó függvényt — a <Toaster /> használja belül
```

A `toast.error/success/info` hívások az összes mutáció-kezelőben megtalálhatók (admin műveletek, hírek CRUD, webáruház vásárlás/létrehozás/törlés).

---

## 8. Oldalak

### Ranglista (`/app/leaderboard`)

Nyilvános. Felváltotta a „Rólunk" oldalt a navigációban. Négy statisztikai panel: Győzelmi ranglista, Legaktívabb játékosok, Legtöbbet játszott pályák, Legtöbbet vásárolt tárgyak. Panelenkénti top 10, éremszínek (arany/ezüst/bronz) az első háromnak. Animációk: `CardAnimation` belépés → `sectionStyle` lépcsőzetes panel fade (0/80/160/240ms késés) → `LoadPost` sor-stagger minden panelen belül.

### Kiadások (`/app/releases`)

Lekéri a `GET https://api.github.com/repos/SMAASH-project/SMAASH/releases` végpontot. Platform-felismerés fájlkiterjesztés alapján: `.apk`/`.aab` → Android, `.ipa` → iOS. `staleTime: 0`, `refetchOnMount: true`, `refetchInterval: 5 * 60 * 1000`. A `DownloadReleaseButton` új lapon nyitja meg a GitHub eszköz URL-jét; le van tiltva tooltip-pel, ha nincs eszköz a kiválasztott platformhoz.

### Hírek (`/app/news`)

Markdown-megjelenítésű bejegyzések (`react-markdown` + `remark-gfm`) kategória-szűrővel, képtámogatással (`imagePosition: "Top"|"Right"`, `imageSize`), admin szerkesztés/törlés. `LoadPost` stagger a bejegyzéseken. Betöltés közben 3 skeleton kártya jelenik meg.

**Kategória-színek:**

| Kategória      | Szín                  |
| -------------- | --------------------- |
| Major update   | `#3b82f6` (kék)       |
| Minor update   | `#10b981` (zöld)      |
| Patch          | `#f59e0b` (borostyán) |
| Unrelated news | `#8b5cf6` (lila)      |

### Webáruház (`/app/webstore`)

Tárgy bolt. Érmeegyenleg a `selectedProfile.coins`-ból. Szűrők: típus, ritkaság, harci típus, tulajdonlás. Végtelen görgetés (12/oldal). Az első betöltés közben 8 skeleton tárgy-kártya jelenik meg.

**Adatfolyam:**

1. `GET /api/items?page=1&page_size=100` — összes tárgy
2. `GET /profiles/:id/purchases` — tulajdonlás (⚠️ lásd Ismert hibák §17)
3. `ownedNames` Set a `p.item` mezőből
4. Vásárlás: `POST /purchases` — body: `{ player_profile_id, item_id, count: 1, date: "YYYY-MM-DD" }`
5. Siker esetén: vásárlások + profilok lekérdezések érvénytelenítése (érmék frissítése)

**Item → WebstoreItem leképezés:** a backend típust és harci típust kategória-szövegekként kódolja (`"Character"`, `"Skin"`, `"Melee"`, `"Ranged"`). Az `itemDTOToWebstoreItem()` visszaalakítja ezeket.

**Admin funkciók:** Létrehozás (`POST /api/items`) és törlés (`DELETE /api/items/:id`) optimista eltávolítással + visszaállítással.

### Profil (`/app/profile`)

Háromoszlopos elrendezés:

```
[ Avatar / Név / Szerkesztés ] | [ Statisztikák ] | [ Meccs-előzmények ]
```

Élő adatok: érmék, utoljára aktív, profil azonosító. Helyőrző (halvány): győzelmek, vereségek, győzési arány. Meccs-előzmények: üres — a `GET /api/profiles/:id/matches` végpontra vár.

### Beállítások (`/app/settings`)

Kapcsolók (Animációk, Folyékony üveg, Sötét mód, Nyelv), téma-presetek, egyéni 3-megállós színválasztó, animáció-felülbírálat sor **Effektus-keverés** gombbal (megnyitja az `EffectMixDialog`-ot). `sectionStyle` lépcsőzetes szekciók (0/80/160/240ms). Az `animReady` prop: amíg `false`, a `backdrop-blur-*` el van távolítva a kártyából + a szekciók láthatatlanok; `true`-ra vált a `CardAnimation` spring befejezése után.

---

## 9. Admin és Debug Panelek

### Admin Panel (`/app/admin`)

Hitelesítés-védelmes: a nem-adminok `<NotFoundPage />`-t látnak (megkülönböztethetetlen egy valódi 404-estől).

**Elrendezés:**

```
[ Felhasználólista + Keresés ] | [ Felhasználó részletei + Műveletek ] | [ Felhasználó profiljai + Érme-szerkesztő ]
```

Az oszlopok `motion.div`-val animáltan jelennek meg a `CardAnimation` után (késések: 50ms, 180ms, 310ms). A felhasználólista sorai `LoadPost` stagger-t használnak. A felhasználói részletek `AnimatePresence mode="wait"` a `selectedUser.id`-n alapulva — felhasználóváltáskor keresztfade-del (0ms fejléckártya, 80ms statisztika).

**Lapozás:** A felhasználólista kliensoldali lapozással van ellátva, `PAGE_SIZE = 15`. Előző/Következő vezérlők jelennek meg a lista alatt. Az oldal automatikusan visszaáll az elsőre, ha a keresési szöveg megváltozik.

**Toast visszajelzés:** Minden admin művelet (kitiltás, feloldás, promóció, lefokozás, érme-mentés) `toast.success` vagy `toast.error` hívást vált ki a `src/lib/toast`-on keresztül.

**Betöltési állapot:** Miközben a felhasználók betöltődnek, a lista 6 `<Skeleton>` sort mutat pörgő ikon helyett.

**Szerepkörjelvények:**

| Backend érték | Szín            | Ikon         |
| ------------- | --------------- | ------------ |
| `"admin"`     | Lila            | Pajzs        |
| `"support"`   | Égkék           | Fejhallgató  |
| `"user"`      | Semleges szürke | Felhasználók |

**Szerepkör-műveletek:**

- `user` → Promóció Supportra (égkék), Promóció Adminra (lila)
- `support` → Promóció Adminra (lila), Lefokozás Supportra (égkék), Lefokozás Userre (borostyán)
- `admin` → Lefokozás Supportra (égkék), Lefokozás Userre (borostyán)

**Érme-szerkesztő** (a Profilok panelben, kiválasztott profil esetén jelenik meg):

- Szám-beviteli mező + ±100 gombok + gyors presetek (1e, 5e, 10e)
- Mentés: szürke (nincs változás) → borostyán (módosítva) → zöld + pipa (mentve)
- Meghívja a `PUT /profiles/:id` végpontot: `{ id, display_name, coins }`
- A draft automatikusan szinkronizál profilváltáskor

**Kitiltási párbeszédpanel:**

- Presetek: 1ó / 12ó / 24ó (timeout), 7n / 31n / 365n (kitiltás), Végleges
- Egyéni: naptár + időpörgetők (ÓÓ:PP, körbe-forgatással)
- Ok: 8 preset chip + szabad szöveg textarea (opcionális)
- Megerősítés: `POST /users/:id/ban` — body: `{ id, period }` (percek)

### Debug Panel (`/app/debug`)

Admin + support. Rögzített magasságú kártya (`flex-1`, kitölti a viewportot). Bal oldalsáv (144px) fül-gombokkal + alján rögzített Refresh gombbal. Jobb oldal: `AnimatePresence mode="wait"` — fül-tartalom balra/jobbra csúszik váltáskor (200ms). Az oldalsáv és a tartalom terület egyenként `motion.div`-val animálódnak be (`opacity: 0, y: 18` → `opacity: 1, y: 0`) lépcsőzetes késésekkel (50ms oldalsáv, 180ms tartalom), megegyezve az admin panel belépési animációjával.

A fül tartalmak külön fájlokba vannak szétválasztva a `src/pages/debug/tabs/` mappában:

**Fülek:**

| Fül         | Fájl               | Hozzáférés      | Tartalom                                                                                                                                                                                                                                                    |
| ----------- | ------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendszer    | `SystemTab.tsx`    | admin + support | Böngésző (user agent, nyelv, online állapot, kapcsolat, memória, CPU), Kijelző (viewport, képernyő, pixel arány, színmélység), Munkamenet (szerepkör, user ID, query cache szám, időzóna, helyi idő), Környezet (alap URL, útvonal, build mód, dev szerver) |
| Cache       | `CacheTab.tsx`     | admin + support | Élő React Query cache explorer. Szűrés query kulcs alapján. Kibővíthető bejegyzések: státusz ikon, utoljára frissítve, nyers adat (1500 karakterre csonkítva), bejegyzésenkénti Érvénytelenítés + Eltávolítás. Összes érvénytelenítése + Frissítés gombok.  |
| Végpontok   | `EndpointsTab.tsx` | admin + support | API tesztelő. Metódus-választó (GET/POST/PUT/DELETE/PATCH, színkódolva), útvonal-bevitel, JSON body textarea, Küldés gomb. Gyors útvonal presetek. Válasz panel: státusz kód (színes), késleltetés, nyers JSON.                                             |
| Játékadatok | `GameDataTab.tsx`  | csak admin      | Karakterek rács (avatar + név + ID), Pályák rács (kép + név + ID), Tárhely tárgyak lista (ID + név + ritkaság jelvény + ár). Mind admin-only végpontokból töltődik be.                                                                                      |
| Vizuális    | `SightTab.tsx`     | admin + support | Animációsebesség-választó (0.25×–4×), navigációs sáv felülírása (auto/megjelenít/elrejt), újratöltés. Vizuális kapcsolók: Háttér homályosítás letiltása, Elrendezési szegélyek, Elem-vizsgáló (lebegő kártya elemcímkével, azonosítóval, osztályokkal és 11 számított CSS tulajdonsággal, automatikus tükrözéssel viewport széleken). Feliratok: FPS számláló, görgetési pozíció. Értesítés teszt. CSS változók nézegető (5 témaváltozó). Az `ElementInspectorOverlay` a `RootLayout.tsx`-ben él és a `settings.elementInspector` aktiválja. |

---

## 10. Navigáció

**Asztali navigációs sáv:** Admin Panel gomb (pajzs ikon, csak admin) + Debug Panel gomb (hibajelző ikon, admin + support) bal felül. Középen: nav elemek. Jobb oldalt: felhasználónév + fiókmenü legördülő.

**Mobil fiók (`MobileNavMenu`):** Teljes navigációs linkek + Fiók szekció (Profil, Beállítások, Admin Panel ha admin, Debug Panel ha admin/support, Kijelentkezés).

**Nav elemek** (`navItems.ts`): Ranglista, Galéria, Kiadások, Webáruház, Hírek. Feliratok `labelKey` segítségével a `src/locales/*/nav.json`-ból (tartalmaz `leaderboard` és `debugPanel` kulcsokat).

---

## 11. Űrlapok

Mindegyik `<FormAlert>`-et használ a hibák megjelenítéséhez és az `extractErrorMessage()`-t az Axios hibák normalizálásához. A hitelesítési űrlapok a `src/pages/auth/` mappában találhatók.

### `LoginPage.tsx`

Email + jelszó. Siker esetén: beállítja az `isLoggedIn`/`userId`/`isAdmin`/`isSupport` értékeket, navigál `/app/profile-selector`-ra. 401 → specifikus „Hibás email cím vagy jelszó" üzenet.

### `SignUpPage.tsx`

Felhasználónév / email / jelszó / megerősítés. Kliensoldali validációs hibák elsőbbséget élveznek. reCAPTCHA v3 — a token csak beküldéskor kerül lekérésre az `executeRecaptcha("signup")` segítségével, nem folyamatosan.

### `PasswordResetPage.tsx`

⚠️ Renderelődik, de nem indít mutációt. Blokkolva a `POST /api/auth/reset-password` backend végpontra várva.

### `ProfileSelectorPage.tsx`

Profilok avatarként megjelenítve. „Profilok kezelése" engedélyezi a törlést. Kijelentkezés törli az `isAdmin` + `isSupport` értékeket. `React.memo` + `useCallback` a teljesítmény érdekében.

### `AddNewProfileDialog.tsx`

Párbeszédpanel: megjelenítési név + opcionális avatar. Korlát: 5 profil felhasználónként. Teljes fordítás (EN/HU).

---

## 12. i18n / Többnyelvű támogatás

**Nyelvek:** Angol (`en`) · Magyar (`hu`)

A `src/lib/i18n.ts`-t a `main.tsx`-ben minden komponens renderelése előtt importálni kell.

### Névterek

| Fájl            | Felhasználva                                                                               |
| --------------- | ------------------------------------------------------------------------------------------ |
| `auth.json`     | Bejelentkezés, Regisztráció, Jelszó-visszaállítás                                          |
| `nav.json`      | Navigációs sáv, mobil fiók, nav elemek (tartalmaz `leaderboard` és `debugPanel` kulcsokat) |
| `settings.json` | Beállítások oldal                                                                          |
| `profile.json`  | Profil oldal, UpdateSheet, ProfileSelector, AddNewProfileDialog                            |
| `releases.json` | Kiadások oldal                                                                             |
| `news.json`     | Hírek oldal                                                                                |
| `webstore.json` | Webáruház oldal                                                                            |
| `admin.json`    | Admin panel, kitiltási párbeszédpanel                                                      |
| `debug.json`    | Debug panel                                                                                |
| `common.json`   | 404 oldal, megosztott feliratok                                                            |

A nyelv a `SettingsContext`-ben tárolódik. Az `updateSetting("language", "hu")` automatikusan meghívja az `i18n.changeLanguage()`-t.

### Új nyelv hozzáadása

1. Hozz létre `src/locales/<kód>/` mappát ugyanazzal a 10 JSON fájllal
2. Importáld az `src/lib/i18n.ts`-ben és add hozzá a `resources` objektumhoz
3. Adj hozzá gombot a `SettingsPageContent.tsx`-ben és `LanguageToggle.tsx`-ben
4. Add hozzá a kódot a `Language` típushoz a `SettingsContext.tsx`-ben

---

## 13. UI komponenskönyvtár

A komponensek a `src/components/ui/` mappában találhatók, shadcn mintákkal (Radix UI + Tailwind).

| Komponens        | Megjegyzések                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`         | Változatok a `button-variants.ts` segítségével                                                                                                               |
| `ButtonGroup`    | Vízszintes/függőleges csoportosított gombok                                                                                                                  |
| `Input`          | Standard szövegbeviteli mező                                                                                                                                 |
| `Card`           | Konténer kártya                                                                                                                                              |
| `Avatar`         | Tartalék kezdőbetűkkel; `size` prop                                                                                                                          |
| `Badge`          | Állapot/kategória feliratok                                                                                                                                  |
| `Dialog`         | Modal — `getDialogClasses`-t használ                                                                                                                         |
| `Sheet`          | Kihúzható oldalpanel                                                                                                                                         |
| `DropdownMenu`   | Radix legördülő menü                                                                                                                                         |
| `Popover`        | Radix felugró ablak                                                                                                                                          |
| `Switch`         | Kapcsoló                                                                                                                                                     |
| `Calendar`       | Egyéni tartomány-naptár — nincs `react-day-picker`. A tartomány-kiemelés összefüggő pillulasávként jelenik meg. A `fromDate` blokkolja a múltbeli dátumokat. |
| `ColorPicker`    | Hex szín beviteli mező                                                                                                                                       |
| `LanguageToggle` | EN/HU zászlógombok hitelesítési oldalakhoz                                                                                                                   |
| `FormAlert`      | Beágyazott figyelmeztetés — `variant: "error"\|"success"\|"info"`. Megoldja a `[object Object]` hibajelenítési hibát.                                        |
| `Separator`      | Vízszintes/függőleges elválasztó                                                                                                                             |
| `Resizable`      | Húzással átméretezhető panelek                                                                                                                               |
| `Skeleton`       | Pulzáló helyőrző — `animate-pulse bg-white/10`. A `className` prop-pal méretezhető.                                                                         |
| `Toaster`        | Rögzített jobb-alsó toast konténer. Feliratkozik a `src/lib/toast`-ra. Siker/hiba/info értesítéseket renderel ikonokkal, bezárás gombbal és `slide-in-from-right` animációval. |

---

## 14. Típusok

### `src/types/PageTypes.ts`

```ts
interface NewsPost {
  id: string;
  title: string;
  category: "Major update" | "Minor update" | "Patch" | "Unrelated news";
  image?: string;
  imageAlt?: string;
  imagePosition?: "Top" | "Right";
  imageSize?: number;
  content: string; // Markdown
  createdAt: DateTime;
}

interface WebstoreItem {
  id: string;
  name: string;
  kind: "Skin" | "Character";
  combatType?: "Melee" | "Ranged";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  description: string;
  price: number;
  owned: boolean; // kliensoldali vásárlásokból levezetett
  createdAt: DateTime;
}

interface Release {
  id: string;
  version: string;
  supports: string[];
  downloadUrls: Partial<Record<string, string>>;
  createdAt: DateTime;
}
```

---

## 15. Segédeszközök és animációk

### `src/lib/utils/sectionStyle.ts`

```ts
sectionStyle(animReady: boolean, delayMs: number): CSSProperties
```

Visszaad: `{ opacity, transform, transition, willChange }`. Amíg `animReady` false: `opacity: 0`, `translateY(10px)`, nincs átmenet. Miután true-ra vált: `delayMs` késéssel fade-in. A Beállítások, Admin, Ranglista, Debug oldalak használják lépcsőzetes szekció-belépéshez.

### `src/lib/utils/extractErrorMessage.ts`

Axios hibákat olvasható szöveggé alakít. Prioritás: `data` mint string → `data.error` → `data.message` → `error.message` → megadott fallback.

### `src/lib/utils/colorMath.ts`

```ts
getAverageHexColor(colors: string[]): string
lightenHexColor(hex: string, amount: number): string  // 0.0–1.0
toRgbaColor(hex: string, alpha: number): string
```

### `src/lib/utils/dateFormat.ts`

```ts
formatDate("2026-03-21T17:30:00Z"); // "2026. márc. 21."
formatDateTime("2026-03-21T17:30:00Z"); // "2026. márc. 21., 17:30"
// Elfogad Luxon DateTime, JS Date, ISO string vagy undefined értéket
```

### Animációs segédeszközök

**`CardAnimation`** (`src/animations/CardAnimation.tsx`) — spring scale-in belépés (`scale: 0→1`, spring `visualDuration: 1.5, bounce: 0.2`). Minden fő oldal használja.

**`LoadPost`** (`src/animations/LoadPost.tsx`) — `opacity: 0→1, y: 20→0`, `delay: index * 0.1s`. Lista-sor stagger-hez.

**`sectionStyle`** — CSS-in-JS megközelítés a kártyákon belüli lépcsőzetes szekció-animációkhoz.

### `src/components/ErrorBoundary.tsx`

Osztály-alapú React hibaboundary. Megkapja a gyermek render-hibákat és kecses tartalék nézetet mutat.

```tsx
// Manuális becsomagolás:
<ErrorBoundary fallback={<SajátTartalék />}>
  <ValamilyenKomponens />
</ErrorBoundary>

// Vagy a segédfüggvénnyel (main.tsx-ben minden lusta útvonalnál):
const BecsomagoltOldal = withBoundary(lazy(() => import("./pages/MyPage")));
```

---

## 16. Teljesítmény és build

### Bundle-stratégia

| Chunk            | Tartalom                              | Gzip          |
| ---------------- | ------------------------------------- | ------------- |
| `react-vendor`   | react, react-dom, react-router-dom    | ~33 KB        |
| `query-vendor`   | @tanstack/react-query, persist-client | ~12 KB        |
| `ui-vendor`      | framer-motion, motion, lucide-react   | ~45 KB        |
| Útvonal chunk-ok | Oldalanként lustán betöltve           | Igény szerint |

**Kezdeti bundle: ~94 KB gzip** (349 KB-ról csökkent az optimalizálás előtt).

### Fő optimalizációk

- Profilkép feltöltés: `setQueriesData` csak az `avatar_url` mezőt patcheli — nincs hálózati refetch
- `ProfileSelectorPage`: `React.memo` + `useCallback` az avataron és a kattintás-kezelőn
- Beállítások, Admin, Debug: az `animReady` prop eltávolítja a `backdrop-blur-*`-t a belépési spring alatt
- Animált hátterek: 1600ms késleltetett fade-in nehéz kártyás útvonalakon
- reCAPTCHA: token csak beküldéskor kerül lekérésre, nem pollingol
- Minden lusta útvonal útvonal-szintű `ErrorBoundary`-vel van becsomagolva — egy oldal összeomlása nem zárja le az egész alkalmazást

---

## 17. Ismert hibák

### ⚠️ Vásárlás → Tárgy nem kerül Megvásárolt állapotba (Aktív hiba)

**Gyökér ok:** A `GET /profiles/:id/purchases` backend végpont a `Purchases`-t preloadolja, de a `Purchases.Item`-et nem, így a `p.Item.Name` üres string-et ad vissza. Az `ownedNames.has(item.name)` soha nem egyezik — minden tárgy megvásároltként jelenik meg még vásárlás után sem.

**Backend javítás:** A `"Purchases.Item"` preload hozzáadása a `ReadPurchases`-hez a `player_profiles_controller.go`-ban:

```go
// Előtte
profile, err := pc.profilesRepo.ReadByID(ctx, id.(uint), "Purchases")
// Utána
profile, err := pc.profilesRepo.ReadByID(ctx, id.(uint), "Purchases", "Purchases.Item")
```

**Frontend javítás (backendtől független):** vásárlás sikeresége esetén optimistán meghívni a `setQueryData`-t az items cache-n, hogy `owned: true`-ra állítsa a tárgyat item ID alapján — nincs szükség névegyeztetésre. Fájl: `src/pages/webstore/useItems.ts`.

---

## 18. Backend-függőségek

### Már implementálva

- `POST /users/:id/ban` — body: `{ id, period }` (percek)
- `POST /users/:id/unban`
- `POST /users/:id/promote` — body: `{ id, target_role: "admin"|"support" }`
- `POST /users/:id/demote`
- `GET /users` Role preload-dal
- `GET /users/:id` Role preload-dal
- `GET /profiles/:id/purchases` (létezik, de hiányzik az `Item` preload — lásd §17)
- `PUT /profiles/:id` — az érme-szerkesztő ezt használja

### Még szükséges

| #   | Végpont                                                             | Hatás                                                      |
| --- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | `GET /profiles/:id/purchases` — `Purchases.Item` preload hozzáadása | **Kritikus** — tulajdonlás-követés meghibásodott           |
| 2   | `GET /api/profiles/:id/matches`                                     | Meccs-előzmények + győzelem/vereség statisztikák helyőrzők |
| 3   | `POST /api/auth/reset-password`                                     | Jelszó-visszaállítási űrlap nem csinál semmit              |
| 4   | `?search=` a `GET /api/users` végponton                             | Admin kliensoldali megkerülőt alkalmaz                     |
| 5   | `username` mező a `UserReadDTO`-ban                                 | `"—"` jelenik meg az admin panelben                        |

---

## Függelék: Új oldal hozzáadása

1. Hozd létre az `src/pages/MyPage.tsx` fájlt
2. Adj hozzá lusta importot az `src/main.tsx`-ben, csomagold be `withBoundary()`-vel
3. Add hozzá az útvonalat a `createBrowserRouter` konfigurációban
4. Adj hozzá navigációs elemet a `navItems.ts`-ben `labelKey` segítségével
5. Add hozzá a felirat fordítását az `src/locales/en/nav.json` és `src/locales/hu/nav.json` fájlokba
6. Használj `useSettings()` + téma segédeszközöket az összes stílushoz

```tsx
export function MyPage() {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const bgClass = getBackgroundClasses(useLiquidGlass, useDarkMode);

  return (
    <div className="p-4 min-h-screen w-full flex flex-col">
      <Navbar />
      <div className={`mt-20 ${bgClass} ${textColor} rounded-xl p-6`}>
        {/* tartalom */}
      </div>
    </div>
  );
}
```
