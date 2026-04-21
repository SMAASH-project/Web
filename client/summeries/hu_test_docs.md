# SMAASH Web Kliens — Tesztdokumentáció

## A tesztek futtatása

```bash
cd client
npm run test        # az összes teszt egyszeri futtatása és kilépés
npm run test:run    # ugyanaz, alias
```

A test runner a Vitest, a `vite.config.ts` `test` kulcsa alatt konfigurálva:

```typescript
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test-setup.ts"],
}
```

A `globals: true` elérhetővé teszi a `describe`, `it`, `expect` és `vi` segédprogramokat minden tesztfájlban importok nélkül. A `jsdom` környezet teljes DOM implementációt biztosít, így React komponensek renderelhetők és lekérdezhetők a test runnerben.

A tesztfájlok a tesztelt kód mellé vannak elhelyezve. Bármely `.test.tsx` vagy `.test.ts` végű fájl az `src/` bármely pontján automatikusan felismeri a Vitest.

---

## Meglévő automatizált tesztek

### `src/components/ErrorBoundary.test.tsx`

Az `ErrorBoundary`-t teszteli, a `src/components/ErrorBoundary.tsx` osztályalapú React error boundary-t.

A tesztfájl definiál egy `Crash` komponenst, amely feltétel nélkül dob egy `Error("Boom")` kivételt renderelés közben. Ez kerül felhasználásra hibázó gyerekként.

#### Teszt: fallback UI renderelése, ha a gyerek dob

```typescript
render(
  <ErrorBoundary>
    <Crash />
  </ErrorBoundary>
);

expect(screen.getByText("Something went wrong on this page.")).toBeInTheDocument();
expect(screen.getByText("Boom")).toBeInTheDocument();
```

Amikor egy gyerek dob, a `getDerivedStateFromError` `true`-ra állítja a `hasError`-t és eltárolja az `Error` objektumot. A boundary rendereli az alapértelmezett fallback-et: egy közép-igazított kártyát a statikus "Something went wrong on this page." üzenettel és az `error.message` értékével ("Boom") alatta. Mindkettőnek a dokumentumban kell lennie.

A `console.error`-ra kémlelik ki a `vi.spyOn(console, "error").mockImplementation(() => {})` segítségével, hogy elnyomják a React belső hibanaplózását, amely a caught boundary renderelések során történik. A kém `mockRestore()`-ral kerül visszaállításra az assertion után, hogy ne szivárogjon át más tesztekbe.

#### Teszt: egyéni fallback renderelése, ha meg van adva

```typescript
render(
  <ErrorBoundary fallback={<div>Custom Error</div>}>
    <Crash />
  </ErrorBoundary>
);

expect(screen.getByText("Custom Error")).toBeInTheDocument();
```

Ha a `fallback` prop meg van adva, a boundary azt az elemet rendereli az alapértelmezett üzenet helyett. A teszt ellenőrzi, hogy a "Custom Error" megjelenik és az alapértelmezett szöveg nem.

Ugyanaz a `console.error` mock minta kerül alkalmazásra.

---

### `src/components/RequireAuth.test.tsx`

A `RequireAuth`-t teszteli, a `src/components/RequireAuth.tsx` route guard komponenst, amely az összes `/app/*` route-ot védi.

A teszt egy `renderProtectedRoute(isLoggedIn, isInitializing?)` helper-t használ, amely a `RequireAuth`-t egy teljes routing context-be csomagolja `MemoryRouter` segítségével. Két route van beállítva: egy nyilvános bejelentkezési oldal és a védett releases oldal. Az `AuthContext.Provider` közvetlenül kerül felhasználásra kontrollált autentikációs állapot injektálásához egy valódi `AuthProvider` nélkül:

```typescript
function renderProtectedRoute(isLoggedIn: boolean, isInitializing = false) {
  return render(
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isInitializing,
        userId: null,
        setUserId: () => {},
        setIsLoggedIn: () => {},
        isAdmin: false,
        setIsAdmin: () => {},
        isSupport: false,
        setIsSupport: () => {},
      }}
    >
      <MemoryRouter initialEntries={["/app/releases"]}>
        <Routes>
          <Route path="/app/login" element={<div>Login Page</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/app/releases" element={<div>Releases Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}
```

#### Teszt: védett route renderelése hitelesítéskor

```typescript
renderProtectedRoute(true);
expect(screen.getByText("Releases Page")).toBeInTheDocument();
```

Amikor az `isLoggedIn` értéke `true`, a `RequireAuth` rendereli az `<Outlet />`-ot és a releases oldal tartalma láthatóvá válik.

#### Teszt: átirányítás loginra hitelesítés nélkül

```typescript
renderProtectedRoute(false);
expect(screen.getByText("Login Page")).toBeInTheDocument();
```

