# SMAASH Web Kliens — Felhasználói Útmutató

## Mi ez az alkalmazás

A SMAASH egy webes kísérőplatform egy játékhoz. Lehetőséget biztosít a játék letöltéseinek elérésére, a játszható karakterek és az eredeti hangsáv galériájának böngészésére, a globális ranglista megtekintésére, hírek olvasására, valamint egy játékon belüli tárgybolt használatára. Minden funkció a `/app/` útvonalon érhető el a böngészőben. Az alkalmazás támogatja az angol és a magyar nyelvet, és megjegyzi a megjelenítési beállításokat a munkamenetek között.

---

## Regisztráció

Menj a `/app/signup` oldalra. Add meg az e-mail címedet, válassz jelszót, majd végezd el az űrlapon megjelenő reCAPTCHA ellenőrzést. A reCAPTCHA kötelező az űrlap elküldése előtt, és védi a regisztrációs végpontot az automatizált robotoktól.

Sikeres regisztráció után a szerver kiad egy **biztonsági kulcsot**. Ez a kulcs pontosan egyszer jelenik meg, közvetlenül a regisztráció befejezése után. Másold le és tárold biztonságos helyen — jelszókezelőben, nyomtatott lapon vagy egy biztonságos dokumentumban. Ez a kulcs az egyetlen módja a jelszó visszaállításának, ha elfelejtennéd. Nincs e-mail alapú fiók-visszaállítás. Ha a kulcs elvész, a jelszó semmilyen felhasználó-felé néző mechanizmuson keresztül sem változtatható meg.

A megjelenítési nevet nem a regisztrációkor kell beállítani. Ez az első játékprofil létrehozásakor történik.

---

## Bejelentkezés

Menj a `/app/login` oldalra. Add meg a regisztrált e-mail címedet és jelszavadat, majd nyomd meg a bejelentkezés gombot. Sikeres bejelentkezés után az alkalmazás automatikusan a `/app/releases` oldalra irányít. Ha korábban egy adott oldalra próbáltál navigálni, oda irányít vissza.

Ha a megadott adatok nem egyeznek, a szerver egy általános "érvénytelen hitelesítő adatok" hibát ad vissza, anélkül hogy megjelölné, hogy az e-mail cím vagy a jelszó volt-e helytelen.

**Négy egymást követő sikertelen kísérlet** után a bejelentkezési űrlap 30 másodpercre lezáródik. A zárolás ideje alatt a beviteli mezők és a beküldés gomb is le van tiltva. A gomb feliratában megjelenik egy visszaszámlálás, amely mutatja a hátralévő várakozási időt. A zárolás lejártakor az űrlap automatikusan újra engedélyeződik.

Ha a bejelentkezési fiók tiltva van, hibaüzenet jelenik meg, amely jelzi, hogy a tiltás ideiglenes-e (a lejárat megjelenítésével) vagy végleges.

---

## Jelszó visszaállítása

Menj a `/app/reset-password` oldalra. Szükséged lesz a regisztrált e-mail címedre és a regisztrációkor kapott biztonsági kulcsra (vagy a legutóbb kiállított kulcsra, ha korábban már visszaállítottad). Add meg mindkettőt és küldd be.

Sikeres végrehajtás esetén:
- A jelszavad megváltozik.
- A szerver kiad egy **új biztonsági kulcsot**. Mentsd el azonnal — a régi kulcs azonnal érvényteleníti magát.
- Az aktuális munkamenet véget ér. Az új jelszóval újra be kell jelentkezned.

---

## Profilok

Egy SMAASH fiók több játékprofilt tartalmazhat. Minden profil egy független tárolóhely, saját megjelenítési névvel, érmemérleggel, profilképpel és vásárlási előzményekkel. Bejelentkezés után a `/app/profile-selector` profil-választóra kerülsz, ahol kiválasztod, melyik profilt szeretnéd használni az adott munkamenethez.

