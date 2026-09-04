# Autorun čtvrťového pipeline

Platí od 2. 9. 2026. **Automatizuje se mechanika, ne úsudek.**

> **Cíl není spotřebovat kvótu. Cíl je získat co nejvíc kompletních,
> plně ověřených čtvrtí. Nevyužitá kvóta je lepší než rozdělaný nebo
> pochybný pull.**

Čte se spolu s `docs/pricelabs-pull.md` (SOP, §14 pin geometrie,
§15 sdílená geometrie, §16 kvóta, §17 dávkování) a
`docs/pricelabs-acceptance.md` (přejímka 1–21).

## Co je ZMRAZENÉ

Ekonomika, prahy, `ctvrtWeight` a shrinkage, geografická sémantika,
vzorce, UI, pravidla přejímky. **Nesahat**, dokud skutečně nový režim
selhání neznemožní bezpečně pokračovat. Cíl je rozšířit MĚŘENÉ pokrytí
čtvrtí, ne vylepšovat nebo překalibrovat kalkulačku.

## Fronta

**Původní fronta vyčerpána 4. 9. 2026:** Žižkov (`71f63a7`), Smíchov
(`a7a83bb`), Karlín (`0afa7a0`) — všechny tři čtvrti se třemi přímo
měřenými pásmy, 0 změněných dřívějších kombinací, 9 pokusů celkem.

**Dočasná fronta od 4. 9. 2026 (rozhodnutí člověka): sonda pásma 4BR,
ne další geografie.** Důvod: 4+kk je dnes zastropené na 3BR přes celý
rozsah 70–140 m² (docs/calculator-model.md §4); jedno pásmo navíc může
opravit každou 4+kk cestu, další čtvrť zpřesní jedno místo.

1. **Kontrola sémantiky poskytovatele, bez kvóty** (`get_knowledge`):
   znamená „3-bedroom" přesně 3, nebo 3+? Když 3+, STOP a přemyslet —
   samostatné pásmo 4BR by bylo rozdělení téže populace, ne přidání.
   *Ověřeno 4. 9. 2026 11:25 UTC: knowledge bot říká „přesně 3", 4BR
   nejsou v 3BR zahrnuté; nad 4 se seskupuje do „4+". Je to odpověď
   znalostního bota, ne dokumentace — bere se jako předpoklad, který
   strukturovaná odpověď musí potvrdit (n 4BR ≪ n 3BR, RevPAR nad 3BR).*
2. **Praha 1, 4BR** — předregistrace `PREREGISTRACE.4br-sonda.md`
   ZMRAZENÁ před voláním; jeden dotaz, výslovně pojmenovaná hranice,
   syrový záchyt, kalendářní okno.
3. **Praha 2, 4BR** — totéž.
4. **STOP a hlášení** před jakoukoli změnou modelu nebo další 4BR
   geografií: nMin/nMean, poměr 4BR/3BR RevPAR, jestli některé pásmo
   projde stávající logikou spolehlivosti (okresní pásmo jde do
   `MARKET_STR` jen s nMin ≥ 50), a jestli je poměr dost stabilní, aby
   ospravedlnil architekturu pásma 4BR později.

**Během sondy se NESAHÁ na `BAND_BLEND`, `SIZE_RATIO`,
`CALC_MODEL_VERSION` ani produkční model.** Sonda je sběr dat; návrh
pásma 4BR je samostatná změna s vlastní předregistrací a regresí, kde
se smějí hýbat jen řádky `4kk`.

**Sonda proběhla 4. 9. 2026 11:30–11:33 UTC (pokusy 10–11), výsledek
v `PREREGISTRACE.4br-sonda.md` a commitu `31f29cc`.** Závěr člověka:
pásmo 4BR je životaschopné (Praha 1 nMin 94, poměr 1,343, po měsících
1,24–1,44), ale odvozený poměr pro ostatní okresy zatím stojí na jednom
spolehlivém zdroji a globálně se nenasazuje. Praha 2 (n ≈ 30) potvrzuje
směr, ne kalibraci. Malé okresy (P3/P5/P8, čekáno n ≈ 10–20) se na 4BR
NEPULLUJÍ — kalibraci nezlepší.

