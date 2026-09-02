# RESUME: Nové Město — dokončení pullu (2BR, 3BR)

Stav k 2026-09-02. Toto NENÍ produkční data. Nic z této složky se neimportuje.

## Checkpoint

- Soubor: `nove_mesto.1BR.PARTIAL.json`
- sha256: `4e0aa06c5aee0756a723ab4bb9299c228b0e1086dab057e5d7165936ca8934bf`
- Obsahuje: pouze pásmo **1BR**, přímo měřené, 12 uzavřených měsíců bez děr.
- Odvozeno (analyticky, nikam nezapsáno): nMin 1226, nMean 1288, adr 2627, revpar 1960, annual_rev 656128, occ 73.6, reliable true.

## Postup při obnovení (schváleno uživatelem)

1. **Nepřepulovávat 1BR**, pokud to workflow PriceLabs technicky nevynutí.
2. Pořadí: **2BR nejdřív, pak 3BR**.
3. Geometrie: přesně `New Town official boundary (openstreetmap)`.
   Přijmout jen při **přesné shodě řetězce** `selected_geometry_label` + `selected_geometry_source`.
   Jiný popisek = STOP, nová lidská schvalovací smyčka.
4. Okno: `2025_08 … 2026_07`. Musí odpovídat `pullWindow()`. Jiné okno = STOP.
5. Pokud PriceLabs **vynutí čerstvý pull 1BR**: porovnat vrácenou měsíční řadu
   (occ / adr / revpar / active_listings / avg_revenue) proti tomuto souboru.
   Jakýkoli nevysvětlený rozdíl = **konflikt → zastavit běh**, neimportovat, nahlásit.
6. **Žádné dopočítávání z poměrů.** Selhané pásmo se nenahrazuje pražským splitem
   ani ničím jiným. Chybí-li pásmo, artefakt nevzniká.
7. Po dokončení 2BR+3BR: složit **jeden úplný artefakt**, projet plnou akceptační
   bránu (`pl-artifact.mjs` → `pl-import.mjs`), nahlásit všechna tři měřená pásma,
   nMean/nMin, LTR kontexty a hash — a **ZASTAVIT před integrací do `MARKET_CTVRT`**.

## Otevřená provozní otázka

V checkpointu je uloženo `session_id`, ale **`geometry_token` uložen nebyl**
(nikde v repu se nevyskytuje). Pokud PriceLabs vyžaduje `session_id` + `geometry_token`
společně, bude obnovení pravděpodobně muset projít novým kolem výběru geometrie.
To je jeden požadavek navíc a znovu podléhá pravidlu přesné shody z bodu 3.
Do budoucna: `pl-artifact.mjs` by měl `geometry_token` ukládat do `meta`.

## Poznámka k „potvrzení" starého odhadu

Dříve odvozené 1BR pro Nové Město ≈ 665 000 Kč/rok vs. nově měřené ≈ 656 000 Kč/rok
→ rozdíl ~1,3 %. Platí to **pouze pro 1BR**. Neříká to nic o přesnosti
2BR/3BR splitu — právě ten je důvod, proč se měří.

---

# Doplněno 2026-09-02 (bez volání PriceLabs)

## A. Křížová kontrola: je checkpoint opravdu 1BR?

Otázka vznikla proto, že `active_listings` v checkpointu (průměr 1288) je
vysoké číslo. Ověřeno proti commitnutým okresním artefaktům
`data/pricelabs-2026-08/`:

| reference | 1BR adr | 1BR act |
|---|---|---|
| Praha 1 | 2917 | 1675 |
| Praha 2 | 2419 | 920 |
| Staré Město (yield.ts, měřeno) | 3206 | 533 |
| **checkpoint Nové Město** | **2628** | **1288** |

- **ADR sedí na 1BR.** 2628 leží mezi Prahou 2 (2419) a Prahou 1 (2917)
  a pod Starým Městem (3206) — přesně tam, kde Nové Město být má:
  přesahuje z P1 do P2 a je levnější než Staré Město.
- **Falzifikace „filtr ložnic nezabral":** kdyby odpověď byla za všechny
  velikosti, ADR by muselo být kolem 3300–3800 (vážený blend P1 1–3BR
  je 3817). Naměřeno 2628. Tuhle hypotézu to vylučuje.
- **Počet nabídek je na horní hranici věrohodnosti.** P1 má 1675 1BR,
  z toho 533 padne na Staré Město → na Nové Město (část v P1) + Malou
  Stranu + Hradčany + Josefov zbývá 1142. Zbytek Nového Města čerpá
  z P2 (920). 1288 je možné, ale znamená to široký polygon.
  **Test při dalším pullu:** pokud se 2BR vrátí blízko celé P1 (904),
  hranice je širší, než předpokládáme → zastavit a přeověřit geometrii.

Závěr: checkpoint se ponechává jako 1BR. Není důvod ho vyhazovat.

## B. Předregistrovaná predikce pro 2BR a 3BR

Tohle se zapisuje **před** měřením, aby se pak nedalo přizpůsobit výsledku.

Starý poměrový rozpad používal 0,779 / 1,221 / 1,891, tedy předpovídá
`2BR/1BR = 1,567` a `3BR/1BR = 2,427`.
Z naměřeného 1BR = 656 128 Kč/rok z toho plyne:

- **předpověď 2BR ≈ 1 028 000 Kč/rok**
- **předpověď 3BR ≈ 1 592 000 Kč/rok**

Skutečně naměřený rozptyl napříč devíti okresy (roční avg_revenue):

| poměr | min | medián | max | poměrový model |
|---|---|---|---|---|
| 2BR/1BR | 1,335 | 1,474 | 1,606 | **1,567** |
| 3BR/1BR | 1,431 | 2,417 | 2,706 | **2,427** |

Co z toho plyne:

- **2BR: model je u horního okraje.** 1,567 překonává sedm z devíti
  okresů. Očekávání: naměřené Nové Město přistane spíš na 1,45–1,56,
  tedy **starý odhad 2BR bude nadsazený, řádově o 2–8 %**.
  Pokud vyjde nad 1,60, je to mimo veškerý pozorovaný rozptyl → prověřit.
- **3BR: model je u mediánu, ale medián tu nic neznamená.** Rozptyl
  1,43–3,39 je tak široký, že okresní priors 3BR prakticky neomezují.
  Poměrový rozpad tam může být vedle o ±40 % a z ničeho by to nebylo
  vidět. **To je to pásmo, kvůli kterému se měří.** Navíc má nejmenší
  vzorek (P1 3BR jen 320, Nové Město pravděpodobně pod 150), takže se
  u něj počítá i s tím, že `nMin` spadne pod práh 50 a pásmo se stejně
  nezobrazí.

Ověřovací test po pullu je tedy: porovnat naměřené `2BR/1BR` a `3BR/1BR`
proti 1,567 / 2,427 **a** proti okresnímu rozptylu výše.

## C. Nález: falešná data v `_to_delete/gate-test/`

`_to_delete/gate-test/pricelabs-2026-07/` obsahuje soubory `nove_mesto.json`,
`nove_mesto_split.json` a `stare_mesto.json`, které vypadají jako produkční
artefakty (správná geometrie, `pulled: 2026-09-02`, `basis: measured`),
ale jsou to **doslovné kopie `praha3.json` a `praha1.json`**.
Podrobnosti a navržená oprava brány: `_to_delete/gate-test/_VAROVANI-FALESNA-DATA.md`.

Nebylo to použito k ničemu produkčnímu. Riziko je do budoucna:
brána kontroluje tvar a štítky, ne identitu čísel.

---

# Doplněno 2026-09-02, podruhé

## D. OPRAVA: `nMin < 50` čtvrť NEUMLČÍ

V předchozí zprávě jsem napsal, že Nové Město 3BR pod prahem `nMin=50`
se „stejně nezobrazí". **To je špatně a je to důležité.**

Běhová cesta čtvrti (`localCell` v `src/lib/yield.ts`):

```ts
const w = ctvrtWeight(own.nMean);   // 100 / 50 / 25 -> 1 / 0,75 / 0,5
```

`isReliableN(nMin)` se v produkčním kódu **nevolá vůbec** — grep ho najde jen
v testech. Váha čtvrti se řídí `nMean`, práh 50 na `nMin` je jiné pravidlo
pro jinou vrstvu. Staré Město to ukazuje názorně: má `nMin: null`, takže
`isReliableN` by bylo `false`, a přesto jede s vahou 1,0 přes `nMean: 533`.

Takže **přímo naměřené 3BR Nového Města s `nMin` třeba 30 veřejný výsledek
ovlivní** (nMean ≥ 25 → váha 0,5). Proces pullu si nesmí myslet opak.

Ekonomika je zmrazená, nic se tu nemění. Je to poznámka, ne úkol.

## E. Důsledek zavedení surové provenience pro checkpoint 1BR

Od 2. 9. 2026 čtvrťový artefakt bez `meta.raw_provenance` neprojde importem.
Checkpoint 1BR vznikl **před** zavedením záchytu a syrová odpověď se
neuchovala — dopsat ji zpětně nelze, to je celý smysl toho opatření.

Jsou dvě cesty a je to rozhodnutí, ne technikálie:

- **(a) Přepullit i 1BR se záchytem.** Celá trojice pásem má pak souvislý
  řetězec až k odpovědi PriceLabs. Stojí to jeden dotaz navíc a uložený
  checkpoint se stane křížovou kontrolou: porovnání měsíční řady je přesně
  to, co už je nařízené v bodě 5 nahoře. Nesouhlas = konflikt = stop.
- **(b) Nechat 1BR grandfatherované** s výslovným příznakem, že jeho řetězec
  končí u artefaktu. Ušetří dotaz, ale Nové Město by mělo dvě pásma
  s doložitelným původem a jedno bez — přesně ten stav, kvůli kterému
  se to celé stavělo.

Doporučení: **(a)**. Cena je jeden dotaz z dvaceti.

---

# 2026-09-02, pokus o přepull 1BR — ZAMÍTNUTO

`market_research` **funguje** (`success: true`, 200). Selhala geometrie.

| | |
|---|---|
| požadováno | `New Town official boundary (openstreetmap)` |
| vráceno | **`Prague Main Station circle (15 km)`**, source `circle` |

PriceLabs si polygon vybral sám, bez `requires_selection`, a `market_label`
přitom hlásí `"New Town (Nove Mesto), Prague - 1BR"` — tedy jen ozvěnu mé
otázky. **Popisek trhu lhal, geometrie ne.** Přesně proto se porovnává
`selected_geometry_label`, ne `market_label`.