### Profil létrehozása

Nyomd meg a hozzáadás gombot a profil-választó képernyőn. Add meg a megjelenítési nevet. A 20 karakternél hosszabb nevek automatikusan 20 karakterre rövidülnek a beviteli mezőben. Opcionálisan feltölthetsz egy profilképet is ennél a lépésnél.

Elfogadott képformátumok: **JPEG, PNG, WebP és GIF**. A fájlnak **5 MB-nál kisebben** kell lennie. Ha a kép feltöltése sikertelen a profil létrehozása után, a profil kép nélkül is létrejön — a képet később is feltöltheted a profil oldalról.

A létrehozási dialógus megnyílásakor automatikusan egy névjavaslat jelenik meg, amelyet egy véletlenszerű melléknév prefix és egy természeti vagy állathangon alapuló suffix kombinációjából generál (pl. "Cosmic Thunder").

### Profilok közötti váltás

Kattints bármelyik profilkártyára a profil-választó képernyőn. Az alkalmazás menti a kiválasztást, és az adott profil érmemérlegét, vásárlási előzményeit és megjelenítési nevét használja minden funkcióban, amíg másik profilt nem választasz.

### Profil szerkesztése

Navigálj a `/app/profile` oldalra és kattints a szerkesztés gombra. Megnyílik egy oldalpanel, ahol módosíthatod a megjelenítési nevet és feltölthetsz egy új profilképet. A névmezőre ugyanaz a 20 karakteres korlát vonatkozik. A képfeltöltésre ugyanazok a formátum- és méretkorlátok érvényesek, mint a profil létrehozásakor.

Sikeres képfeltöltés után az új kép azonnal megjelenik, oldalfrissítés nélkül. Ezt egy `?v=<timestamp>` cache-busting paraméter hozzáfűzése teszi lehetővé a kép URL-jéhez, ami arra kényszeríti a böngészőt, hogy lekérje a frissített képet a gyorsítótárban lévő régi helyett.

### Profil törlése

A profil oldalon a törlés kiválasztása azonnal eltávolítja a profilt a listából — a felület a szerver megerősítése előtt frissül. Ha a szerver visszautasítja a törlést, a profil automatikusan visszajelenik.

---

## Kiadások

A `/app/releases` oldalon a játék kliens elérhető letöltései listázódnak. Az oldal tetején lévő platform-választóval szűrhetsz operációs rendszer szerint — Windows, macOS vagy Linux. A keresősávval meghatározott verziót találhatsz meg név vagy tag alapján. Minden kiadás bejegyzése megjeleníti a verzió címét, leírását és egy letöltés gombot. A lista legörgetéskor további bejegyzéseket tölt be.

---

## Galéria

A `/app/gallery` galériában két fül található, amelyek között az oldal tetején lévő gombokkal lehet váltani.

### Karakterek fül

Megjeleníti a játék összes játszható karakterét. Minden kártya a karakter alkotását és nevét mutatja. A megtekintéshez nem szükséges előrehaladás vagy játékon belüli feloldás.

### OST fül

A játék eredeti hangsávjának teljes értékű audiojátékosa. A bal oldalon a hangsávlista jelenik meg, a jobb oldalon az éppen lejátszott szám és a lejátszási vezérlők.

Elérhető vezérlők:
- **Lejátszás / Szünet** — a lejátszás indítása vagy megállítása.
- **Szám kiválasztása** — kattints bármelyik számra a listában az azonnali lejátszás indításához.
- **Haladás csúszka** — húzd az idővonal sávot az aktuális szám bármelyik pontjára ugráshoz.
- **Hangerő csúszka** — állítsd be a lejátszási hangerőt.
- **Némítás kapcsoló** — kattints a hangszóró ikonra a némításhoz és a visszakapcsoláshoz, a hangerő beállítása elveszítése nélkül.

---

## Ranglista