Amikor az `isLoggedIn` értéke `false` és az `isInitializing` értéke `false`, a `RequireAuth` renderel egy `<Navigate to="/app/login">` elemet. A router követi az átirányítást és a bejelentkezési oldal renderelődik.

#### Teszt: betöltési állapot megjelenítése az autentikáció inicializálásakor

```typescript
renderProtectedRoute(false, true);
expect(document.querySelector(".animate-spin")).toBeInTheDocument();
```

Amikor az `isInitializing` értéke `true`, a `RequireAuth` egy `animate-spin` CSS osztályú spinner div-et renderel az oldalon lévő tartalom vagy az átirányítás helyett. A teszt közvetlenül ellenőrzi ezt az elemet a dokumentumban. Ez az eset a kezdeti render és a `useWhoAmIQuery` feloldódásának pillanata között az ablakot reprezentálja — e nélkül a guard nélkül a router minden oldalfrissítésnél a loginra irányítana át, még a session ellenőrzés befejezése előtt.

---

### `src/pages/webstore/components/ItemFilters.test.tsx`

Az `ItemFilters`-t teszteli, a webáruházban használt szűrőchip sor komponenst.

A `useSettings` context a fájl tetején van mockolva, mert az `ItemFilters` belülről olvas belőle témazáshoz. A mock egy rögzített beállítás objektumot ad vissza `useAnimations: true`, `useLiquidGlass: false`, `useDarkMode: false`, `language: "en"` és `animationOverride: null` értékekkel:

```typescript
vi.mock("@/pages/settings/SettingsContext", () => ({
  useSettings: () => ({
    settings: {
      useAnimations: true,
      useLiquidGlass: false,
      useDarkMode: false,
      language: "en",
      animationOverride: null,
    },
    updateSetting: vi.fn(),
  }),
}));
```

#### Teszt: onSelect meghívása a kattintott opcióval

```typescript
const onSelect = vi.fn();

render(
  <ItemFilters
    label="Rarity"
    options={["All", "Rare", "Epic"]}
    selected="All"
    onSelect={onSelect}
  />
);

fireEvent.click(screen.getByText("Rare"));
expect(onSelect).toHaveBeenCalledWith("Rare");
```

A "Rare" chipre kattintva az `onSelect` callback meghívódik a `"Rare"` string argumentummal. A teszt ellenőrzi, hogy a callback a helyes argumentumot kapja. A teszt nem törődik a vizuális állapottal — csak a callback szerződést ellenőrzi.

---

## Tesztelési minták ebben a kódbázisban

### Context injektálása valódi provider nélkül

Amikor egy komponens React context-től függ, injektáld a context értékét közvetlenül a `<ContextName.Provider value={...}>` segítségével a teszt fában. Ez elkerüli a valódi provider szükségességét, amely hálózati kéréseket küldhet vagy tárolóból tölthet be.

Alkalmazott minta: `RequireAuth.test.tsx` (az `AuthContext` injektálása).

### Modul szintű függőségek mockolása

Amikor egy komponens olyan egyéni hook-ot hív, amely tárolóval vagy más állapottal dolgozik, mockold az egész modult a `vi.mock("elérési_út", factory)` segítségével. A factory szinkron módon fut és az összes exportot vissza kell adnia, amelyet a komponens használ.

Alkalmazott minta: `ItemFilters.test.tsx` (a `useSettings` mockolása).

### Várt konzolkimenet elnyomása

A React a console-ra naplózza az error boundary-k által elkapott hibákat. Ez szennyezi a teszt kimenetet. Kémlelj rá a `console.error`-ra a `vi.spyOn` segítségével és mockold az implementációt egy üres függvénnyel. Mindig hívd meg a `mockRestore()`-t ugyanabban a tesztben, hogy elkerüld a mock átszüremlését más tesztekbe.

```typescript
const spy = vi.spyOn(console, "error").mockImplementation(() => {});
// ... render és assertion ...
spy.mockRestore();
```

Alkalmazott minta: az `ErrorBoundary.test.tsx` mindkét tesztje.

### Routing a tesztekben

Használd a `MemoryRouter`-t a `react-router-dom`-ból `BrowserRouter` helyett. Az `initialEntries`-t add meg a kiinduló URL vezérléséhez. A route-okat a teszten belül definiáld `Routes` és `Route` komponensekkel. Ez teljes kontrollt ad a routing állapot felett anélkül, hogy a `window.location`-re támaszkodnánk.

Alkalmazott minta: `RequireAuth.test.tsx`.

### Esemény szimuláció

Használd a `fireEvent.click(elem)` hívást a `@testing-library/react`-ból a felhasználói kattintások szimulálásához. A `screen.getByText("...")` az elemeket látható szövegtartalmuk alapján keresi meg. Részesítsd előnyben a szöveg alapú kereséseket a szerepkör alapú keresésekkel szemben, amikor callback viselkedést tesztelsz, nem akadálymentesítési szemantikát.