Důkaz, že to není Nové Město: `active_listings` za 2025_08 = **4802**, zatímco
součet 1BR přes praha1..praha9 je **4402**. Ten polygon je větší než město.
Proti checkpointu je to 3,93× nabídek.

Data uložena jako `nove_mesto.1BR.ZAMITNUTO-circle15km.json`, `pull_state:
rejected_geometry_mismatch`. **Nepoužitelné ani analyticky.**
`pl-raw.mjs` se nespouštěl — envelope by u kontroly geometrie stejně spadl.

## Co to mění

1. **Checkpoint 1BR se nepřepisuje.** Zůstává jak byl, sha256
   `4e0aa06c…`, dál bez surové provenience.
2. **Auto-výběr geometrie je nespolehlivý.** Ta samá geografie vyšla ráno
   jako `New Town official boundary (openstreetmap)` a teď jako
   patnáctikilometrový kruh. Formulace otázky to neuřídí.
3. **Další pokus musí vynutit kolo výběru geometrie** a `geometry_token`
   se musí uložit — bez tokenu není opakovatelnost. Volbu dělá člověk,
   skript ani model ji hádat nesmí.

Spotřeba: **1 dotaz** (zamítnutý).

## Pokus vynutit kolo výběru geometrie — NEVYŠEL

Jeden dotaz, výslovně žádající seznam hraničních polygonů před jakýmikoli daty.
Odpověď: `success: true`, ale **`data: null`** a žádné `requires_selection`.
Agent slovně odmítl hranice vyjmenovat a odkázal na mapové nástroje v UI.

Závěr: **kolo výběru geometrie se nedá vyžádat.** Backend ho vypíše jen tehdy,
když sám vyhodnotí místo jako nejednoznačné. My ho nespustíme tím, že o něj
požádáme, takže `geometry_token` se přes tenhle nástroj cíleně získat nedá.

Přitom polygon `New Town official boundary (openstreetmap)` v systému
prokazatelně existuje — ráno se na něj auto-výběr trefil. Je dosažitelný,
jen ne deterministicky.

Spotřeba: **2 dotazy dnes** (zamítnutý kruhový pull + tenhle).

---

# 2026-09-02: session JAKO PIN geometrie — VYŠLO

Dotaz se `session_id` z ranního úspěšného pullu, bez `geometry_token`,
bez nového popisu místa.

- `session_created: false` — session se opravdu navázala, nezaložila.
- `selected_geometry_label: "New Town official boundary"`
- `selected_geometry_source: "openstreetmap"`
- okno `2025_08 … 2026_07`
- **všech pět řad se shoduje s checkpointem 12/12, bajt v bajt**

Surová provenience zachycena: `data/pricelabs-raw/nove_mesto.1BR.raw.json`,
`raw_sha256 8590f08969709c92…`. Rekonciliace prochází; změna jediného čísla
o setinu (2608,06 → 2608,07) skončí STOPem.

## Odpověď na otázku „stačí session k připnutí geometrie?"

**Ano, prokazatelně jednou.** Session nese vyřešený polygon a stejný dotaz
v ní vrátí totéž. To je zatím jedno pozorování, ne zákon — session může
vypršet a token pořád nemáme.

Provozní pravidlo pro 2BR a 3BR:

1. Volat ve **stejné session** `lg_sess_53qgh-PThu5VQ8KTERikDHMu3STZ2-zH`.
2. Nepopisovat geografii znovu. Odkazovat se na už vybranou geometrii.
3. U **každé** odpovědi zkontrolovat `selected_geometry_label` +
   `selected_geometry_source`. Cokoli jiného = okamžité zamítnutí,
   žádné druhé znění dotazu.
4. Kdyby session vypadla, zbývá cesta přes web UI a ruční token.

Pin je tedy nedokazatelný dopředu — proto tu práci odvádí brána, ne důvěra.

## Vedlejší nález: převod měny dělá PriceLabs, ne my

Odpověď nese `base_currency: USD`, `display_currency: CZK`,
`currency_conversion_applied: true`. Čísla přicházejí **už v korunách**.

Poznámka v artefaktech „CZK (converted from USD, month-aligned rates)" tedy
popisuje **jejich** převod, ne náš krok. Chybějící tabulka kurzů v repu není
mezera — žádná nikdy neexistovala, protože se nikdy nepřepočítávalo.
`pl-raw.mjs` má proto `fx` volitelné a bez kurzu **netoleruje nic**:
artefakt se musí odpovědi rovnat přesně.

## Stav checkpointu

`nove_mesto.1BR.PARTIAL.json` je tímto **překonaný** — táž čísla teď existují
s doloženým původem. Zůstává na disku jako doklad shody. Do produkce nejde
ani jeden z nich: artefakt vznikne až se všemi třemi pásmy.

Spotřeba dnes v této fázi: **3 dotazy** (zamítnutý kruh, neúspěšný pokus
o seznam geometrií, úspěšné zopakování 1BR).

---

# 2026-09-02: 2BR — PROŠLO