A `/app/leaderboard` ranglista a globális játékos rangsorokat mutatja. Az oldal tetején lévő fülek különböző rangsorolási kategóriák között váltanak. Az egyes kategóriák top 3 játékosa egy emelvényen jelenik meg — az első hely középen, a legmagasabban, a második bal oldalon, a harmadik jobb oldalon. Az emelvény alatt a teljes rangsorolt lista játékos névre szűrhető.

---

## Hírek

A `/app/news` híroldal a csapat bejelentéseit, patch note-jait és közösségi frissítéseit tartalmazza. A posztok kategóriákba vannak szervezve:

- **Major update** — jelentős új funkciók vagy tartalom kiadások.
- **Minor update** — kisebb kiegészítések és változtatások.
- **Patch** — hibajavítások és teljesítmény-fejlesztések.
- **Unrelated news** — közösségi események és egyéb információk.

Az oldal oldalán lévő kategória szűrővel szűkítheted a feedet. A keresősáv kulcsszó alapján keres a posztok között. A lista legörgetéskor további bejegyzéseket tölt be.

Az **admin vagy support szerepkörű** fiókok létrehozás, szerkesztés és törlés vezérlőket látnak minden poszt mellett. A sima felhasználói fiókok csak olvasási módban látják a feedet.

---

## Webáruház

A `/app/webstore` webáruházban az éppen aktív profilodhoz tartozó érméiddel vásárolható tárgyak jelennek meg.

Minden tárgy kártyán látható:
- Név és leírás
- Ár érmékben
- Egy színes **ritkaság-jelölő** (szín-kódolva, hogy a szinteket egyetlen pillantással felismerd):

| Ritkaság | Jelölő szín |
|---|---|
| Common | Szürke |
| Uncommon | Zöld |
| Rare | Kék |
| Epic | Lila |
| Legendary | Arany |

### Szűrés és keresés

A szűrősávval szűkítheted a tárgyakat **ritkaság** vagy **kategória** szerint. A keresőmezővel név alapján találhatsz meg egy tárgyat.

### Vásárlás

Kattints a vásárlás gombra egy tárgy kártyán. A tranzakció levonja az érméket az aktív profilod mérlegéből.

A **már meglévő** tárgyaid "Owned" jelölőt mutatnak a vásárlás gomb helyett. Azok a tárgyak, amelyek többe kerülnek, mint az aktív profilod aktuális mérlegén lévő érmék száma, letiltott vásárlás gombot mutatnak. A megjelenített érmemérleg az éppen aktív profilodhoz van kötve — a profil váltása megváltoztatja az elérhető mérleget és a tulajdonlás jelzőket.

---

## Beállítások

A `/app/settings` oldalon szabályozható, hogyan néz ki és viselkedik az alkalmazás. Az összes beállítás el van mentve a böngésződben és a munkamenetek között megmarad.

### Témák

18 előre beállított téma áll rendelkezésre. Mindegyik három pontból álló színátmenetet állít be a háttérhez, és opcionálisan aktivál egy hozzá illő animált hátteret:

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

Egy téma kiválasztása megváltoztatja a gradiens színeket és átvált a megfelelő animált háttérre, kivéve ha animáció felülírás van beállítva.

### Egyedi színek

A téma előre beállított értékek alatt három színválasztó segítségével önállóan beállíthatod a bal, középső és jobb gradiens stopokat. A változtatások azonnali hatásúak.

### Animáció felülírás

Az animáció felülírás lehetővé teszi, hogy a háttéranimáció független legyen a témától. Lehetőségek:

- **Téma alapértelmezett** — az animáció a kiválasztott témát követi.
- **Egy adott animáció** — a 12 animáció egyike játszódik le a témától függetlenül.
- **Nincs** — a háttéranimáció ki van kapcsolva, miközben a téma színek megmaradnak.
- **Egyedi (Effekt Mix)** — több animáció fut egyszerre, egymástól független rétegekként.

