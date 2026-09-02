# Přejímka čtvrti: FAIL-CLOSED checklist

Než smí čtvrť do veřejné NEBO interní kalkulačky, musí projít všech 18 bodů.
**Chybí-li nebo je-li nejednoznačný jediný, čtvrť se ODMÍTÁ.** Ne "zatím
provizorně", ne "doplní se". Špatná buňka se pozná až po měsících, protože
vypadá věrohodně.

Nikdy se TIŠE nenahrazuje: jiný polygon, jiný okres, jiná čtvrť, jiné období,
odvozené pásmo místo měřeného.

---

## Formulář (jeden na geometrii)

```
GEOMETRIE ........... <source_geometry_id>
DATUM PŘEJÍMKY ...... <YYYY-MM-DD>          PŘEJAL: <kdo>

 1  source_geometry_id ............ ______________________
 2  geo_context_id, které plní .... ______________________  (všechny!)
 3  PriceLabs label (schválený) ... "____________________"  schválil: ______
 4  Sreality katastr / část obce .. ______________________
 5  okno pullu .................... ______ .. ______        (pl-window.mjs)
 6  pásma úplná ................... 1BR ☐  2BR ☐  3BR ☐     chybí: ______
 7  měsíční řada uložená .......... 12/12 ☐ díry: ______
 8  n_mean / n_min z řady ......... 1BR __/__  2BR __/__  3BR __/__
 9  reliable z n_min .............. 1BR ☐  2BR ☐  3BR ☐     (práh 50)
10  artefakt + sha256 ............. ______________________
11  raw → unique → usable ......... __ → __ → __
12  duplicitní přirozený klíč ..... žádný ☐    překryv hlášen: ______
13  opakovaný běh idempotentní .... ☐ (digest řádku beze změny)
14  konflikt zastaví .............. ☐ (ověřeno, nebo doloženo triggerem)
15  LTR: n a shrinkage/fallback ... kontext ______ n=__ efekt/fallback: ____
16  STR i LTR týž model kontext ... ☐    LTR fallback na okres? ANO / NE
17  partial / reconstructed ....... pull_state: ______  rekonstruované: ____
18  pásmo MĚŘENÉ nebo ODVOZENÉ .... 1BR ____  2BR ____  3BR ____

VÝSLEDEK:   PŘIJATO ☐        ODMÍTNUTO ☐   důvod: ______________________
```

---

## Co hlídá stroj a co člověk

| # | kontrola | kdo to vynutí | kde |
|---|---|---|---|
| 1 | `source_geometry_id` | **importér** | `pl-import.mjs` vyžaduje `--source-geometry`, u čtvrti ho ověří proti `GEO` |
| 2 | všechny `geo_context_id` | **částečně** | importér vypíše sourozence sdílené geometrie; že se naplní VŠECHNY, nehlídá nic |
| 3 | schválený PriceLabs label | **ČLOVĚK** | MCP zakazuje vybrat polygon za uživatele; `pl_manifest.geometry_label` |
| 4 | Sreality katastr | **ČLOVĚK** | nic nespojuje polygon dodavatele s katastrem; slug je konvence, ne důkaz |
| 5 | okno pullu | **stroj** | `pl-window.mjs`, `pl-artifact.mjs` odmítne neshodu, test váže pravidlo na artefakty v repu |
| 6 | úplná pásma | **stroj** | `pl-artifact.mjs` zastaví; `pull_state` jde na `complete` jen po všech |
| 7 | měsíční řada | **stroj, DATABÁZE** | `str_market_series_required` |
| 8 | `n_mean` / `n_min` z řady | **stroj** | `pl-derive.mjs`, test to přepočítává; ověřitelné i v SQL z `monthly` |
| 9 | `reliable` z `n_min` | **stroj, DATABÁZE** | trigger `str_market_set_reliable` + check |
| 10 | artefakt + sha256 | **stroj** | `pl-artifact.mjs` píše `.meta.json`; importér odmítne artefakt mimo `data/` nebo mimo git |
| 11 | raw → unique → usable | **stroj** | `pl-import.mjs` to vypíše před zápisem |
| 12 | duplicitní klíč | **stroj / částečně** | PK hlídá přesný klíč; dvojí započtení přes překrývající se polygony je jen DIAGNOSTIKA |
| 13 | idempotence | **stroj** | shodný rerun nechá řádek beze změny (ověřeno v Step 0) |
| 14 | konflikt zastaví | **stroj, DATABÁZE** | `str_market_no_history_rewrite` |
| 15 | LTR n + fallback | **stroj** | typ `GeoLtr` vynutí `{effect,n}` nebo `{fallback,reason}`; test hlídá důvod |
| 16 | STR a LTR týž kontext | **částečně** | importér ověří kontext proti `GEO`; že LTR není fallback, NEHLÍDÁ nic |
| 17 | partial / reconstructed | **částečně** | `pull_state` je vynucený; `RECONSTRUCTED_CELLS` se udržuje ručně |
| 18 | měřené vs odvozené pásmo | **NIKDO — MEZERA** | viz níž |