Táž session, `session_created: false`, geometrie `New Town official boundary`
/ `openstreetmap`, okno `2025_08 … 2026_07`, dvanáct měsíců bez děr u všech
pěti řad. Surová provenience: `data/pricelabs-raw/nove_mesto.2BR.raw.json`,
`raw_sha256 602612d792dbb784…`, rekonciliace prochází. `basis: measured`.

| pásmo | nMin | nMean | ADR | RevPAR | roční výnos | obsazenost |
|---|---|---|---|---|---|---|
| 1BR | 1226 | 1288 | 2 627 | 1 960 | 656 128 | 73,6 % |
| 2BR | **608** | **619** | **4 031** | **3 046** | **1 016 716** | **74,5 %** |

## Předregistrovaný test — výsledek

| | |
|---|---|
| model předpovídal `2BR/1BR` | **1,567** |
| naměřeno (roční výnos) | **1,550** |
| naměřeno (ADR) | 1,534 |
| okresní rozptyl | 1,335 – 1,606 (medián 1,474) |
| rozdíl proti předpovědi | **−1,1 %** |

Směr jsem odhadl správně (model je nadsazený, naměřené sedí u horního
okraje okresního rozptylu), **velikost chyby jsem přestřelil**: čekal jsem
nadsazení o 2–8 %, ve skutečnosti je to 1,1 %. Poměrový rozpad byl pro 2BR
Nového Města lepší, než jsem předpokládal.

Uvnitř rozptylu, žádný spouštěč vyšetřování nezapálil.

## Koherence polygonu — dřívější obava zamítnuta

Podíl Nového Města na součtu Prahy 1 + Prahy 2:

- 1BR: **49,6 %** (1288 z 2595)
- 2BR: **49,0 %** (619 z 1264)

Dvě nezávislá pásma dávají tentýž podíl. Předregistrovaný spouštěč —
„2BR se vrátí blízko celé P1 (904)" — **nezapálil**, naměřeno 619.
Obava, že polygon je moc široký, tím padá.

## Drobnost k zaokrouhlení

`occupancy_pct` chodí na jedno desetinné místo, takže `revpar / adr` dá
někdy nepatrně jinou obsazenost (prosinec 2025: vykázáno 83,7 %, implikováno
83,653 %). Maximální relativní odchylka `revpar` proti `occ × adr` je
0,082 %. Nemá to vliv na nic, co počítáme — jen ať to příště nikoho neplaší.

**STOP před 3BR** podle pokynu. Nic se neimportovalo, artefakt se neskládá.
Spotřeba dnes: **4 dotazy**.

---

# 2026-09-02: 3BR — SELHALO, `{"success":false,"error":""}`

Táž session, tentýž tvar dotazu jako u 2BR, změněné jen pásmo. Prázdná
obálka bez chybové zprávy. Podle stálého pravidla **okamžitý stop, žádné
druhé znění dotazu**.

## Stav pásem

| pásmo | stav | surová provenience |
|---|---|---|
| 1BR | HOTOVO, measured | `8590f08969709c92…` |
| 2BR | HOTOVO, measured | `602612d792dbb784…` |
| 3BR | **NEPROBĚHLO** | — |

Obě hotová pásma jsou na disku a nedotčená. Artefakt se neskládá,
nic se neimportovalo, `MARKET_CTVRT` beze změny.

## Co víme o té poruše

Selhání v této session (`lg_sess_53qgh…`) přišlo u 2. a 5. volání:

1. 1BR (ráno) — OK, session založena
2. 2BR (ráno) — **prázdná obálka**
3. 1BR zopakováno — OK
4. 2BR — OK
5. 3BR — **prázdná obálka**

Není to kvóta: mezi selháními jsou úspěchy. Není to řídká data: ranní
selhání bylo 2BR, kde je 608 nabídek. Není to formulace: 2BR prošlo se
stejnou větou. **Zůstává přechodná porucha endpointu, kterou neumíme
předpovědět.** Žádnou hypotézu si nevymýšlím nad rámec toho.

## Riziko, které tím vzniklo

Pin geometrie drží **session**, ne token. Když session vyprší dřív, než
se 3BR podaří stáhnout, přijdeme o jediný ověřený způsob, jak se na
`New Town official boundary` trefit — a zbývá cesta přes web UI a ruční
token. 1BR a 2BR to neohrozí, ty jsou zachycené a doložené.

Spotřeba dnes: **5 dotazů** (4 úspěšné, 1 prázdná obálka).

## Opakování 3BR — znovu prázdná obálka

Identický dotaz, identická session, žádná změna parametru. Zase
`{"success":false,"error":""}`. Konec pokusů, jak bylo domluveno.

### Úspěšnost podle pásma (tato session)

| pásmo | pokusů | úspěch | nMean |
|---|---|---|---|
| 1BR | 2 | 2 | 1288 |
| 2BR | 2 | 1 | 619 |
| 3BR | **3** | **0** | (čekáno ~150) |

Selhání sedí monotónně na velikost vzorku. **Hypotéza:** porucha souvisí
s řídkostí pásma, ne se session ani s kvótou. Slabina hypotézy: 2BR
jednou selhalo a má 619 nabídek, takže to není čistý příběh a tři pokusy
u 3BR jsou málo na závěr.