---

## Kézi tesztelési forgatókönyvek

### Bejelentkezési oldal

**Rossz hitelesítő adatok**: adj meg helyes e-mail formátumot rossz jelszóval. A form megmutatja az "Érvénytelen hitelesítő adatok" üzenetet. Négy sikertelen kísérlet után a form letiltódik és a küldés gomb 30 másodperces visszaszámlálót mutat. A visszaszámlálás lejárta után a form újra engedélyezetté válik.

**Tiltott fiók**: jelentkezz be egy tiltott felhasználó hitelesítő adataival. A hibaüzenet jelzi, hogy a tiltás ideiglenes-e (lejárattal) vagy végleges.

**Átirányítás megőrzése**: navigálj közvetlenül a `/app/releases` oldalra session nélkül. A bejelentkezési átirányítás az eredeti útvonalat tárolja a `location.state.from`-ban. Bejelentkezés után az alkalmazás visszanavigál a `/app/releases`-re az alapértelmezett helyett.

### Regisztrációs oldal

**Biztonsági kulcs megjelenítése**: sikeres regisztráció után a biztonsági kulcs pontosan egyszer jelenik meg. Navigálj el és vissza — eltűnt. Nincs mód arra, hogy az UI-ból újra lekérjük.

**Jelszó validáció**: a form ellenőrzi, hogy mindkét jelszó mező egyezik-e, és hogy a jelszó teljesíti-e a minimális hosszúsági követelményt a küldés előtt. Ha a kliens oldali validáció sikertelen, a szerver nem kerül meghívásra.

### Profilkép feltöltése

**5 MB feletti fájl**: tölts fel 5 MB-nál nagyobb képet. A kliens visszautasítja a HTTP kérés elkészítése előtt és hibát mutat. A `useProfile.ts` hook a `MAX_PFP_SIZE_BYTES = 5 * 1024 * 1024` értékkel kényszeríti ezt az `uploadProfilePicture` függvényen belül.

**Nem támogatott formátum**: tölts fel `.bmp` vagy `.tiff` fájlt. A kliens ellenőrzi a `file.type`-ot az `ALLOWED_IMAGE_TYPES` listával szemben és visszautasítja.

**Sikeres feltöltés**: sikeres feltöltés után az új kép azonnal megjelenik az oldalfrissítés nélkül. Az URL-en lévő `?v=<timestamp>` cache-törő paraméter a mechanizmus — ellenőrizd, hogy megjelenik-e a `<img>` tag `src` attribútumában a feltöltés után.

### Route-védelem

**Nem hitelesített hozzáférés**: navigálj a `/app/releases` oldalra bejelentkezés nélkül. Várj átirányítást a `/app/login`-ra. Az eredeti URL-nek a `location.state.from`-ban kell megőrződnie.

**Nem-admin hozzáférés az admin oldalhoz**: normál felhasználóként lépj be és navigálj a `/app/admin`-ra. Várd, hogy az oldal ne renderelődjön — a `DebugPage` és az `AdminPage` komponensek ellenőrzik az `isAdmin` értéket az `AuthContext`-ből és `<NotFoundPage />`-t adnak vissza, ha az false.

**Session lejárat munkamenet közben**: hagyd lejárni a session cookie-t, amíg az alkalmazás nyitva van. Indíts el bármilyen API kérést kiváltó navigációt. Az `apiClient.ts` 401 interceptorának azonnal a `/app/login`-ra kell átirányítania.

### Beállítások megőrzése

Váltsd a nyelvet magyarra, kapcsold be a sötét módot és válts a Midnight témára, majd zárd be és nyisd újra a böngészőfület. Mindhárom beállításnak meg kell maradnia, mert a `SettingsContext` a `localStorage["settings"]`-be szerializál.

Nyisd meg ugyanazt a fiókot egy második böngészőfülön és változtass egy beállítást ott. Az első fül nem frissül valós időben — a beállítások csak csatoláskor olvasódnak a tárolóból.

### React Query cache

Nyisd meg a React Query DevTools-t (bal alsó gomb fejlesztői módban). A profil lista betöltése után erősítsd meg, hogy a `["profiles", "byUserId", <id>]` cache bejegyzés létezik és nincs elavultnak jelölve. Indíts el egy profil frissítést — a bejegyzést invalidálni kell és újra lekérni. Kijelentkezés után erősítsd meg, hogy a cache üres (a `queryClient.clear()` kerül meghívásra a logout sikerekor).

### Toast értesítések

Válts ki egy sikeres műveletet (például profil névmentés) és ellenőrizd, hogy egy zöld "success" toast megjelenik és körülbelül 4 másodperc után automatikusan eltűnik. Válts ki egy hibát (küldj érvénytelen formot a szervernek) és ellenőrizd, hogy egy piros "error" toast megjelenik.