### Effekt Mix

Az Effekt Mix dialógus (az Egyedi felülírás beállításakor érhető el) lehetővé teszi, hogy egyszerre több háttéranimációt rétegezz egymásra. A 12 animáció mindegyike külön-külön engedélyezhető vagy letiltható. Minden animációnak megvannak a saját kapcsolható al-effektjei:

| Animáció | Al-effektek |
|---|---|
| Fishtank | Halak, Buborékok, Hínár, Kausztika, Fénysugár |
| Deep Space | (teljes effekt) |
| Aurora | (teljes effekt) |
| Lava Lamp | (teljes effekt) |
| Synthwave | (teljes effekt) |
| Sakura | (teljes effekt) |
| Storm | Eső, Villámlás, Felhők, Talajcsillogás |
| Particle Web | (teljes effekt) |
| Puddle Ripples | (teljes effekt) |
| Bioluminescence | (teljes effekt) |
| Constellation | (teljes effekt) |
| Void | (teljes effekt) |

Csak azok az engedélyezett animációk renderelődnek, amelyeknek legalább egy al-effektje be van kapcsolva.

### Animációk kapcsoló

Globálisan be- vagy kikapcsolja az összes mozgást. Kikapcsolt állapotban:
- A háttéranimációk a helyükön fagynak le (nem tűnnek el, de megállnak).
- Az oldal-átmeneti effektek kimaradnak — a tartalom azonnal megjelenik.
- Az összes `motion/react` komponens animáció el van nyomva.

Alacsony teljesítményű eszközökön vagy mozgás-érzékeny felhasználóknál hasznos.

### Liquid Glass

Az alkalmazás paneljeinek és kártyáinak vizuális stílusát váltja **matt üveg** megjelenés (`backdrop-blur`-t használó, elmosódott, félig átlátszó hátterek) és **tömör háttér** stílus között. A matt üveg effekt `backdrop-filter`-t támogató böngészőt igényel. Ennek engedélyezése az összes szöveget fehérre állítja a Sötét mód beállítástól függetlenül.

### Sötét mód

A felületeket és szövegszíneket sötét palettára váltja. A Sötét mód a téma gradienssel függetlenül működik — bármely téma használható sötét vagy világos módban egyaránt. Ha a Liquid Glass is be van kapcsolva, a Sötét mód az üvegfelületek átlátszóságát és elmosódás értékeit is módosítja.

### Nyelv

Angolra vagy magyarra vált. A változás azonnal érvénybe lép az egész alkalmazásban — az összes felirat, gomb, navigációs elem, hibaüzenet és oldal tartalom egyszerre vált. A nyelvi beállítás el van mentve a böngészőben.

---

## Fiókod

A `/app/profile` oldal a fiókod hitelesítő adatainak és játékprofiljaiddnak kezelési helye.

### E-mail cím módosítása

Add meg az új e-mail címet az e-mail részben és erősítsd meg. A változás azonnal érvénybe lép; a navbar a következő oldalbetöltéskor tükrözi az új e-mail címet.

### Jelszó módosítása

A jelszómódosításhoz szükség van az aktuális biztonsági kulcsodra — a regisztrációkor kapottra, vagy a legutóbb jelszó-visszaállítás után kiállítottra. Add meg a kulcsodat és az új jelszavadat, majd küldd be. Sikeres végrehajtás esetén kapsz egy új biztonsági kulcsot. Mentsd el; az előző kulcs azonnal érvénytelen lesz.

### Biztonsági kulcs értesítő

A regisztráció utáni első profil-oldal látogatáskor egy értesítő jelenik meg, amely emlékeztet a biztonsági kulcs mentésére. Amint megerősítöd, hogy láttad, az értesítő semmilyen jövőbeli munkamenetben nem jelenik meg újra.

---

## Navigáció