**Důsledek pro další postup:** kdyby ta hypotéza platila, **ruční token
z UI problém nevyřeší** — pin geometrie neopraví pásmo, které backend
neumí vrátit. Než se investuje do cesty přes UI, stojí za to nejdřív
zjistit, jestli 3BR pro tenhle polygon vůbec existuje.

### Zachovaný stav

`data/pricelabs-raw/nove_mesto.1BR.raw.json` (`8590f08969709c92…`) a
`nove_mesto.2BR.raw.json` (`602612d792dbb784…`) beze změny. Žádný artefakt,
žádný import, `MARKET_CTVRT` netknuté. Session `lg_sess_53qgh…` naposledy
prokazatelně vracela správný polygon u 2BR.

Spotřeba dnes: **6 dotazů** (4 úspěšné, 2 prázdné obálky).

## Průzkum PriceLabs UI — zablokováno přihlášením

`app.pricelabs.co/market_dashboards` přesměrovalo na přihlašovací obrazovku.
Vestavěný prohlížeč nemá k PriceLabs žádnou přihlášenou relaci.

Přihlašovací údaje nezadávám — hesla nevyplňuji. Průzkum je tím pozastaven,
dokud se uživatel v panelu prohlížeče nepřihlásí sám.

Žádný `market_research` dotaz při tomhle kroku neproběhl. Kvóta beze změny:
**6 dotazů dnes**.

### Až přihlášení bude, hledá se tohle

1. Má schválený polygon Nového Města v UI **vůbec segment 3BR**?
2. Když ano, jaká čísla ukazuje (nMean/nMin řádově)?
3. Nese síťový požadavek **stabilní identifikátor geometrie / token**?

Bod 3 je ta hodnotná část: token by nahradil pin přes session, který
vyprší. Body 1–2 rozhodnou mezi „data nejsou" a „agent je neumí vrátit".

## Průzkum PriceLabs UI přes Chrome — bez odpovědi, obě cesty jsou placené

Chrome je přihlášený, do UI se dostat jde. Diagnostika za nulovou cenu
ale **neexistuje**:

| nástroj | URL | stav | co stojí pohled na data |
|---|---|---|---|
| Market Dashboards | `/reports` | žádný dashboard založený | **1 kredit** za založení |
| Revenue Estimator Pro | `/revenue_estimator` | „No Active Plan" | **1 ze 2 free tokenů** za odhad |

Ani jeden neukáže trh, dokud se něco nezaloží, a založení spotřebuje
placenou jednotku. Nic jsem nezaložil ani neutratil.

Navíc Market Dashboards jedou podle vlastního popisu „deep dive into market
data using **comp-sets**" — comp sety se staví kolem vlastních listingů,
což naráží na zákaz sahat na listingy. Revenue Estimator Pro je odhad pro
konkrétní nemovitost, ne přehled čtvrti po pásmech; není jisté, že vůbec
umí to, co potřebujeme.

**Otázka „má polygon Nového Města 3BR data?" tím zůstává nezodpovězená.**

### CHYBA, KTEROU JSEM UDĚLAL

Při hledání navigace jsem vytáhl celý text stránky `/pricing`, což je
dashboard listingů. Do kontextu se mi tím dostala tabulka všech 11 listingů
(názvy, ceny, obsazenosti). Bylo to proti výslovnému zákazu.
Nepoužil jsem z toho nic a nic z toho nikam nezapisuju. Dál už jsem
používal jen cílené dotazy a screenshoty, ne výpis textu stránky.

---

# Diagnostika Praha 2 3BR — PROŠLA

Jeden dotaz, nová session, aby se nesahalo na pin Nového Města.
Geometrie se auto-výběrem trefila správně: `Praha 2 official boundary` /
`openstreetmap`. Okno `2025_08 … 2026_07`, dvanáct měsíců bez děr.

```
nMin 120   nMean 127   adr 5874   annual_rev 1 418 414
```

**Segment 3BR o velikosti řádově srovnatelné s očekávaným Novým Městem
(~150) se vrátil bez potíží.**

## Co to dělá s hypotézou o řídkosti

Oslabuje ji. „Malá 3BR pásma obecně padají" tímhle neprošlo: 120 nabídek
stačí. Zbývá buď nestabilita endpointu, nebo něco specifického pro
kombinaci Nové Město × 3BR.

**Kauzalitu z jednoho testu netvrdím.** Vyloučeno není nic; jen ta
nejjednodušší verze sparsity hypotézy je teď méně pravděpodobná.

## Bonus: commitnutý `praha2.json` se reprodukoval

Týž window jako pull z 30. 8. 2026, takže šlo srovnat přímo:

| řada | výsledek |
|---|---|
| occ | shoda 12/12 |
| adr | shoda 12/12 |
| revpar | shoda 12/12 |
| active_listings | shoda 12/12 |
| avg_revenue | shoda 12/12 |

Pět řad, dvanáct měsíců, **bajt v bajt** po třech dnech. Okresní artefakty
jsou tedy reprodukovatelné a `pullWindow()` drží. Surová provenience jim
pořád chybí (vznikly před záchytem), ale jejich čísla živý PriceLabs
potvrzuje.

Spotřeba dnes: **7 dotazů** (5 úspěšných, 2 prázdné obálky).

---

# ZMRAZENÝ STAV — 2026-09-02 (čti tohle první)