Součet: **10 vynucených strojem** (z toho 4 přímo databází), **4 částečné**,
**4 na člověku**.

---

## Mezera, kterou je potřeba zavřít PŘED prvním čtvrťovým pullem

```ts
export type MarketCell = { adr; revpar; nMean; nMin; derived: boolean };  // OKRES
export type CtvrtCell  = { adr; revpar; nMean; nMin };                    // ČTVRŤ
```

Okresní buňka umí říct, že je dopočítaná. **Čtvrťová ne.** Do `MARKET_CTVRT`
tedy dnes jde zapsat pásmo vzniklé rozpadem jednoho součtu celopražským
poměrem (0,779 / 1,221 / 1,891) a nic ho neodliší od pásma, které PriceLabs
opravdu změřil. Přesně to obsahuje soubor z 1. 9. 2026: čtvrťové součty jsou
měřené, ale jejich 1BR/2BR/3BR měřené NEJSOU.

Bod 18 je tím pádem dnes nevynutitelný jinak než čestným slovem, což je
u fail-closed přejímky málo.

Návrh (ekonomiku nemění, jen přidá popisek — **čeká na schválení**):

```ts
export type CtvrtCell = {
  adr; revpar; nMean; nMin;
  /** "measured" = pásmo pullnuté přímo pro tuhle geometrii
   *  "split:<zdroj>" = rozpad součtu poměrem, NENÍ to měření */
  basis: "measured" | `split:${string}`;
};
```

Plus test: buňka s `basis` jiným než `measured` se nesmí dostat do veřejného
výsledku bez toho, že je označená jako odvozená.

Dokud tenhle sloupec není, platí tvrdší pravidlo: **do `MARKET_CTVRT` smí jen
pásma pullnutá přímo.** Rozpady zůstávají v analýze, ne v modelu.

---

# Body 19 a 20 — surová provenience (přidáno 2. 9. 2026)

## Proč přibyly

Do 2. 9. 2026 přejímka dokazovala tohle: *artefakt je dobře tvarovaný
a tvrdí správnou provenienci.* Nedokazovala tohle: *ta čísla opravdu přišla
z toho PriceLabs pullu.*

Rozdíl není teoretický. V `_to_delete/gate-test/pricelabs-2026-07/` ležely
soubory `nove_mesto.json` a `stare_mesto.json`, které byly **doslovné kopie
`praha3.json` a `praha1.json`** s podvrženým labelem geometrie, `pulled`
dnešního data a `bands_basis: measured`. Prošly by body 1–18 bez jediného
zaškobrtnutí: pásma jsou, dvanáct měsíců bez děr, okno sedí, basis je
measured, řetězec geometrie je přesně ten schválený.

Bod 18 (`původ pásem`) byl vynutitelný jen čestným slovem toho, kdo psal
`--basis`. Body 19 a 20 to mění.

## 19. Surová odpověď — TVRDÝ STOP u čtvrtí

`pl-raw.mjs` zachytí odpověď PriceLabs **před** jakoukoli transformací:
verbatim odpověď, položená otázka a její haš, pásmo, požadované okno,
`session_id`, `geometry_token`, vrácený label a source geometrie, kurzy
po měsících a řady v USD vytažené z odpovědi. Envelope se zahašuje.

`pl-artifact.mjs` pak `--basis measured` bez `--raw` **odmítne** a u každého
pásma ověří tři věci:

1. **Obsažitelnost** — každé tvrzené USD číslo se musí v surové odpovědi
   doslova vyskytovat. Vymyšlená nebo zkopírovaná řada tímhle neprojde.
