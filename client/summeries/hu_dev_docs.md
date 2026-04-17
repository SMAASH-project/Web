# SMAASH kliens — fejlesztői dokumentáció

> Ez az útmutató a SMAASH webes kliens architektúráját, konvencióit, algoritmusait és gyakorlati munkafolyamatait mutatja be. Nem csak azt magyarázza el, *mit* kell használni, hanem azt is, *miért* úgy működik, ahogy.

---

## Az egész rendszer dióhéjban

A kliens egy **React 19 + TypeScript** single-page application, amely hitelesített játékosoknak és adminoknak szól. Mobilra optimalizált kialakítással, erős vizuális igényességgel (egyedi animációs rendszer, adaptív témarendszer), valós idejű API állapotkezeléssel (React Query) és konzisztens fejlesztői élménnyel rendelkezik.

**Tech stack:**

| Réteg | Technológia |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Stílusozás | Tailwind CSS 4 + közös téma helperek |
| Animáció | `motion/react` (Framer Motion v11) |
| Adatfetching | React Query v5 + Axios |
| Internationalizáció | i18next (angol / magyar) |
| Ikonok | Lucide React |

**Fő belépési pontok:**

- `src/main.tsx` — routing, lazy loading, error boundary-k
- `src/RootLayout.tsx` — globális provider-ek, React Query beállítás, perzisztencia, globális debug effektusok
- `src/Wrapper.tsx` — téma gradiens generálás, CSS változó emittálás, animált háttér kiválasztása és layout keret
- `src/pages/*` — feature modulok (auth, játék, admin, debug stb.)
- `src/hooks/*` — adatfetching logika React Query hook-okon keresztül
- `src/lib/utils/*` — közös téma, szín, dátum és string helperek

---

## Hitelesítés és jogosultságkezelés

### Route struktúra

Három route nyilvános, session nélkül is elérhető:

- `/login` — bejelentkezési form, HTTP-only cookie alapú JWT capture
- `/signup` — fiók létrehozása
- `/reset-password` — jelszó-visszaállítás

Minden `/app/*` alatti route a `RequireAuth` wrapper komponensen fut keresztül, amely ellenőrzi az `AuthContext.isLoggedIn` értékét, és hiányzó session esetén `/app/login`-ra irányít.

### Szerepkör alapján korlátozott oldalak

| Route | Szükséges szerepkör |
|---|---|
| `/app/admin` | `admin` |
| `/app/debug` | `admin` |

A szerepkör ellenőrzés route szinten történik, és a komponens belépési pontján is megismétlődik védelmi célból. A jogosultságellenőrzést soha ne ágyazd be mélyen egymásba — tartsd az oldal határán, hogy ne lehessen véletlenül privilegizált UI-t renderelni.

### Auth folyamat

```
1. A felhasználó POST-ol a /auth/login végpontra
2. A szerver beállít egy HTTP-only session cookie-t
3. Az AuthProvider mountoláskor meghívja a GET /users/whoami végpontot
4. A válasz feltölti az AuthContext-et: { userId, isAdmin, isSupport, isLoggedIn }
5. Az apiClient bármely 401-es válaszára auto-redirect megy a /app/login-ra
```

Ez a kialakítás azt jelenti, hogy a kliens soha nem tárol tokent JS memóriában vagy localStorage-ban — a cookie láthatatlan a szkriptek számára, ami kiküszöböl egy egész XSS token-lopás kategóriát.

---

## Provider architektúra

A provider-ek az `RootLayout.tsx`-ben egy meghatározott sorrendben vannak egymásba ágyazva. Minden provider az felette lévőktől függ:

```
React Query (perzisztált cache)
  ↓
AuthProvider          ← identitást old fel; minden más ettől függ
  ↓
SettingsProvider      ← téma beállításokat tölt, mielőtt bármely vizuális komponens renderelne
  ↓
NavbarProvider        ← settingsre van szüksége a témabarát scroll viselkedéshez
  ↓
ColorProvider         ← CSS változókat emit-el a gradiens színekből; a festett UI előtt kell futnia
  ↓
ProfileProvider       ← auth-ra van szüksége (userId), hogy a helyes profilt töltse localStorage-ból
  ↓
App (route-ok, oldalak)
```