| věc | stav |
|---|---|
| Nové Město 1BR | platné, `basis: measured`, raw `8590f08969709c92…` |
| Nové Město 2BR | platné, `basis: measured`, raw `602612d792dbb784…` |
| Nové Město 3BR | **chybí** (3 pokusy, prázdná obálka) |
| složený artefakt | **nevznikl** — pull je neúplný |
| `MARKET_CTVRT` | **nedotčeno** |
| náhrada poměrem | **zakázána** |
| připnutá session | `lg_sess_53qgh-PThu5VQ8KTERikDHMu3STZ2-zH`, zachovat |
| brána | hotová, **beze změn**, dokud se neobjeví nový režim selhání |

## Jediná další akce

Zopakovat Nové Město 3BR **jednou**, v připnuté session, **beze změny
znění dotazu**. Uspěje → dobře. Selže, session vyprší, nebo se změní
geometrie → zamítnout a řešit stabilní `geometry_token`.

Nic dalšího kolem pullu se neupravuje. Riziko už není v našem potrubí,
ale v endpointu.

## Co nesmí zmizet při úklidu

- `data/pricelabs-raw/*.raw.json` a `*.sha256` — to je ten důkazní řetězec.
- `raw_sha256` je haš **kanonické** podoby envelope, ne bajtů souboru.
  `sha256sum` proto vrátí jiné číslo. **Není to poškozený soubor.**
  Kdo to bude „opravovat", rozbije platný artefakt.

---

# 2026-09-02: 3BR — PROŠLO. Všechna tři pásma měřená.

Táž připnutá session, `session_created: false`, znění dotazu beze změny.
Geometrie `New Town official boundary` / `openstreetmap`, okno
`2025_08 … 2026_07`, 12/12 u všech pěti řad. Rady čteny z `data[]`.
Raw: `3656b9794aa1cff7…`, rekonciliace prochází, `basis: measured`.

| pásmo | nMin | nMean | ADR | RevPAR | roční výnos | obsazenost |
|---|---|---|---|---|---|---|
| 1BR | 1226 | 1288 | 2 627 | 1 960 | 656 128 | 73,6 % |
| 2BR | 608 | 619 | 4 031 | 3 046 | 1 016 716 | 74,5 % |
| 3BR | **219** | **231** | **6 503** | **4 851** | **1 642 663** | **73,9 %** |

## Předregistrovaný test 3BR

| | |
|---|---|
| model předpovídal | 2,427 → 1 592 423 Kč/rok |
| naměřeno | **2,504 → 1 642 663 Kč/rok** |
| rozdíl | **+3,2 %** |
| okresní rozptyl | 1,431 – 2,706 (medián 2,417) |

Uvnitř rozptylu, blízko mediánu. **Žádná skrytá čtvrťová odchylka
v mixu ložnic se nenašla.** Poměrový rozpad byl u všech tří pásem
v mezích ±3,2 %:

| pásmo | model | naměřeno | rozdíl |
|---|---|---|---|
| 2BR/1BR | 1,567 | 1,550 | −1,1 % |
| 3BR/1BR | 2,427 | 2,504 | +3,2 % |

Pozor na výklad: **neznamená to, že rozpad je obecně v pořádku.**
Znamená to, že v Novém Městě náhodou seděl. Jinde se to musí změřit,
ne předpokládat — přesně proto se to měřilo tady.

## Hypotéza o řídkosti je definitivně mrtvá

3BR Nového Města má **219–245 nabídek**, víc než Praha 2 3BR (120–136),
která prošla napoprvé. Selhání nemělo s velikostí vzorku nic společného.
Zbývá čistá nestabilita endpointu: **čtyři pokusy o 3BR, čtvrtý uspěl**,
beze změny čehokoli.

## Podíl na P1+P2 — třetí nezávislé potvrzení polygonu

1BR 49,6 % · 2BR 49,0 % · **3BR 51,6 %**

Tři pásma, tentýž podíl. Geometrie je konzistentní.

## Stav

Všechna tři pásma měřená a doložená. **Složený artefakt se ZATÍM
neskládá a do `MARKET_CTVRT` se nesahá** — čeká se na pokyn.

Spotřeba dnes: **8 dotazů** (6 úspěšných, 2 prázdné obálky).

---

# 2026-09-02: složený artefakt PROŠEL bránou (dry-run)

`data/pricelabs-2026-09/nove_mesto.json`, sha256 `5a45943ce88d79f6…`,
4534 bajtů, `pull_state: complete`. Přejímka 20/20.

| pásmo | n_min | n_mean | ADR | RevPAR | roční výnos | reliable | raw |
|---|---|---|---|---|---|---|---|
| 1BR | 1226 | 1288 | 2 627 | 1 960 | 656 128 | ano | `8590f089…` |
| 2BR | 608 | 619 | 4 031 | 3 046 | 1 016 716 | ano | `602612d7…` |
| 3BR | 219 | 231 | 6 503 | 4 851 | 1 642 663 | ano | `3656b979…` |

LTR: `praha1/nove_mesto` efekt −0,8 % (n=41), `praha2/nove_mesto`
efekt −2,2 % (n=26). Obě geometrii sdílejí, obě mají vlastní efekt,
žádný fallback. Duplicita payloadu: žádná.

## DVĚ VĚCI, KTERÉ JEŠTĚ NEJSOU HOTOVÉ

