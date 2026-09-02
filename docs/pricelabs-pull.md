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
o půlnoci.

**„Cca 2 dotazy na geometrii" je POZOROVÁNÍ Z JEDNOHO BĚHU, ne plánovací
konstanta.** 1. 9. 2026 spotřebovalo deset čtvrtí jako jeden agregát celých 20,
z čehož ta dvojka vychází zpětně. Nikdy se to neověřilo na druhém běhu,
neví se, jestli cena závisí na velikosti polygonu nebo na počtu pásem, a
chování kvóty už jednou bylo divné: dva dotazy skončily prázdnou chybou
`{"success":false,"error":""}` a teprve třetí vrátil poctivé
`ERR-MCP-RATE-LIMITED`. Ty prázdné se možná započítaly, možná ne.

**Provozní pravidlo tedy není „vyděl dvacet dvěma".** Je to:
zapiš skutečnou spotřebu po KAŽDÉ dokončené geometrii, před další geometrií
zbytek přepočítej, a zastav se, dokud rezerva ještě je. Odhad slouží jen
k tomu, aby se běh vůbec rozvrhl; rozhoduje naměřené číslo.

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

**Nájemní strana na nic nečeká a nový scrape se NEDĚLÁ.** Čtvrťový nájem je
hotový od 31. 8. 2026: katastr je v `ltr-source.csv` (3 350 z 3 429 inzerátů),
`CTVRT_RENT` a registr `GEO` z něj stojí a pokrývají 33 čtvrťových kontextů.
Kdyby se někde znovu objevilo „nejdřív re-scrape Sreality", je to relikt
z 30. 8., viz `docs/calculator-model.md` §4.

Tenčí strana je dnes STR: 33 čtvrtí má nájem, ale čtvrťové STR má jedna
(Staré Město, rekonstruované) a jedna je nedokončená (Nové Město). Proto
tenhle runbook existuje.

Zbývá jedna úzká výjimka: **Staré Město** má 11 nájemních inzerátů, pod prahem
12, takže do `GEO` nespadlo — čtvrťové STR proti okresnímu nájmu, násobek
nahoře. Scrape to nespraví, tam se dlouhodobě pronajímá málo. Řeší se to
rozhodnutím o té jedné čtvrti, ne dalším sběrem dat.

---

## 12. Krok 0: zachyť surovou odpověď (od 2. 9. 2026 povinné)

**Než se s odpovědí cokoli udělá**, uloží se tak, jak přišla. Zpětně to
nejde: `market_research` stejný dotaz podruhé nevrátí identicky a kvóta je 20
dotazů na 24 h.

```
node scripts/pl-raw.mjs --band 2BR --slug nove_mesto \
  --question "<položená otázka DOSLOVA>" \
  --response /tmp/resp.json --fx /tmp/fx.json \
  --geometry-label "New Town official boundary" \
  --geometry-source openstreetmap \
  --session-id <...> --geometry-token <...>
```

`--fx` nese kurzy po měsících **a** `extracted.usd` — řady vytažené
z odpovědi před převodem. Artefakt se pak musí z těch dvou věcí reprodukovat
na setinu, jinak `pl-artifact.mjs` skončí STOPem.

`geometry_token` se ukládá vždycky, i když se zrovna nezdá potřeba. Vyšlo to
z toho, že u Nového Města chyběl a obnovení pullu kvůli tomu možná musí projít
novým kolem výběru geometrie. Provenience navíc nic nestojí.

### Pořadí u jedné čtvrti

```
market_research  ->  pl-raw.mjs  ->  pl-artifact.mjs --raw BAND=...  ->  pl-import.mjs
   (kvóta)          (haš)            (rekonciliace)                     (rekonciliace znovu)
```

Bez prostředního kroku nemá `measured` co doložit a produkční import neprojde.

## 13. Reprodukovatelnost okresních dat — ověřeno 2. 9. 2026

