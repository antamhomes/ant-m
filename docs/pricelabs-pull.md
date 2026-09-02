# Jak se pullují čtvrti z PriceLabs

Runbook. Kdo tohle nedodrží, nerozbije nic hlasitě — vyrobí buňku, která
vypadá správně a není. Proto je většina pravidel vynucená v databázi
(migrace Step 0, viz `docs/calculator-model.md` §4b), ne jen napsaná tady.

Stav k 2. 9. 2026.

---

## 1. Proč to existuje

Tři chyby, které se UŽ staly, a které tenhle postup vylučuje:

1. **Staré Město: měsíční řada se neuložila.** Buňka je proto v
   `RECONSTRUCTED_CELLS` — nejde z ní spočítat `nMin`, nejde ověřit `adr`
   a bránou spolehlivosti neprojde. Data jsou v modelu, ale ověřit se nedají.
2. **Nové Město: pull skončil ve stavu `geometry_selected`** a nikdy se
   nedokončil. Poznalo se to jen tím, že v `str_market` chybí řádky.
   Přesně ten tichý stav, který nechceme.
3. **Deset čtvrtí, 1. 9. 2026: jiné okno než zbytek repa.** Čtvrti jely na
   `2025_09..2026_07`, devět okresů na `2025_08..2026_07`. Indexy tím pádem
   nejsou mezi sebou porovnatelné a na první pohled to není vidět. Navíc se
   „roční" čísla dopočítala ×12/11, což v souboru nikde nestálo.

---

## 2. Jediný krok, který NEJDE automatizovat: geometrie

PriceLabs vrátí několik kandidátských polygonů a MCP pravidla zakazují
vybrat za uživatele. Má to důvod: **špatný polygon nevrátí chybu, vrátí
věrohodná čísla o jiném místě.** Step 0 to nechytí, protože ta data jsou
sama v sobě konzistentní.

Proto:

- Geometrii schvaluje ČLOVĚK, jednou za čtvrť. Zapíše se do `pl_manifest`
  (`geometry_label`, `approved_by`, `approved_at`).
- Automatický běh smí sáhnout jen na čtvrť, která **už schválenou
  `geometry_label` má**.
- Label musí sedět s vrácenou volbou **PŘESNĚ, znak po znaku.** Žádné
  fuzzy párování, žádná „nejbližší volba". Nesedí → stop, zapiš
  `last_error`, jdi dál. Nikdy nehádej.