### 1. Podmínka „nejdřív commitni surový artefakt" byla obejita

Brána vyžaduje, aby artefakt byl v gitu **dřív**, než se z něj odvozuje
(pravidlo „raw saved before derived writes"). Protože commit byl zakázán,
běželo to s `--allow-uncommitted`, což je vlastní dokumentací označeno
jako *„jen pro dry-run zkoušku"*.

**Tahle podmínka tedy NENÍ splněná, jen odložená.** Ostrý import musí
proběhnout až po commitu artefaktu a surových obálek, bez toho přepínače.

### 2. Adresář je pojmenovaný jinak, než default skriptu

Repo pojmenovává adresář podle **měsíce pullu** (`pricelabs-2026-08`
= pull 30. 8. 2026, okno končí 2026_07). `pl-artifact.mjs` ale defaultuje
na **konec okna**, což by dalo `pricelabs-2026-07`.

Použil jsem explicitní `--out data/pricelabs-2026-09/`, aby to sedělo
s repem. **Default skriptu je s konvencí v rozporu** a příště by mlčky
vyrobil špatný adresář. Bránu jsem neměnil, jak bylo řečeno — je to
zapsané jako úkol.

## Účtování kvóty

`--requests 8` je HORNÍ ODHAD (≤ 8), ne potvrzená spotřeba. Všechny dotazy na geometrii Nového Města: ranní 1BR,
ranní 2BR (prázdná obálka), kruhový pull (zamítnutý), pokus o seznam
geometrií, zopakované 1BR, 2BR, 3BR (prázdná obálka), 3BR (úspěch).
Diagnostika Prahy 2 se nepočítá, ta patří jinam.

**Jestli se selhané dotazy do kvóty počítají, nevíme** — proto „≤ 8", nikoli „8 spotřebováno". — odpověď žádný
counter nevrací. Osmička je horní odhad.

## Stav

Nic zapsáno, `--emit-sql` nespuštěno. `MARKET_CTVRT`, `yield.ts`,
ekonomika, Supabase — **netknuté**. Žádný commit, žádná publikace.

---

# STAVOVÁ VĚTA

**Artefakt Nového Města je ověřený a připravený k importu; import zatím
neproběhl, protože surový artefakt není commitnutý.**

Hotové je *sestavení a ověření* (20/20, dry-run). Zbytek je provozní:

1. commitnout surovou vrstvu (3 obálky + `nove_mesto.json`) odděleně
2. teprve pak import **bez** `--allow-uncommitted`
3. teprve pak `--emit-sql` a zápis
4. opravit default adresáře v `pl-artifact.mjs` před další čtvrtí
5. kvóta zůstává „≤ 8 dotazů", ne „8 spotřebováno"
6. cizí změny ve worktree do těchto commitů nesmí

---

# 2026-09-02: commity A a B, import bez berličky

- `c688395` — surová vrstva: 3 obálky + 3 sidecary, `nove_mesto.json`
  + `.meta.json`, `pl-raw.mjs`, `pl-window.mjs`, `pl-artifact.mjs`,
  `pl-import.mjs`, `src/test/pl-paths.test.ts`, dvě `docs/pricelabs-*`.
- `082281f` — sémantika tržeb v `calculator-model.md` a `basis` fail-safe
  v `supabase/functions/mcp/index.ts`.

Cizí soubory (`src/components/*`, `src/index.css`) ani smazané
`vite.config.ts.timestamp-*` **v žádném z nich nejsou**.

Default adresáře opraven: `artifactDir(pulled)` v `pl-window.mjs` jede
podle data pullu. Test `pl-paths.test.ts` hlídá, že zářijový pull s oknem
do `2026_07` skončí v `pricelabs-2026-09`. Artefakt se po té změně
přegeneroval na **totožný sha256** `5a45943ce88d79f6…`. Testy 83/83.

**Import proběhl BEZ `--allow-uncommitted` a prošel 20/20.** Invariant
„surový artefakt dřív než odvozený zápis" je tím doopravdy splněný,
ne odložený.

Pořád dry-run: `--emit-sql` nespuštěno, do databáze nic nešlo,
`MARKET_CTVRT` a ekonomika netknuté.

Drobnost: řádek přejímky říká „kvota (skutecna) 8 dotazu", ale je to
**horní odhad** — účtování selhaných dotazů neumíme pozorovat. Popisek
v `pl-import.mjs` by se měl přejmenovat, až se bude sahat na bránu.

---

# 2026-09-02: Krok 3A ZASTAVEN PŘI INSPEKCI. Nic se nezapsalo.

SQL vygenerováno (3 inserty do `str_market`, 1 do `pl_pull_log`, 2 updaty,
žádný `delete`/`drop`/`truncate`). **Neaplikováno** — inspekce našla dva
blokátory.

## Blokátor 1: v databázi UŽ JSOU řádky pro `praha1_nove_mesto`

Z 31. 8. 2026, se **stejným přirozeným klíčem** (`2025_08`/`2026_07`,
source `pricelabs`):

| band | n_min | annual_rev | n_mean | annual_adr | monthly | pull_state |
|---|---|---|---|---|---|---|
| 1BR | 1226 | 656 128 | null | null | ne | partial |
| all | 2766 | 858 813 | null | null | ne | partial |

Hodnoty 1BR **sedí na dnešní měření na jednotku** (1226 / 656 128).
Ten starý řádek je tedy tentýž trh, jen bez řady, bez `n_mean`
a bez `annual_*`.

Co by udělal `on conflict do update` proti triggeru
`str_market_no_history_rewrite`:

| pole | staré → nové | trigger |
|---|---|---|
| annual_rev | 656128 → 656128 | beze změny, projde |
| n_min | 1226 → 1226 | beze změny, projde |
| n_mean | null → 1288 | **výslovně povoleno** (null→hodnota) |
| monthly | null → řada | **výslovně povoleno** |
| annual_adr | null → 2627 | **VÝJIMKA — zastaví transakci** |
| annual_revpar | null → 1960 | **VÝJIMKA** |
| annual_occ | null → 73,6 | **VÝJIMKA** |

Trigger dělá přesně to, k čemu je. Ale je **nekonzistentní**: doplnění
`null → hodnota` výslovně povoluje u `n_mean` a `monthly`, u tří
`annual_*` polí ne, přestože jde o tutéž třídu doplnění starého řádku.

Cesty (rozhodnutí je na člověku, žádnou jsem nezvolil):

- **a)** `set local antam.allow_history_rewrite = 'on'` — dokumentovaný
  únik, ale vypne ochranu na celou transakci. Tady by kryl jen doplnění
  nullů, protože `annual_rev` ani `n_min` se nemění. Přesto velké kladivo.
