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