A sorrend megváltoztatása csendben elront dolgokat. Például ha a `ColorProvider` a `SettingsProvider` fölé kerülne, CSS változókat bocsátana ki, mielőtt az `useLiquidGlass` / `useDarkMode` ismert lenne, ami látható szín-villanást okozna az első rendereléskor.

### Perzisztált állapotok

Ezek az értékek kemény frissítés után is megmaradnak localStorage-on keresztül:

| Kulcs | Provider | Mit tárol |
|---|---|---|
| `settings` | SettingsProvider | Téma kapcsolók, animációs beállítások, nyelv |
| `color-settings` | ColorProvider | Gradiens színek + animáció override |
| `selected_profile_<userId>` | ProfileProvider | Melyik karakter aktív éppen |

---

## Téma és vizuális rendszer

### Az arany szabály

Minden téma-érintett UI-t renderelő komponensnek a `src/lib/utils/themeClasses.ts` közös helpereit kell használnia. Soha ne írj inline ternary témaláncolatokat:

```typescript
// ✅ Ezt tedd — centralizált, egy helyen kell változtatni
const bg = getBackgroundClasses(useLiquidGlass, useDarkMode);
const text = getTextColor(useLiquidGlass, useDarkMode);
const input = getInputClasses(useLiquidGlass, useDarkMode);

// ❌ Soha ne ezt — törékeny, mindenhol duplikált
const bg = useDarkMode
  ? useLiquidGlass ? "bg-white/10 backdrop-blur-md" : "bg-gray-900"
  : "bg-white";
```

Ha egy kártya sötét-módos színét módosítani kell, egyetlen függvényt frissítesz, és az alkalmazás minden kártyája automatikusan frissül.

### Fő téma kapcsolók

| Beállítás | Hatás |
|---|---|
| `useLiquidGlass` | Glassmorphism: `backdrop-blur` + félig átlátszó háttér |
| `useDarkMode` | Sötét vs. világos színséma |
| `useAnimations` | Minden mozgást engedélyez / letilt |
| `animationOverride` | Egy adott háttér effektet kényszerít (lásd lentebb) |

### CSS változó generálási algoritmus

A `ColorProvider` a felhasználó 3 pontos gradiens kiválasztásából egy teljes CSS egyéni tulajdonság készletet vezet le. Az algoritmus:

```typescript
// Adott: accent = "#fff700" (felhasználó által kiválasztott elsődleges szín)

// 1. Az accent kis mértékű világosítása a hover állapothoz
const accentHover = lightenHex(accent, 0.15); // → "#ffed4e"

// 2. Átlátszó, puha verzió háttérhez/chip-ekhez
const accentSoft = hexToRgba(accent, 0.15); // → "rgba(255, 247, 0, 0.15)"

// 3. Nagyon alacsony opacity verziók navbar kerethez és árnyékhoz
const navBorder = hexToRgba(accent, 0.2);
const navShadow = hexToRgba(accent, 0.1);

// 4. Mindet injektálás a :root-ba
document.documentElement.style.setProperty("--theme-accent", accent);
document.documentElement.style.setProperty("--theme-accent-hover", accentHover);
document.documentElement.style.setProperty("--theme-accent-soft", accentSoft);
document.documentElement.style.setProperty("--theme-nav-border", navBorder);
document.documentElement.style.setProperty("--theme-nav-shadow", navShadow);
```

Az eredmény: minden komponens, amely `var(--theme-accent)`-et használ CSS-ben, automatikusan tükrözi a felhasználó szín-választását — beleértve a Navbar kereteket, gomb ragyogásokat és jelvény háttereket — anélkül, hogy ezen komponensek React újrarenderelődnének.

---

## Animáció és háttérrendszer

### Háttér kiválasztási algoritmus

Az animált háttérrendszer négy módot támogat, az `animationOverride` beállítás vezérli:

```
animationOverride === null       → a téma alapértelmezett animációs kulcsát használja
animationOverride === "none"     → semmit sem renderel (statikus oldal)
animationOverride === "aurora"   → egy nevesített effektet kényszerít, a témát figyelmen kívül hagyja
animationOverride === "custom"   → CompositeBackground renderelése (rétegzett effektek)
```

A `Wrapper.tsx`-ben lévő kiválasztási logika renderelés előtt oldja fel a helyes háttér komponenst:

```typescript
function resolveBackground(override: string | null, themeDefault: AnimationKey) {
  if (override === null) return themeDefault;
  if (override === "none") return null;
  if (override === "custom") return "composite";
  return override as AnimationKey; // validált kulcs
}
```

### Crossfade váltáskor

Amikor az animáció megváltozik, az új háttér bele-fade-el, miközben a régi ki-fade-el. Ez elkerüli a durva vágást. A crossfade `AnimatePresence`-szel van meghajtva `mode="wait"` módban, a háttér komponens köré csomagolva, a feloldott animáció neve alapján kulccolva:

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={resolvedAnimation}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
  >
    <BackgroundComponent />
  </motion.div>
</AnimatePresence>
```

### Teljesítmény megjegyzések

- A háttérképek **halasztottak** a nehéz kártyás oldalakon: ~500ms után fade-elnek be, hogy az oldal elsődleges tartalma először renderelődjön és festődjön, elkerülve a jank-ot
- Amikor `useAnimations` false, a mozgás az utolsó renderelt frame-en marad — nincs villogás vagy újraelrendezés, egyszerűen megáll
- A `CompositeBackground` lustán csatolja az egyes al-effekt canvas rétegeket; a kikapcsolt rétegek tisztán lecsatolódnak

---

## API és adatfetching

### Az API kliens

A `src/lib/apiClient.ts` egy előre konfigurált Axios instance:

```typescript
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // elküldi a HTTP-only session cookie-t
});

// Globális 401 interceptor — bármely nem jogosult válasz login-ra irányít
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/app/login";
    }
    return Promise.reject(err);
  }
);
```

### React Query hook minta

Minden adatfetching a `src/hooks/` alatti hook-okban él. A szabványos minta:

```typescript
// src/hooks/useGetStats.ts
export function useGetStats(userId: string) {
  return useQuery({
    queryKey: queryKeys.stats(userId),
    queryFn: () => apiClient.get<StatsResponse>(`/stats/${userId}`).then(r => r.data),
    staleTime: 1000 * 60 * 5, // 5 perc, mielőtt háttérbeli újrafetching
    enabled: !!userId,         // ne tüzeljen, ha userId üres
  });
}
```

Előnyök a nyers `useEffect` + `useState`-hez képest:
- Automatikus deduplikáció: több, azonos query-t használó komponens egyetlen kérést oszt meg
- Háttérbeli újrafetching window fókuszáláskor
- Beépített loading / error állapot
- Mutációk utáni cache invalidáció konzisztens UI-t tart fenn

### Query key factory

A query kulcs tömbök mindenhol hardkódolása karbantartási rémálommá teszi a cache invalidációt. Használd a factoryt a `src/lib/queryKeys.ts`-ben:

```typescript
// Egyszer definiálva, centrálisan
export const queryKeys = {
  stats: (userId: string) => ["stats", userId] as const,
  leaderboard: () => ["leaderboard"] as const,
  user: (id: number) => ["user", id] as const,
};

// Mutáció után precíz invalidáció
queryClient.invalidateQueries({ queryKey: queryKeys.stats(userId) });
```

Ez azt jelenti, hogy egy cache kulcs átnevezése csak egy sor megváltoztatását igényli.

---

## Oldal layout szerződés

### Fix Navbar feletti clearance

A Navbar `position: fixed`, vagyis **nincs a dokumentum folyamban**. A `y=0`-nál kezdődő tartalom a navbar mögé kerül. A helyes mintát az `AdminPage` használja, és minden teljes oldalas layoutnál követni kell:

```tsx
<div className="flex h-dvh w-full flex-col">

  {/* Fix navbar — mindent takar, nem folyamban van */}
  <Navbar />

  {/* Fizikai spacer a navbar magasságának megfelelő méretben. Ez tolja a
      scroll container-t a navbar alá a layout folyamban. */}
  <div className="h-24 shrink-0" aria-hidden="true" />

  {/* Scroll container: a maradék viewport magasságot tölti ki.
      overflow-y-auto azt jelenti, hogy az oldal itt scrolloz, nem a <body>-n. */}
  <div className="flex flex-1 overflow-y-auto">

    {/* Tartalom wrapper: min-h-full + flex-1 biztosítja, hogy kitöltse a
        scroll container-t, így a py-4/py-5 egyenlő felső és alsó
        lélegzési teret teremt, még akkor is, ha a kártya tartalma rövid. */}
    <div className="flex min-h-full w-full flex-1 flex-col items-center px-3 py-4 sm:px-6 sm:py-5 lg:px-10">
      <PageContent />
    </div>

  </div>
