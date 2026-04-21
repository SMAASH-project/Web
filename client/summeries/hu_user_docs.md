# SMAASH Web Kliens — Felhasználói Útmutató

## Mi ez az alkalmazás

A SMAASH egy webes kísérőplatform egy játékhoz. Lehetőséget biztosít a játék letöltéseinek elérésére, a játszható karakterek galériájának böngészésére, a globális ranglista megtekintésére, hírek olvasására, valamint egy játékon belüli tárgybolt használatára. Minden a `/app/` útvonalon érhető el a böngészőben. Az alkalmazás támogatja az angol és a magyar nyelvet, és megjegyzi a megjelenítési beállításokat a munkamenetek között.

---

## Regisztráció

Menj a `/app/signup` oldalra. Add meg az e-mail címedet és válassz jelszót. Az űrlap elküldése előtt el kell végezned egy reCAPTCHA ellenőrzést is — ez védi a regisztrációs végpontot az automatikus robotok ellen.

Amikor a fiókod létrejön, a szerver visszaküld egy biztonsági kulcsot. Ez a kulcs pontosan egyszer jelenik meg, közvetlenül a regisztráció után. Jegyezd fel és őrizd meg biztonságos helyen. Ez az egyetlen módja a jelszó visszaállításának, ha elfelejtennéd. Nincs e-mail alapú helyreállítás — a kulcs nélkül a jelszó nem változtatható meg.

A megjelenített nevet nem a regisztrációkor kell beállítani. Ez az első játékprofil létrehozásakor történik.

---

## Bejelentkezés

Menj a `/app/login` oldalra. Add meg az e-mail címedet és a jelszavadat. Sikeres bejelentkezés után az alkalmazás automatikusan átirányít a `/app/releases` oldalra.

Ha helytelen hitelesítési adatokat adsz meg, a szerver egy általános "érvénytelen hitelesítő adatok" üzenetet küld vissza anélkül, hogy megjelölné, melyik mező volt helytelen. Ismételt sikertelen kísérletek után a bejelentkezési form 30 másodpercre zárolja magát. A zárolás alatt a form mezői és a küldés gomb letiltásra kerülnek. A gomb feliratában egy visszaszámláló mutatja a hátralévő másodperceket.

---

## Jelszó visszaállítása

Menj a `/app/reset-password` oldalra. Szükséged van a regisztrált e-mail címedre és a regisztrációkor kapott biztonsági kulcsra. Sikeres visszaállítás után a szerver egy teljesen új biztonsági kulcsot állít ki. Mentsd el — a régi azonnal érvénytelenné válik. A meglévő munkamenet is megszűnik, és újra be kell jelentkezned.

---

## Profilok

Egy SMAASH fiók több játékprofilt is tárolhat. Gondolj rájuk úgy, mint különálló mentési helyekre — mindegyiknek saját megjelenített neve, érme egyenlege és profilképe van. Bejelentkezés után a `/app/profile-selector` oldalra kerülsz, ahol kiválasztod, melyik profillal szeretnél játszani az adott munkamenetben.

### Profil létrehozása

Kattints a hozzáadás gombra a profilválasztó képernyőn. Írj be egy megjelenített nevet. A 20 karakternél hosszabb neveket az alkalmazás automatikusan 20 karakterre vágja le. Ennél a lépésnél opcionálisan feltölthetsz profilképet is.

Az elfogadott képformátumok: JPEG, PNG, WebP és GIF. A fájl mérete kisebb kell legyen 5 MB-nál. Ha a kép feltöltése sikertelen, a profil mégis létrejön kép nélkül — a feltöltést később is megpróbálhatod a profiloldalról.

### Profil váltása

Kattints bármelyik profilkártyára a profilválasztó képernyőn. Az alkalmazás elmenti a kiválasztást, és a munkamenet hátralévő részében ez a profil érvényes az érme egyenlegre, a vásárlásokra és a ranglistán elfoglalt pozícióra.

### Profil szerkesztése

A `/app/profile` oldalon kattints a szerkesztés gombra. Megnyílik egy oldalpanel, ahol módosíthatod a megjelenített nevet és feltölthetsz új profilképet. A névmezőre ugyanaz a 20 karakteres maximum érvényes. A képfeltöltésre ugyanazok a formátum- és méretkorlátozások vonatkoznak.

### Profil törlése

A profiloldalon a törlés kiválasztása azonnal eltávolítja a profilt a listából — a felhasználói felület a szerver megerősítése előtt frissül. Ha a szerver visszautasítja a törlést, a profil automatikusan visszajelenik.

---

## Releases (Kiadások)