**Konvence:** P1 4BR dostane VLASTNÍ artefakt
(`data/pricelabs-2026-09/praha1.4BR.json`); `praha1.json` z 30. 8. se
nepřepisuje (syrový artefakt je autorita, jeho sha256 zůstává). Před
skládáním artefaktu a importem musí člověk schválit vrácené okresní
geometrie znak po znaku (`Praha 1 official boundary` / `Praha 2 official
boundary`, obě `openstreetmap`) — stejný kontrakt jako u čtvrtí.

**Stav 4. 9. 2026 12:00 UTC — okno vyčerpáno na 16 pokusů, 4 v rezervě,
žádné další volání dnes.** Hotovo nad rámec původní fronty (rozhodnutí
člověka během dne): Praha-celá 3BR + 4BR (poměr 4BR/3BR 1,444, oba
spolehlivé; `ea415e3`) a Praha 10 okres 1BR/2BR/3BR (`d6e90fb`, bez
integrace — 3BR n ≈ 13 s obsazeností 29 %, spouštěč sepnul, viz
předregistrace). Migrace `20260904120000_str_market_band_4br` aplikovaná.
Z fronty níž zbývá pro další okno jen Staré Město re-pull (předregistrace
zmrazená) a rozhodnutí o změně modelu 4+kk.

## Fronta pro další okno kvóty (od ~10:38 UTC 5. 9. 2026)

1. **Praha 10 okres, 1BR / 2BR / 3BR** (3 dotazy) — jediný okres, který
   dnes vrací „posoudíme individuálně". Nová geometrie → STOP po prvním
   pásmu na schválení. Předregistrace před voláním.
2. **Staré Město re-pull s měsíční řadou, 1BR / 2BR / 3BR** (3 dotazy) —
   odstraní jedinou `RECONSTRUCTED` buňku v produkci; nMin poprvé známé.
   Srovnání s rekonstruovanými hodnotami (3206 / 2467,4 / 533 …) je
   diagnostika, ne kritérium. Předregistrace před voláním.
3. **Praha-celá 3BR + 4BR** (2 dotazy) — druhý zdroj poměru 4BR/3BR
   s velkým n; `praha-cela.json` je „all sizes", takže obě pásma se
   musí změřit. Předregistrace před voláním.
4. **STOP a rozhodnutí** o změně modelu 4+kk z důkazů: nový `Band`
   „4BR", `BAND_BLEND["4kk"]` s `next: "4BR"` a blendem podle m²,
   `SIZE_RATIO["4BR/3BR"]`, odvozené 4BR jen tam, kde přímá data chybí.
   Vlastní předregistrace; v regresi se smějí hýbat jen řádky `4kk`.

Rozpočet: 8 dotazů + rezerva ≥ 4. Další čtvrti (Holešovice, Nusle,
Libeň, Vršovice) až po tomhle a jen se zbylým rozpočtem.

Každá další čtvrť potřebuje **vlastní předregistraci PŘED prvním
voláním** — modelem implikované poměry, okresní kontext, očekávaný
vzorek a váha, spouštěče. Zapisuje se do
`data/_partial-nedokonceno/PREREGISTRACE.<slug>.md`.

## Postup na jednu čtvrť

1. Předregistrace existuje a je zmrazená.
2. První úspěšné pásmo dá **kandidátní geometrii**.
3. **Není-li ten přesný řetězec už schválený člověkem → STOP a zeptat se.**
   Žádné odvozování ze vzoru pojmenování. Nové Město se 2. 9. tiše
   vyřešilo na `Prague Main Station circle (15 km)`, zatímco próza
   trh dál nazývala Novým Městem.