</div>
```

A kulcs felismerés: a tartalom wrapperén lévő `min-h-full flex-1` azt biztosítja, hogy mindig kitöltse a scroll container-t, ami azt jelenti, hogy a `py-4/py-5` padding mindig az egyetlen tér a viewport széle és a kártya között — tökéletesen egyenlő felső és alsó margókat adva, függetlenül attól, mennyi tartalom van az oldalon.

**Ellenőrzött oldalak:** Gallery, Leaderboard, Webstore, News, Releases, Admin, Debug, Settings, Profile.

---

## A pill-container tab választó

Ez a szabványos tab szelektor, amelyet a Gallery, Leaderboard, Webstore (ItemFilters) és Releases (SelectOs) használ. Liquid Glass módban csúszó kiemelés követi az egeret.

### Algoritmus

```tsx
// 1. Állapot a container szinten
const containerRef = useRef<HTMLDivElement>(null);
const [highlightPos, setHighlightPos] = useState({ left: 0, width: 0 });
const [isHovering, setIsHovering] = useState(false);

// 2. Bármely tab gomb mouse-enter eseményén:
function handleTabMouseEnter(tabId: string) {
  const container = containerRef.current;
  const btn = container?.querySelector(`[data-tab="${tabId}"]`);
  if (!container || !btn) return;

  const cRect = container.getBoundingClientRect();
  const bRect = btn.getBoundingClientRect();

  setHighlightPos({
    left: bRect.left - cRect.left,
    width: bRect.width,
  });
  setIsHovering(true);
}

// 3. A container mouse-leave eseményén:
function handleContainerMouseLeave() {
  setIsHovering(false);
  // Kiemelés visszacsúszik a jelenleg kiválasztott tabhoz
  const btn = containerRef.current?.querySelector(`[data-tab="${activeTab}"]`);
  if (btn && containerRef.current) {
    const cRect = containerRef.current.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setHighlightPos({ left: bRect.left - cRect.left, width: bRect.width });
  }
}

// 4. Renderelés
<div
  ref={containerRef}
  className={`relative flex gap-1 rounded-lg p-1 ${panelBg}`}
  onMouseLeave={handleContainerMouseLeave}