Při diagnostice 3BR Prahy 2 vyšlo srovnání s commitnutým `praha2.json`
(pull 30. 8. 2026, totéž okno). Shoda **12/12 u všech pěti řad** —
occ, adr, revpar, active_listings, avg_revenue. Šedesát hodnot, tři dny
odstup, bez jediného rozdílu.

Neříká to nic o zbylých osmi okresech, ale jeden nahodile užitečný re-pull,
který sedne na doraz, je slušná kontrola potrubí: `pullWindow()` drží
a strukturovaná data PriceLabs jsou v čase stabilní.

Okresní artefakty pořád nemají surovou provenienci (vznikly před záchytem).
Tohle jim ji nenahrazuje — jen ukazuje, že jejich čísla živý PriceLabs
potvrzuje.

---

## 14. Pin geometrie drží SESSION, ne token (SOP)

Nejkřehčí místo celého postupu. Auto-výběr geometrie **není
deterministický**: 2. 9. 2026 se táž otázka na Nové Město trefila ráno na
`New Town official boundary (openstreetmap)` a odpoledne na
`Prague Main Station circle (15 km)` — kruh přes celou metropoli, vrácený
bez chyby a s `market_label` hlásícím „New Town (Nove Mesto), Prague".
Popisek trhu lhal, pole `selected_geometry_label` ne.

Kolo výběru geometrie **si nejde vyžádat** — backend ho nabídne, jen když
sám vyhodnotí místo jako nejednoznačné. `geometry_token` se tedy cíleně
získat nedá. Zbývá session.

### Postup

1. **První platné pásmo zakládá pin.** Jakmile odpověď vrátí přesně
   schválený `selected_geometry_label` + `selected_geometry_source`,
   **ulož `session_id`**. To je jediné, čím se na tentýž polygon vrátíš.
2. **Další pásma tahej ve stejné session** a geografii **znovu nepopisuj** —
   odkaž se na „the exact same geography already selected in this session".
3. **Každé pásmo se kontroluje samo.** Shoda `selected_geometry_label`
   i `selected_geometry_source` znak po znaku, u každé odpovědi zvlášť.
   Nestačí, že první pásmo sedělo.
4. **Neshoda = zamítnout a zastavit.** Žádné druhé znění dotazu, žádné
   „asi to bylo tím, jak jsem se zeptal". Data ulož zvlášť jako zamítnutá.
5. **Když session vypadne**, pin je pryč a začíná se od bodu 1 — včetně
   rizika, že auto-výběr sáhne jinam.

### Co tím SOP nekryje

Že se pin nedá ověřit dopředu. Ověřuje se až tím, co odpověď vrátí, takže
tuhle práci odvádí brána, ne důvěra v session. A protože prázdné obálky
(`{"success":false,"error":""}`) chodí nahodile — 3BR Nového Města prošlo
až na čtvrtý pokus, beze změny čehokoli — počítej s tím, že pásmo může
selhat i s živou session. Selhání ≠ chybějící data.

## 15. Sdílená geometrie: dva kontexty, jeden zápis

Když geometrii sdílí víc kontextů (Nové Město P1+P2, Vinohrady P2+P3),
`pl-import.mjs` se pouští **zvlášť pro každý** `--geo`, protože každý má
vlastní LTR kontext, který se musí vypsat do přejímky.

U Vinohrad z toho vznikly dva skripty lišící se **jen v `geo_id`**
(ověřeno diffem: `sed s/praha2_vinohrady/GEO/` proti
`sed s/praha3_vinohrady/GEO/` nedal žádný rozdíl). Aplikovaly se jako
**jedna transakce** přes `unnest(array[...]) as g`, aby dvojice řádků
byla atomická — buď oba kontexty, nebo žádný.

**Není to bajt v bajt výstup `--emit-sql`.** Je to legitimní jen s tímhle
postupem: nejdřív vygenerovat oba skripty, diffem doložit, že se liší
pouze v `geo_id`, teprve pak sloučit. Bez toho diffu se skripty pouštějí
jednotlivě.