Az oldal tetején lévő navigációs sáv az alkalmazás összes részéhez vezet. Kis képernyőkön egy kompakt menübe csukódik össze, amelyet egy gombra koppintva nyithatsz ki. A navbar automatikusan eltűnik, ha az oldal teteje felett lefelé görgetel, és újra megjelenik, ha felfelé görgetel.

Az aktív profilod képe a jobb felső sarokban jelenik meg. Rákattintva megnyílik egy legördülő menü, amelyből elérhető a profil oldalad, a beállítások és egy kijelentkezés gomb.

Az **admin fiókok** a navigációs sávban az **Admin Panel** és a **Debug Irányítópult** linkjeit is látják.

---

## Admin Panel

A `/app/admin` admin panel kizárólag **admin szerepkörű** fiókok számára érhető el.

Egy kereshető listában mutatja az összes regisztrált felhasználót. Egy felhasználó kiválasztásakor megjelenik a teljes rekordja: e-mail cím, fiók szerepköre, tiltás állapota (időbeli tiltás esetén a lejárattal együtt) és az összes játékprofil.

A felhasználó részletes nézetéből elvégezhető:

- **Tiltás** — a fiók letiltása előre beállított vagy egyéni időtartamra. Előre beállított lehetőségek: 1 nap, 1 hét, 1 hónap, végleges. A végleges tiltás egy nagyon hosszú lejárati időként kerül beállításra a backenden. Az egyéni tiltás lehetővé teszi tetszőleges lejárati dátum megadását.
- **Tiltás feloldása** — az aktív tiltás eltávolítása és a hozzáférés azonnali visszaállítása.
- **Előléptetés** — a fiók emelése support vagy admin szerepkörre.
- **Visszaminősítés** — a fiók visszaállítása az alap felhasználói szerepkörre.

---

## Debug Irányítópult

A `/app/debug` debug irányítópult kizárólag **admin fiókok** számára érhető el.

Fülekre szervezve:

- **Stats** — valós idejű adatok a stats API-ból: legtöbbet vásárolt tárgyak, legjobb játékosok érmemérleg és meccsszám szerint, legtöbbet játszott pályák, és ranglista eredmények.
- **Characters** — játék karakterek böngészése, létrehozása, átnevezése és törlése.
- **Levels** — játék pályák böngészése, létrehozása, átnevezése és törlése.
- **Profiles** — az összes játékos profil böngészése (legfeljebb 200), megjelenítési nevek és érmemérlegek szerkesztése, profilok törlése.
- **Purchases** — az összes vásárlási rekord böngészése, új vásárlási rekordok létrehozása, meglévők szerkesztése vagy törlése.
- **Roles** — szerepkörök böngészése, létrehozása, átnevezése és törlése.
- **Categories** — tárgy kategóriák böngészése, létrehozása, átnevezése és törlése.
- **Rarities** — tárgy ritkaság szintek böngészése, létrehozása, átnevezése és törlése.
- **Posts** — hírek posztok böngészése (azonosítóval és időbélyegekkel); posztok létrehozása vagy frissítése.
- **Users** — egy felhasználó e-mail címének frissítése; felhasználói fiók törlése (kaszkádol az összes profiljára és vásárlására).

A debug irányítópult UI debug overlay-eket is biztosít (csak a fejlesztői buildben érhetők el): elrendezés szegélyek, breakpoint badge, FPS számláló, görgetési pozíció jelző, kattintási cél ellenőrző, Z-index inspektor és elem inspektor. Ezeket az irányítópult Debug Beállítások részéből lehet kapcsolni.

---

## Kijelentkezés

Kattints a profilképedre a jobb felső sarokban, majd válaszd a "Kijelentkezés" lehetőséget a legördülő menüből. A munkamenet azonnal véget ér, az összes alkalmazás-állapot törlődik a memóriából, és visszakerülsz a bejelentkezési oldalra.