A kiadások oldala a `/app/releases` oldalon érhető el, és felsorolja a játékkliens elérhető letöltéseit. A tetején lévő platformválasztóval operációs rendszer szerint szűrhetsz — Windows, macOS vagy Linux. Egy keresőmező segítségével verziónév vagy tag alapján is kereshetsz. Minden kiadási bejegyzésnél megjelenik a verzió neve, leírása és egy letöltés gomb.

---

## Galéria

A galéria a `/app/gallery` oldalon érhető el, és két részre osztható, amelyek között a tetején lévő fülekkel lehet váltani.

A Karakterek fül a játék összes játszható karakterét mutatja. Minden kártyán a karakter grafikája és neve látható. Ehhez nincs szükség semmilyen előrehaladásra vagy feloldásra.

Az OST fül egy teljes audiojátékos a játék eredeti zenéjéhez. Az egyik oldalon a számlista látható, a másikon a lejátszásvezérlők. Lejátszhatod és szüneteltetheted a lejátszást, bármelyik számra ugorhatsz rákattintással, a haladásjelzőt húzással az adott pontra viheted, és beállíthatod a hangerőt. A hangszóró ikon némítógombként is működik.

---

## Ranglista

A ranglista a `/app/leaderboard` oldalon érhető el, és megmutatja, hogyan helyezkednek el a játékosok egymáshoz képest globálisan. A tetején lévő fülekkel kategóriák között válthatsz. Az egyes kategóriák legjobb három szereplője egy dobogón jelenik meg — az első hely középen, a második balra, a harmadik jobbra. A dobogó alatt a teljes rangsor kereshető játékosnév szerint.

---

## Hírek

A hírek oldala a `/app/news` oldalon érhető el, és bejelentéseket, patch note-okat, valamint közösségi frissítéseket tartalmaz. A bejegyzések kategóriák szerint vannak rendezve. Az oldal egyik oldalán lévő kategóriaszűrővel szűkítheted a hírfolyamot. A keresőmező kulcsszó alapján keres a bejegyzések között.

Ha admin vagy support jogosultságod van, minden bejegyzés mellett megjelennek a létrehozás, szerkesztés és törlés gombok. A normál felhasználók csak olvashatják a hírfolyamot.

---

## Webáruház

A webáruház a `/app/webstore` oldalon érhető el, és az aktív profilod érméiért megvásárolható tárgyakat mutatja. Minden tárgyártyán szerepel a neve, leírása, ára és egy színes ritkaságjelölő. A ritkaságszintek: Közönséges, Nem közönséges, Ritka, Epikus és Legendás — mindegyiknek megkülönböztető színe van, hogy egyetlen pillantásra felismerd őket.

A szűrősávval ritkaság vagy kategória szerint szűkítheted a tárgyakat. A keresőmezővel névszerint kereshetsz.

A már megvásárolt tárgyaknál "Megvan" jelölés látható vásárlás gomb helyett. Azok a tárgyak, amelyek többe kerülnek, mint az aktív profilod egyenlege, letiltott gombot mutatnak. Az áruházban megjelenített érme egyenleg az éppen aktív profilodhoz van kötve, nem a fiókodhoz összességében. Profilt váltva megváltozik az elérhető egyenleg.

---

## Beállítások

A beállítások oldala a `/app/settings` oldalon érhető el, és az alkalmazás megjelenését és viselkedését szabályozza.

### Témák

18 előre beállított téma áll rendelkezésre. Mindegyik három pontos szín-alapú átmenetet állít be az alkalmazás hátterének és opcionálisan egy illeszkedő animált hátteret aktivál. A párosítások:

| Téma | Animáció |
|---|---|
| Azure | nincs |
| Slate | Vihar |
| Emerald | Cseresznyevirág |
| Amethyst | Lávlámpa |
| Coral | nincs |
| Sunset | Cseresznyevirág |
| Ocean | Halastó |
| Lavender | Sarki fény |
| Midnight | Mélységes tér |
| Fire | Lávlámpa |
| Aurora | Sarki fény |
| Neon Noir | Synthwave |
| Rose Gold | Cseresznyevirág |
| Monsoon | Tócsaripplák |
| Nebula | Részecskehálózat |
| Abyss | Biolumineszcencia |
| Starmap | Csillagkép |
| Void | Mélység |

Egy téma kiválasztása megváltoztatja a gradiens színeket és átváltja az animált hátteret a megfelelőre, hacsak nem állítottál be animáció felülbírálást.

### Egyedi színek

A témapreset-ek alatt három egyedi gradiens színt állíthatsz be egyéni színválasztókkal. A bal, középső és jobb szín egymásba olvad a háttéren. A módosítások azonnal életbe lépnek.

### Animáció felülbírálás

Az animáció felülbírálás lehetővé teszi a háttéranimáció megváltoztatását a témától függetlenül. A lehetőségek:

- Hagyja meg a téma alapértelmezettjét.
- Állítson be egy adott animációt, függetlenül az aktív témától.
- Állítsa "nincs"-re a háttéranimáció letiltásához, miközben a téma színei megmaradnak.
- Állítsa "egyedi"-re egy egyidejűleg több hatást kombináló rétegzett összeállítás futtatásához.

### Effekt rétegek

Az Effekt réteg párbeszédpanel lehetővé teszi több háttéranimáció egyidejű rétegezését. A 12 animáció mindegyike egyenként be- és kikapcsolható, és mindegyiknek saját aleffektusai vannak. Például a Halastó animációnál önállóan kapcsolható a halak, buborékok, hínár, fénytörés és fénysugarak megjelenítése. A Vihar animációnál külön-külön kapcsolható az eső, a villám, a felhők és a talajfény.

### Animációk ki-be kapcsolása

Globálisan ki- és bekapcsol minden mozgást. Kikapcsolt állapotban a háttéranimációk megállnak, az oldalátmenetek megszűnnek, és minden azonnal renderelődik. Ez segít alacsony teljesítményű eszközökön, vagy olyan felhasználóknál, akik a kevesebb mozgást részesítik előnyben.

### Liquid Glass (Folyadékos üveg)

A panelek és kártyák vizuális stílusát váltja egy homályos üveges kinézet (elmosott, félig átlátszó hátterek) és egy tömör háttérstílus között. A homályos üveghatás megfelelő megjelenítéséhez modern böngésző szükséges.

### Sötét mód

A szöveg és a felület színeit sötét palettára váltja. Ez a téma átmenettől függetlenül működik — bármely témát bármelyik módban használhatod.

### Nyelv

Angolra vagy magyarra vált. A módosítás azonnal érvényes az egész alkalmazásban, beleértve az összes feliratot, gombot, hibaüzenetet és navigációs elemet. A nyelv el van mentve a böngésződben, így csak egyszer kell beállítani.

---

## A fiókod

A `/app/profile` oldal az, ahol a fiókod hitelesítő adatait kezelheted.

Megváltoztathatod az e-mail címedet. Megváltoztathatod a jelszavadat, de ehhez szükséged van az aktuális biztonsági kulcsodra — a regisztrációkor kapottra (vagy a legutóbbi jelszóvisszaállítás utáni legfrissebbre). Jelszóváltoztatás után új biztonsági kulcsot kapsz.

Regisztráció utáni első bejelentkezésnél egy figyelmeztető üzenet jelenik meg, amely emlékeztet a biztonsági kulcs mentésére. Ha megerősíted, hogy láttad, a figyelmeztetés többé nem jelenik meg.

---

## Navigáció

Az összes oldal tetején lévő navigációs sáv hivatkozásokat tartalmaz az alkalmazás összes részéhez. Kis képernyőkön egy kompakt menübe csúszik össze, amelyet egy gomb megnyomásával nyithatsz meg.

Az aktív profilod képe a jobb felső sarokban jelenik meg. Rákattintva megnyílik egy legördülő menü, amelyből a profiloldaladra, a beállításaidhoz és egy kijelentkezés gombhoz navigálhatsz.

Admin fiókoknál az Admin Panel és Debug Panel hivatkozások is megjelennek a navigációs sávban.

---

## Admin Panel

Az admin panel a `/app/admin` oldalon érhető el, és csak admin szerepű fiókokkal férhető hozzá.

Megjeleníti az összes regisztrált felhasználó kereshető listáját. Egy felhasználóra kattintva megnyílik annak teljes profilja: e-mail, szerepkör, fiókállapot és összes játékprofilja. Innen kitilthatod a felhasználót előre beállított vagy egyedi időtartamra, feloldhatod a kitiltást, előléptetheted support vagy admin szerepkörre, vagy visszaminősítheted normál felhasználóvá.

---

## Debug Panel

A debug panel a `/app/debug` oldalon érhető el, és csak admin fiókokkal férhető hozzá.

Eszközöket biztosít a platform diagnosztizálásához és kezeléséhez: az élő React Query gyorsítótár vizsgálatát, API kérések manuális indítását, az összes adatbázis-rekord böngészését és szerkesztését (felhasználók, profilok, tárgyak, karakterek, kategóriák, ritkaságok, vásárlások, szerepkörök, bejegyzések, statisztikák), valamint különféle UI debug átfedések be- és kikapcsolását, mint elrendezési keretek, törésponti jelzők, FPS számláló, elem-inspektor és hálózati késleltetés-szimuláció.

---

## Kijelentkezés

Kattints a profilképedre a jobb felső sarokban, majd válaszd a "Kijelentkezés" lehetőséget. A munkamenet azonnal véget ér, és visszakerülsz a bejelentkezési oldalra. Az összes alkalmazásállapot törlődik a memóriából.