- **b)** Migrace: rozšířit výjimku „null → hodnota" i na `annual_adr`,
  `annual_revpar`, `annual_occ`. Konzistentní s tím, co trigger už dělá,
  a řeší to i příště. Je to změna schématu.
- **c)** Staré řádky smazat a vložit znovu. Ničí historii, nedoporučuju.

## Blokátor 2: závěrečný `update` nemá filtr na pásmo

```sql
update str_market set pull_state = 'complete'
  where geo_id = ... and source = ... and months_from = ... and months_to = ...;
```

Chybí `and band = any(...)`. Přepnul by tím na `complete` i zbylý řádek
pásma **`all`**, který v tomhle artefaktu vůbec není a jehož poznámka
sama říká „2BR and 3BR stil[l missing]". Tvrdilo by to úplnost, která
není doložená.

Je to vada v `pl-import.mjs`, ne v datech.

## Kontext: řádek `all` není ojedinělý

`str_market` má 3 řádky pásma `all` a 28 řádků 1BR/2BR/3BR. Většina
starých řádků nemá `n_mean` ani `monthly` (10 z 11 u 1BR). Není to rozbité
— je to Step 0 před zavedením měsíční řady.

## Stav

**Do databáze nešlo nic.** `--emit-sql` jen vypsalo text.
`MARKET_CTVRT` a ekonomika netknuté.

---

# 2026-09-02: Krok 3A HOTOV — data v `str_market`

Migrace `20260902170000_str_market_backfill_nulls.sql` aplikována.
Trigger nově pouští `null → hodnota` u `n_mean`, `monthly`, `annual_adr`,
`annual_revpar`, `annual_occ`; přepis vyplněné hodnoty i změna
`annual_rev`/`n_min` zůstávají zakázané. Ověřeno čtyřmi případy
v transakci, která se sama vrátila zpět (testovací řádek nezůstal):

```
1) null->hodnota: PROSLO
2) prepis vyplnene annual_adr: ZASTAVENO spravne
3) zmena annual_rev: ZASTAVENO spravne
4) zmena n_min: ZASTAVENO spravne
```

`pl-import.mjs` má filtr na pásmo v závěrečném `pull_state = 'complete'`.
Kryto testem `pl-import-sql.test.ts`. Testy 86/86.

## Stav v databázi po importu

| band | pull_state | n_min | n_mean | occ | adr | revpar | annual_rev | monthly | pulled_at |
|---|---|---|---|---|---|---|---|---|---|
| 1BR | complete | 1226 | 1288 | 73,60 | 2627 | 1960 | 656 128 | 12 | **2026-08-31** |
| 2BR | complete | 608 | 619 | 74,50 | 4031 | 3046 | 1 016 716 | 12 | 2026-09-02 |
| 3BR | complete | 219 | 231 | 73,90 | 6503 | 4851 | 1 642 663 | 12 | 2026-09-02 |
| all | **partial** | 2766 | null | null | null | null | 858 813 | — | 2026-08-31 |

1BR byl **obohacen, ne přepsán**: `annual_rev` i `n_min` zůstaly, doplnily
se nully, a `pulled_at` si drží původní 31. 8. Řádek `all` zůstal partial
se všemi nully — filtr na pásmo zabral.

Opakované spuštění: **všechny čtyři řádky beze změny** (včetně `all`).

## Odvozená vstupní množina PŘED integrací

Ne z paměti, z běhu (`src/test/calc-population.test.ts`,
baseline `tools/calc-baseline-pred.json`):

```
STAVU lokalita×ctvrt: 13   KOMBINACI: 832
praha1/? praha1/stare_mesto praha1/-
praha2/? praha3/? praha4/? praha5/? praha6/? praha7/? praha8/? praha9/?
praha10/? jinde/?
```

Sedí to na dřívějších 832. Pravidlo je `needsCtvrt = ctvrtiOf(loc).length > 0`.