Dnes schválené: `stare_mesto` („Old Town official boundary (openstreetmap)"),
`nove_mesto` („New Town official boundary (openstreetmap)").
Všechno ostatní v `pl_manifest` je `pending` a čeká na člověka.

---

## 3. Fronta je `pl_manifest`, ne paměť session

Stav běhu žije v databázi, takže běh může kdokoli převzít uprostřed:
`status` (`pending` → `geometry_selected` → `pulled` / `failed` / `skipped`),
`batch`, `priority`, `parent_districts`, `attempts`, `last_error`.

Pozor: `attempts` je nespolehlivý. Nové Město má `attempts: 1` po nedokončeném
pokusu, kdežto dokončené Staré Město má `attempts: 0`. Neplánuj podle něj,
plánuj podle `pl_pull_log`.

---

## 4. Kvóta: měř, neodhaduj

**20 dotazů `market_research` na 24 h, okno se otevírá PRVNÍM dotazem**, ne
o půlnoci. Změřeno 1. 9. 2026: deset čtvrtí jako jeden agregát spotřebovalo
celých 20, tedy **cca 2 dotazy na geometrii za jeden agregát**. Pásma jsou
násobek toho, takže realisticky **tři čtvrti na okno, ne deset.**

Před každou čtvrtí spočítej zbytek:

```sql
select coalesce(sum(requests_used), 0) as spotrebovano_v_okne,
       min(started_at)                 as okno_zacalo
from pl_pull_log
where started_at > now() - interval '24 hours';
```

Nezbývá-li na CELOU čtvrť (všechna pásma), **nezačínej ji.** Půlka čtvrti
je `partial` řádek, který se musí dotahovat příště.

Po každé čtvrti zapiš SKUTEČNOU spotřebu do `pl_pull_log.requests_used`.
Nikdy ji nedopočítávej dopředu.

---

## 5. Okno: kalendář, ne úsudek

`scripts/pl-window.mjs` — **posledních 12 uzavřených kalendářních měsíců**,
měsíc se počítá za uzavřený až 10 dní po svém konci (rezervace dobíhají).

Žádné „vypadá slabě proti loňsku". To je úsudek a pokaždé dopadne jinak.
Pravidlo dnes vrací `2025_08..2026_07`, tedy přesně okno, na kterém stojí
všech devět okresních artefaktů v repu. Test to hlídá
(`src/test/import.test.ts`).

Okno je součástí přirozeného klíče (`months_from`, `months_to`), takže nový
pull jiného okna **přidá řádek**, nepřepíše starý. Historie se hromadí.

---

## 6. Postup na jednu čtvrť

1. **Zkontroluj kvótu** (§4). Nestačí-li na všechna pásma, skonči.
2. **Spočítej okno** — `node scripts/pl-window.mjs`.
3. **Otevři pull v logu**: řádek v `pl_pull_log` se `slug`, `source_geometry`,
   `outcome = 'started'`.
4. **Pullni každé pásmo zvlášť** (`1BR`, `2BR`, `3BR`) na schválené
   geometrii. Vždycky si vyžádej MĚSÍČNÍ řadu: `occ`, `adr`, `revpar`,
   `active_listings`, `avg_revenue`. Bez řady se řádek nezapíše (§8).
5. **Ulož syrové odpovědi** do jednoho souboru a proženo validátorem:
   ```
   node scripts/pl-artifact.mjs --in /tmp/<slug>.raw.json \
     --slug <slug> --geometry "<schválený label>" --bands 1BR,2BR,3BR
   ```
   Chybí-li pásmo, je-li řada kratší nebo má-li díru, **nic se nezapíše.**
6. **Commitni surový artefakt** (`data/pricelabs-<YYYY-MM>/<slug>.json`
   + `.meta.json` se sha256). Surové PŘED odvozeným — importér to vynucuje
   a odmítne artefakt, který není v gitu.
7. **Naimportuj**:
   ```
   node scripts/pl-import.mjs --artifact <cesta> --geo <okres>_<slug> \
     --level ctvrt --source-geometry <slug> --slug <slug> \
     --parents <okres> --bands 1BR,2BR,3BR --requests <skutečná spotřeba> --emit-sql
   ```
   Importér ověří kontext proti registru `GEO` v `yield.ts` a řekne,
   jestli je geometrie sdílená (Nové Město = Praha 1 i 2, Vinohrady = 2/3/10).
   **Sdílená geometrie se pullne JEDNOU** a naplní víc kontextů.
8. **Zavři log**: `requests_used`, `outcome`, `finished_at`.

---

## 7. Pásma, ne jeden součet

Čtvrť se pullne **po pásmech**, ne jako jeden agregát přes všechny dispozice.
`MARKET_CTVRT` je klíčovaná pásmem a slot pro „všechny dispozice" nemá.

Agregát rozpadlý celopražským poměrem (0,779 / 1,221 / 1,891) předpokládá,
že příplatek za ložnici je v Libni stejný jako na Malé Straně. To je
domněnka, ne měření, a v modelu by každá taková buňka byla `derived`
s ×1,6 rozšířeným rozpětím. Staré Město dokazuje, že po pásmech to vrátit jde
(533 / 297 / 110 nabídek).

---

## 7b. 4BR: nejdřív sonda, teprve pak čtvrti

4+kk je dnes v modelu useknuté na 3BR (`BAND_BLEND["4kk"] = { base: "3BR" }`)
a `docs/calculator-model.md` §4 to vede jako otevřené. Pásmo 4BR by to zavřelo.

**Pipeline je na 4BR připravená** (`pl-derive.mjs`, validátor i importér ho
proženou). Model a databáze NE, a obojí je vědomé rozhodnutí, ne opomenutí:

| co | dnes | co by 4BR chtělo |
|---|---|---|
| `Band` v `yield.ts` | `"1BR" \| "2BR" \| "3BR"` | přidat `"4BR"` |
| `BAND_BLEND["4kk"]` | `{ base: "3BR" }` | překlopení 3BR→4BR s `lo`/`hi` |
| `SIZE_RATIO` | 2BR/1BR, 3BR/2BR, 3BR/1BR | + 4BR/3BR (a 4BR/2BR pro jeden krok) |
| check v `str_market` | `band in ('1BR','2BR','3BR','all')` | migrace, přidat `'4BR'` |
| kbelíky 4+kk | `SIZE_BUCKETS_BY_VERSION` bez překlopení | nová verze konfigurace |

To je pět zásahů do zmrazené ekonomiky. Nedělají se proto, že se pullnula data.

**A hlavně: pullovat 4BR po čtvrtích je skoro jistě vyhozená kvóta.** Podívej
se na 3BR na úrovni OKRESU, kde je vzorek největší: prahem `nMin >= 50`
projdou jen Praha 1 (308), Praha 2 (120) a Praha 5 (65). Praha 3 má 42,
Praha 8 41, Praha 7 21, Praha 6 9, Praha 9 6, Praha 4 4. 4BR je zlomek
z toho. Na čtvrti to bude skoro všude pod deseti nabídkami a brána to zahodí.

Proto pořadí:

1. **Jedna sonda: Praha celá, pásmo 4BR.** Jedna geometrie, ~2 dotazy.
   Když ani celopražsky nemá 4BR použitelný vzorek, čtvrti nemají smysl
   a víme to za dva dotazy.
2. Když projde: **okresy, kde 3BR prošlo** (P1, P2, P5). Odtud vyjde poměr
   `4BR/3BR`, který je potřeba pro `SIZE_RATIO`.
3. Teprve potom čtvrti, a jen tam, kde vyjde vzorek.

Než sonda proběhne, čtvrťové pully jedou na `--bands 1BR,2BR,3BR`.
4BR se do nich nepřidává „když už tam jsme": zdražilo by to každou čtvrť
o třetinu za data, která brána nejspíš zahodí.

---

## 8. Co databáze odmítne sama

Tohle nejde obejít ani omylem, ani ze session bez kontextu:

| pravidlo | co se stane |
|---|---|
| tentýž klíč, jiná čísla | `str_market_no_history_rewrite` zastaví a vyjmenuje, co se mění |
| řádek importní cestou bez `monthly` | `str_market_series_required` odmítne |
| `reliable` poslané volajícím | trigger ho přepočítá z `n_min` (práh 50, HEURISTIC) |
| `pull_state` mimo partial/complete | check odmítne |
| nedokončený pull | `pull_state` zůstane `partial`, model takový řádek nesmí použít |

Vědomý přepis historie: `set local antam.allow_history_rewrite = 'on'`.
Jinak nikdy.

---

## 9. Kontrola překryvu je DIAGNOSTIKA

Součet čtvrtí smí okres přerůst: geometrie se překrývají, zasahují víc
okresů a PriceLabs vrací agregát bez listing ID. Hlásí se to jako varování,
**není to invariant** a pull se kvůli tomu nezastavuje.

---

## 10. Co se NEDĚLÁ

- Nevybírej geometrii sám. Nikdy.
- Neodhaduj spotřebu kvóty dopředu; změř ji po pullu.
- Nezapisuj buňku bez měsíční řady, ani „zatím, doplní se".
- Nemíchej okna mezi čtvrtěmi.
- Nedopočítávej „roční" číslo z neúplného okna bez toho, že to je napsané.
- Nepřepisuj `RELIABLE_MIN_N` ani nezaváděj druhý práh (30 ≠ 50).
- Nesahej na vlastní listingy majitele. Trh ano, portfolio ne.

---

## 11. Pořadí

Nejdřív čtvrti, kde Antam **provozuje** — Nové Město, Žižkov, Smíchov.
Ne proto, že jsou komerčně nejzajímavější, ale protože jen tam jde rozpad
po pásmech zkontrolovat proti něčemu.

Všechny tři už mají čtvrťový nájem v `GEO` (`praha1/nove_mesto`,
`praha3/zizkov`, `praha5/smichov`), takže po STR pullu budou obě strany
porovnání na téže geografii.

**Přednost před vším ostatním má ale re-scrape Sreality s čtvrtí.** Staré
Město má dnes čtvrťové STR proti okresnímu nájmu, takže násobek se nafukuje
jen tím, že je jedna strana ostřejší. Každá další čtvrť na STR straně to
zhoršuje. Scrape nestojí žádnou kvótu.