2. **Nepřepočítávaná pole** (`occ`, `active_listings`) musí sedět přesně.
3. **Kurz** — `artefakt = round2(usd × kurz měsíce)`. Chytá i tiše špatnou
   tabulku kurzů, což je chyba, kterou by jinak nikdo nenašel.

`pl-import.mjs` to celé ověřuje **znovu** při importu: soubor existuje, jeho
haš sedí na to, co si artefakt zapsal, a artefakt se z něj pořád reprodukuje.

Ověřeno na deseti případech: chybějící `--raw`, nesedící geometrie, **jedno
změněné číslo o setinu**, surová odpověď změněná až po vzniku artefaktu,
čtvrťový artefakt bez `raw_provenance` — všechno tvrdý STOP.

**Co to NEdokazuje:** že PriceLabs mluví pravdu. Dokazuje, že náš artefakt
odpovídá tomu, co PriceLabs vrátil. To je celý rozsah tvrzení.

## 20. Shodný payload pod jinou geometrií — SEKUNDÁRNÍ pojistka

Haš řady pásma proti všem ostatním artefaktům v `data/`. Shoda pod **jinou**
geometrií zastaví import; vědomé povolení chce `--allow-duplicate-payload
"<důvod>"` a důvod se vytiskne do přejímky.

**Tohle není důkaz původu a nesmí se tak číst.** Chytne doslovnou kopii —
tedy přesně tu kontaminaci, která se stala. Kopie s jedním změněným číslem
projde. Proto stojí *za* bodem 19, ne místo něj.

## Co body 19 a 20 NEJSOU

Nejsou to statistické prahy. Předregistrované okresní poměry
(`2BR/1BR` 1,335–1,606, `3BR/1BR` 1,431–2,706) zůstávají **diagnostickým
spouštěčem vyšetřování**, ne kritériem přijetí. Naměřené 2BR na 1,65× 1BR
neznamená, že se PriceLabs mýlí — znamená, že se před přijetím prověří
geometrie, filtr, velikost vzorku a surová odpověď.

## Vynutitelnost po změně

| | dřív | teď |
|---|---|---|
| mechanicky vynuceno | 10 | **12** |
| částečně | 4 | 4 |
| jen lidsky | 4 | **2** |

Body 3 (schválení geometrie) a kvóta zůstávají lidské. Bod 18 (`původ pásem`)
přestal být čestné slovo — opírá se o bod 19.

---

# Bod 21 — vyprávěná část odpovědi NENÍ zdroj (2. 9. 2026)

`market_research` vrací dvě věci: strukturované `data[]` a vyprávěné shrnutí.
**Shrnutí prokazatelně lže.** Tři případy z jediného dne:

| co próza tvrdila | jak to bylo |
|---|---|
| Praha 2 3BR: „136 active listings on average" | průměr je **127** (136 je červenec) |
| Nové Město: „July 2025 to August 2026" | data byla `2025_08 … 2026_07` |
| kruh 15 km: „New Town (Nove Mesto), Prague" | `selected_geometry_label` = **Prague Main Station circle (15 km)** |

Pokaždé bylo `data[]` správně. Próza je dekorace, ne datový zdroj.

## Jak se to vynucuje

Rady se **nepřebírají, nýbrž čtou**. `pl-raw.mjs` má
`extractFromResponse()`, která bere hodnoty výhradně z `verbatim.data[]`
podle pevné mapy polí a ověří, že měsíce v záznamech přesně odpovídají oknu.

- Odpověď bez `data[]` → STOP („próza se jako zdroj nepoužívá").
- Počet záznamů ≠ 12, nesedící měsíce, nečíselné pole → STOP.
- Ručně dodaný seznam čísel se smí předat jen jako **kontrola** a musí
  sedět do posledního čísla; jinak STOP s uvedením obou hodnot.

Ten poslední bod zavírá skutečnou díru: dřív seznam čísel do envelope psal
člověk, a to je přesně místo, kudy by věta z prózy prolezla do artefaktu.

## Poznámka k hašům

`raw_sha256` a soubor `.sha256` nesou haš **kanonické** podoby envelope
(klíče seřazené), ne bajtů souboru. `sha256sum` na tom souboru proto vrátí
jiné číslo. Není to poškození; importer ověřuje kanonický haš.