>
  {/* Csúszó kiemelés — csak LG (Liquid Glass) módban */}
  {useLiquidGlass && (
    <motion.div
      className="absolute top-1 bottom-1 rounded-md bg-white/15"
      animate={{ left: highlightPos.left, width: highlightPos.width }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
    />
  )}

  {tabs.map((tab) => (
    <button
      key={tab.id}
      data-tab={tab.id}
      onMouseEnter={() => handleTabMouseEnter(tab.id)}
      onClick={() => setActiveTab(tab.id)}
      className={activeTab === tab.id
        ? "bg-gray-700 shadow-md"   // nem-LG aktív
        : "hover:bg-gray-700"       // nem-LG inaktív hover
      }
    >
      {tab.label}
    </button>
  ))}
</div>
```

A `data-tab` attribútum köti a gomb DOM elemet a kiemelés pozíció számításhoz — elkerüli az index-alapú keresést, és rugalmas feltételes tab renderelés esetén.

**Az aktív állapot osztályoknak kezelniük kell az LG és a nem-LG módot egyaránt.** LG módban a gombok átlátszók (`bg-transparent`), és a csúszó kiemelés biztosítja az aktív vizuált. Nem-LG módban az aktív gomb `bg-gray-700 shadow-md` (sötét) / `bg-gray-200 shadow-md` (világos) osztályokat kap. Soha ne használj `bg-white/15` vagy hardkódolt `bg-white` értéket aktív állapothoz — ezek nem kezelik megfelelően az LG módot.

---

## A viewport override (debug emuláció)

A debug emuláció tab kényszerítheti a böngészőt, hogy úgy viselkedjen, mintha adott méretekkel rendelkezne, lehetővé téve a JS-alapú reszponzív logika tesztelését anélkül, hogy a fizikai ablakot átméreteznénk.

### Hogyan működik

A standard `window.innerWidth` csak olvasható tulajdonság, tehát nem lehet egyszerűen hozzárendelni. Az override `Object.defineProperty`-t használ a getter lecseréléséhez:

```typescript
// Eredeti értékek tárolása a cleanup-hoz
const origDescriptors = {
  innerWidth: Object.getOwnPropertyDescriptor(window, "innerWidth"),
  innerHeight: Object.getOwnPropertyDescriptor(window, "innerHeight"),
  // ... outerWidth, outerHeight
};

const origMatchMedia = window.matchMedia.bind(window);

// Méretek patch-elése
Object.defineProperty(window, "innerWidth",  { get: () => forcedWidth,  configurable: true });
Object.defineProperty(window, "innerHeight", { get: () => forcedHeight, configurable: true });

// matchMedia patch-elése — CSS query-k kiértékelése a kényszerített méretekhez
window.matchMedia = (query: string): MediaQueryList => {
  const match = evaluateCSSMediaQuery(query, forcedWidth, forcedHeight);
  return {
    matches: match,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  };
};

// Hook-ok és komponensek jelzése az újraértékeléshez
window.dispatchEvent(new CustomEvent("viewport-override", {
  detail: { width: forcedWidth, height: forcedHeight }
}));
```

A `src/components/nav/navLogic/useMediaQuery.ts`-ben lévő `useMediaQuery` hook figyeli a `"viewport-override"` egyéni eseményt, és kényszerít újrarenderelést, amint az elsül, így a reszponzív layout változások azonnal érvénybe lépnek a JS-vezérelt kódban.

### Fontos korlát

A Tailwind CSS breakpointok (`sm:`, `md:`, `lg:`, `xl:`) build időben CSS `@media` query-kre fordítódnak. A patch-elt `window.matchMedia` csak a JavaScript hívókat érinti — a Tailwind CSS szabályait a böngésző saját CSS engine-je értékeli ki az aktuális fizikai viewport ellen, amely nem érintett. Az override hasznos `useMediaQuery` hook-ok, navbar breakpointok és JS-vezérelt layout logika teszteléséhez.

---

## Leaderboard adatnormalizáció

Mind a négy leaderboard dataset (győzelmek, aktív játékosok, top pályák, top tárgyak) eltérő alakú a backend-en. Mielőtt a `PodiumSlot` vagy a `CategoryView` megkapná őket, normalizálódnak egy egységes `RankedEntry` típusra:

```typescript
interface RankedEntry {
  id: number;
  name: string;
  stat: number;
  statLabel: string; // pl. "Győzelmek", "Lejátszott meccsek"
  sub?: string;      // opcionális alcím (pl. játékos neve egy pálya bejegyzésnél)
}

// Példa: a győzelmek dataset normalizálása
const winsEntries: RankedEntry[] = leaderboardData.map((entry) => ({
  id: entry.player_id,
  name: entry.username,
  stat: entry.count_of_wins,
  statLabel: t("tabs.wins"),
}));
```

Ez a minta a `PodiumSlot`-ot és a `CategoryView`-t teljesen generikussá teszi — soha nem importálnak backend response típusokat. Új leaderboard kategória hozzáadása csak a következőket igényli:
1. Egy új query hook
2. Egy normalizáló leképezés `RankedEntry[]`-ra
3. Egy új `TabId` bejegyzés

A `CategoryView`-ban lévő keresési szűrő a normalizált adaton fut, és az eredeti rangszámokat megőrzi a szűrésen keresztül azáltal, hogy a rangot az index mellett külön mezőként követi.

---

## Oldalak részletesen

### Admin panel (`/app/admin`)

Az admin panel `xl` breakpointnál három oszlopra bontódik (`xl:flex-row`), mindegyiket saját komponens kezeli:

- `UserList` — kereshető felhasználólista kliens-oldali szűréssel; a backend paginálás jövőbeli fejlesztés
- `UserDetail` — kiválasztott felhasználó teljes profilja, akcióbillentyűk (tiltás/feloldás, előléptetés/lefokozás)
- `ProfilesPanel` — a kiválasztott felhasználó játékprofiljai és statisztikái
- `BanDialog` — időtartam-választó dialógus a tiltások alkalmazásához (preset chipek + egyéni tartomány + szabad szöveges ok)

A kiválasztott felhasználó az `useAdminPageLogic`-on keresztül áramlik, egy egyetlen hook, amely az összes állapotot és mutációt kezeli a panelhez. A komponensek csak a `logic` objektumot kapják — soha nem rendelkeznek saját mutáció állapottal.

### Debug panel (`/app/debug`)

Csak adminoknak elérhető diagnosztikai és műveleti dashboard. Nyolc tab:

| Tab | Cél |
|---|---|
| System | Runtime diagnosztika és rendszerszintű állapot |
| Endpoints | Kézi HTTP request tesztelő |
| Cache | React Query cache vizsgálat és invalidáció |
| Game Data | CRUD munkafolyamatok karakterekhez, pályákhoz, tárgyakhoz és felhasználókezeléshez |
| Visual | UI hibakeresési eszközök (lásd lentebb) |
| Emulation | Reszponzív tesztelés és hálózat szimuláció |
| Diagnostics | A11y, render számok, z-index, kattintási célok |
| Database | Általános REST-alapú adatböngésző minden erőforráshoz |

**Visual tab képességek:**
- Animáció sebesség szorzó
- Navbar override (kényszer megjelenítés / kényszer elrejtés — hasznos a scroll-hidden navbar viselkedés teszteléséhez)
- Backdrop blur kapcsoló
- Layout keret kiemelések (minden DOM elemet kontúroz térköz hibakereséshez)
- Elem inspector (DOM csomópontok fölé vive mutatja a kiszámított box model-t)
- Overlay vezérlők: FPS számláló, scroll pozíció jelző, Tailwind breakpoint badge
- Toast teszt gomb
- CSS változó felfedező élő szín swatches-szel

**Emulation tab képességek:**
- Csökkentett mozgás kapcsoló
- Kompakt sűrűség mód (tömörebb betűméret és térköz)
- Safe-area körvonalak bevágásos/szigetes eszköz teszteléséhez
- JS Viewport kényszerítés (lásd a Viewport Override részt fentebb)
  - Presetek: Desktop 1920, Desktop 1280, Tablet 768, Mobile 390, Mobile 360
  - Egyéni szél + magasság bevitel
- Hálózati késleltetés szimuláció (mesterséges latencia + jitter milliszekundumban)

**Database tab:**
- Erőforrások: Users, Profiles, Items, Characters, Levels, Categories, Rarities, Purchases, Roles, Posts, Stats
- Sor-szintű CRUD létrehozás/szerkesztés dialógusokkal és törlési megerősítéssel (ahol backend endpoint létezik)
- Hardkódolt séma/reference nézet Go/GORM modellekből levezetve — inline dokumentációként funkcionál
- Inline felhasználó moderáció: Tiltás (időtartam-választóval), Feloldás, Előléptetés, Lefokozás
- Session-only akciónapló (memóriában lévő ring buffer, max 20 bejegyzéssel)
- Danger Zone szekció kaszkád figyelmeztetésekkel a Users és Profiles destruktív műveleteihez
- Ismert hiányok: nincs seed/reset endpoint bekötve, post törlés nem elérhető, képfeltöltés kizárva a CRUD dialógusokból

### Gallery (`/app/gallery`)

Két tapos oldal: Karakterek rács és OST zenelejátszó.

- **Karakterek tab:** `useDebugCharactersQuery`-n keresztül tölt (admin szerepkör szükséges — lásd `docs/problems.md` a `GET /characters` auth réshez). Minden karaktert `CharacterCard` jelenít meg, amely `GET /api/characters/:id/img`-et tölt, és hibánál `Swords` placeholder-re esik vissza. `LoadPost`-tal animálva, ha `useAnimations` engedélyezett.

- **OST tab:** Statikus `OstTrack[]` tömb a fájl tetején definiálva. Trackek hozzáadása az `OST_TRACKS` szerkesztésével. Teljes audiojátszó seekbar-ral, hangerő vezérlővel és track lista panellel.

### Leaderboard (`/app/leaderboard`)

Tab-alapú ranglista. Tabok: `all`, `wins`, `active`, `levels`, `items`.

- **All tab:** Stat sáv (négy chip, kategóriánként az #1-et mutatva) + 2×2-es rács top-5 panelekkel. Minden panel saját skeletonnel tölt.
- **Kategória tabok:** `PodiumSlot` komponensek az 1–3. helyeknek fizikai dobogó sorrendben `[2. | 1. | 3.]`, lépcsőzött `motion.div` animációval (0 / 0,15 / 0,30s késleltetések). Runners-up (4–5. hely) alattuk. Teljes görgethető rangsor kereséssel.
- Mind a négy query párhuzamosan indul. Tab váltás `AnimatePresence mode="wait"`-tel, 0,18s opacity/y fade-del. A `CategoryView` wrapperén lévő `key={activeTab}` minden tab váltáskor visszaállítja a keresési állapotot.

### Webstore (`/app/webstore`)

1. Minden tárgy lekérése a backend-ről
2. Felhasználó vásárlási előzményeinek lekérése
3. A "tulajdonolt" állapot kiszámítása tárgy ID-k és vásárlási rekordok metszésével
4. Vásárlás gomb csak nem-tulajdonolt tárgyaknál jelenik meg
5. Vásárlásnál: coin levonása az aktív profil kontextusából, hozzáadás a vásárlási listához, releváns query-k invalidálása

Az egyenleg az aktív profil kontextusából jön, nem egy globális pénztárcából. Profil váltás megváltoztatja az elérhető egyenleget.

### Profile (`/app/profile`)

Jelenleg implementált: megjelenési név szerkesztés, email szerkesztés. Még nem bekötve: jelszócsere (backend endpoint hiányzik), teljes meccs-előzmény / részletes statisztikák.

---

## Mobil reszponzivitás

### Elvek

- **Mobile-first:** az alapértelmezett stílusok kis képernyőket céloznak; a breakpointok (`sm:`, `md:`, `lg:`) fokozatosan bővítik
- **Nem fix szélességek:** `max-w-*` használata `w-full`-lal és `mx-auto`-val
- **Reszponzív vízszintes padding:** `px-3 sm:px-6 lg:px-10`
- **Másodlagos tartalom rejtése mobilon:** `hidden sm:block` oldalsávokhoz stb.

### Debug panel mobilon

A debug panel oldalsávja `md` breakpoint alatt összecsukódik:

- **Mobil:** hamburger ikon → sheet drawer tab pill-ekkel; a drawer automatikusan bezáródik tab kiválasztás után, így a tartalom terület teljes széles
- **Desktop:** fix bal oldalsáv, mindig látható

### Dialógusok mobilon

Minden dialógusnak a következőket kell használnia:

```tsx
<DialogContent className="max-h-[90svh] overflow-y-auto max-w-[calc(100%-2rem)] sm:max-w-lg">
```

- `max-h-[90svh]` + `overflow-y-auto`: a dialógus belülről scrollozható, soha nem nyírja ki a viewportot
- `max-w-[calc(100%-2rem)]`: 1rem oldalsó margót tart mobilon
- **Soha ne** használj `max-w-full`-t mobilon — teljesen eltávolítja a margót
- **Soha ne** adj `overflow-visible`-t a `DialogContent`-hez — felülírja az `overflow-y-auto`-t és tartalom kilógást okoz a dialógus keretéből a görgethetőség helyett

A News dialógusok (Hozzáadás és Szerkesztés) mobilon függőlegesen egymás alá rendezik a képbeállítások szekciót `flex flex-col gap-4 sm:flex-row sm:items-start`-tal.

---

## Közös UI komponensek

### StyledSelect

Natív `<select>` helyett használandó minden olyan legördülő menühöz, amelynek illeszkednie kell a design rendszerhez:

```tsx
import { StyledSelect } from "@/components/ui/styled-select";

<StyledSelect
  value={selectedValue}
  onChange={setSelectedValue}
  options={[
    { value: "en", label: "English" },
    { value: "hu", label: "Hungarian" },
  ]}
  inputClass={inputClass}
  textColor={textColor}
  bgClass={bgClass}
/>
```

Használja: HTTP metódus szelektor (Endpoints tab), viewport preset választó (Emulation tab), tárgy ritkaság/típus szűrők (Webstore).

### Skeleton

Pulzáló betöltési placeholder. Mindig részesítsd előnyben a skeleton-t a spinner-rel szemben tartalom területeknél:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// A valódi tartalom alakját utánozd
<div className="flex flex-col gap-3">
  <Skeleton className="h-10 w-full rounded-lg" />
  <Skeleton className="h-10 w-3/4 rounded-lg" />
  <Skeleton className="h-10 w-1/2 rounded-lg" />
</div>
```

### AnimatePresence / LoadPost

Lépcsőzött lista belépési animációkhoz használd a `LoadPost`-ot:

```tsx
{items.map((item, i) => (
  <LoadPost key={item.id} index={i}>
    <ItemCard item={item} />
  </LoadPost>
))}
```

A `LoadPost` lépcsőzött `opacity` + `y` belépést alkalmaz, `index` alapján skálázva. Az animációt csak akkor rendereli, ha `useAnimations` engedélyezett.

---

## i18n konvenciók

A locale fájlok helye:
- `src/locales/en/` — angol szövegek
- `src/locales/hu/` — magyar szövegek

A névterek megegyeznek az oldalakkal vagy feature-ökkel (pl. `admin`, `nav`, `leaderboard`). Mindig add hozzá a kulcsokat **mindkét** locale fájlhoz egyszerre. Ha egy kulcs hiányzik az egyik nyelvből, az i18next maga a kulcsnevet adja vissza — ez a produkción töröttnek néz ki.

Használd az `useTranslation("névtér")` hook-ot a komponensekben:

```tsx
const { t } = useTranslation("admin");
return <p>{t("detail.bannedPermanent")}</p>;
```

---

## Konvenciók

### Igen

- **Téma helpereket használj.** `getBackgroundClasses()`, `getTextColor()`, `getInputClasses()` — ezek a szerződés. Az inline ternary-k töredezik a témarendszert.
- **`StyledSelect` használata** minden legördülőhöz. A natív `<select>` nem stílusozható konzisztensen.
- **Típusozd a React Query válaszokat.** Biztosítsd, hogy a `queryFn` visszatérési típusa és a response interfész egyezzen.
- **Szerepkör ellenőrzéseket az oldal határán tartsd.** Soha ne ásd el a jogosultság logikát mélyen egymásba ágyazott komponensben.
- **Minden felhasználónak szóló szöveget fordítsd le.** Egyszerre add hozzá mindkét `en` és `hu` locale fájlhoz.
- **Mobilon is tesztelj.** Használd a debug panel Force Viewport-ját vagy a böngésző DevTools eszköz módját.
- **Kövesd a pill-container tab választó mintát** minden új tab szelektor esetén. Referencia implementáció: Gallery és Leaderboard.

### Nem

- Inline ternary témaláncolatok, mint `useDarkMode ? useLiquidGlass ? "..." : "..." : "..."`
- Natív `<select>` elemek
- Hardkódolt hex színek vagy Tailwind szín osztályok, amelyek megkerülik a téma helpereket
- Navbar clearance kihagyása új teljes oldalas layoutokon
- `camelCase` és `snake_case` keverése localStorage kulcsokban
- `overflow-visible` a `DialogContent`-en
- Tab aktív állapotok, amelyek csak az LG / nem-LG mód egyikét kezelik

---

## Ismert backend függőségek

| Feature | Állapot |
|---|---|
| Profil meccs-előzmény endpoint | Hiányzik — statisztikák/meccs rekordok nem elérhetők |
| Jelszócsere endpoint | Hiányzik — profil oldal csere form nincs bekötve |
| Admin felhasználó keresés / paginálás | Jelenleg csak kliens-oldali |
| `GET /characters` admin nélkül | Auth rés — gallery karakterek admin szerepkört igényelnek |

---

## Optimalizálás állapota

### Már megvan

- Route-szintű lazy loading `React.lazy` + `Suspense` fallback-kel
- Kézi vendor chunk felosztás (Vite konfig)
- Leaderboard skeleton betöltés (spinner helyett, tartalom alakot mutat)
- Lépcsőzött panel belépési animáció az olvasható betöltésért
- Build bundle vizualizáció támogatás

### Érdemes megfontolni

- WebP/AVIF képformátum adoptálás `<picture>` fallback-kel
- Virtuális lista renderelés nagy adattáblákhoz (react-window)
- Route-hover prefetching leaderboard query-khez
- Opcionális PWA / offline réteg, ha a kapcsolat nélküli hozzáférés követelmény lesz

---

## Segítség kérése

1. **Ellenőrizd a debug panelt** (`/app/debug`) rendszerállapotért, cache vizsgálatért és renderelt query számokért
2. **Nézz meg egy hasonló meglévő oldalt** — szinte mindig van már kialakult minta
3. **Frissítsd ezt a dokumentumot**, ha valami nem nyilvánvalót tanulsz