4. Po schválení: táž session, kde to jde, a **v každém dotazu výslovně
   pojmenovat schválenou hranici** (referenční „same geography already
   selected in this session" u Vinohrad vrátilo `data:null`).
5. U **každého** pásma zvlášť ověřit `selected_geometry_label`
   i `selected_geometry_source`.
6. Jen strukturovaná `data[]`. Próza nikdy — zmýlila se 4× za jediný den.
7. Syrová odpověď se zachytí `pl-raw.mjs` PŘED transformací.
8. Okno z `pullWindow()`. Nadmnožina se ořízne kalendářním pravidlem,
   vyřazené řádky zůstávají v syrové provenienci a v `excluded_rows`.
9. `basis: measured`. **Nikdy** nenahrazovat pásmo poměrovým rozpadem.
10. Plná přejímka `pl-import.mjs`.
11. Import **bez `--allow-uncommitted`** teprve po commitu artefaktu.
12. Integrace do `MARKET_CTVRT` s NEZMĚNĚNÝM modelem.
13. Diferenciální regrese: **0 změněných dřívějších kombinací.**
14. Testy a build.
15. Čistý commit; cizí změny ve worktree se nepřimíchávají.

## Kvóta

Rozpočet **20 pokusů**, okno ukotvené k prvnímu volání. **Každý pokus
se počítá**, i prázdná obálka, `data:null` a 429. Eviduje se `pokusů`,
ne stažených pásem. **Novou čtvrť nezačínat pod 4 zbývajícími dotazy.**
Radši nechat kvótu nevyužitou než vyrobit další rozdělanou čtvrť.

## Automatické STOPy — kolem těchto se neimprovizuje

- neschválená nebo nová geometrie
- neshoda geometrie
- chybějící požadovaný měsíc nebo duplicita uvnitř okna
- selhání syrové provenience nebo rekonciliace
- přímo měřené pásmo nedostupné i po povoleném retry
- neúspěch přejímky
- konflikt v databázi / ochrana proti přepisu historie
- ZMĚNA jakékoli dřívější kombinace kalkulačky
- selhání testů nebo buildu způsobené kódem
- jakýkoli skutečně nový režim selhání mimo SOP

Známá přechodná selhání (prázdná obálka, `data:null`) **nejsou** nový
režim. Jeden identický retry tam, kde ho SOP povoluje; počítá se do
kvóty. **Žádné cyklení přes různé formulace.**

## Další čtyři guardy

**8. Formálně úspěšná odpověď bez dat je spotřebovaný pokus.**
`success: true` s `data: null` (nebo jinak bez strukturovaného `data[]`)
se počítá do kvóty a řeší se retry pravidlem ze SOP. **Próza se nikdy
nebere jako data** — u Vinohrad přesně takhle vypadalo selhání, které
próza popsala větou „please ensure the relevant geography is selected".

**9. Ořez okna jen schváleným deterministickým pravidlem.**
Přijde-li víc měsíců než požadované uzavřené okno, smí `pl-raw.mjs`
a `pl-artifact.mjs` použít **výhradně** kalendářní pravidlo (pozice
v okně), které je pokryté testy. Syrová odpověď zůstává celá, vyřazené
řádky se zapisují do `excluded_rows`. **Nikdy neořezávat podle toho, že
měsíc „vypadá neúplně"** — datově závislé pravidlo by zrušilo smysl
deterministického okna.

**10. Geometrii potvrzuje každé pásmo samo.**
`session_id` je pomocný pin, **ne důkaz správné geometrie**. U každého
pásma zvlášť se ověřuje schválený `selected_geometry_label`
i `selected_geometry_source`. Že první pásmo sedělo, neznamená nic pro
druhé — u Vinohrad session geometrii ztratila hned napodruhé.

**11. Nový režim selhání = STOP.**
Cokoli, co není výslovně pokryté v `pricelabs-autorun.md`,
`pricelabs-pull.md` nebo `pricelabs-acceptance.md`, znamená zastavit.
**Během autorunu se pipeline ani pravidla nerozšiřují bez schválení
člověkem.** Rozšiřovat pravidla uprostřed běhu je přesně ten způsob,
jak se brána tiše změkčí.

## Zákaz

**Nesahat na listingy ani portfolio majitele.** Žádné
`get_listings`, `get_listing_data`, comp sety, Market Dashboard
postavený na vlastních listingech. Jen `market_research` na úrovni trhu.

## Hlášení

Po každé dokončené čtvrti. K pokračování na další čtvrť **není potřeba
souhlas**, pokud jsou všechny brány zelené a geometrie už schválená.
**Schválení každé nové geometrie člověkem zůstává povinné** — to je
jediná věc, která brání plně bezobslužnému běhu, a ruší se nesmí.