## 16. Kvóta: poprvé změřená, ne odhadnutá (2. 9. 2026)

Runbook od začátku říká „měř, neodhaduj", jenže odpovědi PriceLabs žádný
counter nevracely a spotřeba byla nepozorovatelná. Při vyčerpání limitu
ale přijde **explicitní 429**, a ten je zdrojem pravdy:

```
status_code: 429   ERR-MCP-RATE-LIMITED
"You have used all 20 Market Research requests on this account.
 The 20 are counted over a 24 hour window that starts at your first
 request, so all of them become available again in 21 hours and 43 minutes."
```

Co z toho plyne:

1. **Okno je ukotvené k prvnímu dotazu**, ne klouzavé po jednotlivých
   voláních. Runbook to předpokládal správně.
2. **Zpráva vrací zbývající čas**, takže obnovení jde spočítat přesně.
   Ten 429 stojí za zaznamenání do `pl_pull_log` — je to jediná tvrdá
   telemetrie, kterou od PriceLabs dostaneme.
3. **Selhaná volání se zjevně počítají.** 2. 9. 2026 se v této session
   napočítalo 14 volání (11 úspěšných, 3 prázdné obálky / `data:null`),
   a přesto limit hlásil 20 vyčerpaných — zbytek padl na dřívější dotazy
   téhož dne. Prázdná obálka tedy **není zadarmo**, což mění plánování:
   opakování selhaného pásma stojí stejně jako nový pull.
4. **Praktický důsledek pro plán:** tři pásma na čtvrť + rezerva na
   selhání znamená realisticky **4–6 dotazů na čtvrť**, tedy nanejvýš
   tři až čtyři čtvrti za den, ne šest.

Odhad „~2 dotazy na geometrii" z prvních zápisků je tímhle vyvrácený.

## 17. Dávkování: počítej POKUSY, ne úspěchy

Z §16 plyne rozpočet: **20 dotazů na den**, okno ukotvené k prvnímu,
a selhaná volání se počítají.

Pravidla plánování:

1. **Eviduje se `pokusů`, ne `stažených pásem.`** Po každém pokusu
   o pásmo se zbývající denní rozpočet sníží o 1, ať odpověď přišla
   jakkoli — úspěch, prázdná obálka, `data:null`, špatná geometrie, 429.
2. **Novou čtvrť nezačínej, dokud nezbývají aspoň 4 dotazy** (tři pásma
   + jeden retry). Reálný náklad je 4–6 na čtvrť.
3. **Radši skonči s rezervou, než vsázet na „ještě jedno pásmo".**

Důvod je konkrétní, ne teoretický. 2. 9. 2026 zůstalo Nové Město několik
hodin na 2/3 pásem, protože 3BR opakovaně padalo; teprve čtvrtý pokus
prošel. Kdyby v ten moment došla kvóta, čtvrť zůstane nepoužitelná do
druhého dne — brána ji do produkce nepustí a dopočítat se nesmí.

**Pět rozdělaných čtvrtí je horší než dvě hotové.** Neúplná čtvrť nemá
žádnou hodnotu: `pl-import.mjs` ji odmítne, `MARKET_CTVRT` ji nedostane
a majitel pořád vidí okresní číslo.

### Pořadí fronty (stav 2. 9. 2026)

| # | čtvrť | kontexty | proč |
|---|---|---|---|
| 1 | Žižkov | praha3 | předregistrace zmrazená, první test heterogenity uvnitř jednoho obvodu |
| 2 | Smíchov | praha5 | nejlepší vzorek LTR (n=101) i STR, všechna pásma s nenulovou vahou |
| 3 | Karlín | praha8 | největší efekt nájmu (+11,4 %), ale nejtenčí STR — 3BR skoro jistě váha 0 |
