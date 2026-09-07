# Předregistrace: Vršovice (vázaná na integraci Prahy 10)

Zapsáno **2026-09-06 12:55 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Všechno níž je **diagnostický spouštěč, ne kritérium
přijetí.** Naměřená pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Vršovice — a proč jsou jiné než všechny čtvrti dosud

Vršovice jsou STR jádro Prahy 10 a jediná čtvrť, která odemyká něco
rozdělaného: Praha 10 je od 4. 9. pullnutá (`data/pricelabs-2026-09/
praha10.json`, DB řádky `praha10` okres), ale **není v modelu** —
`MARKET_STR.praha10` ani `SEASONS_BY_LOC.praha10` neexistují, P10 je
v kalkulačce „posoudíme individuálně". GEO registr má `praha10/vrsovice`
(LTR +2,82 %, n=40), jediný kontext → `parents: ["praha10"]`.

**Rozdíl proti Libni/Nuslím/Holešovicím:** rodič ještě není měřená
lokalita. `localCell` bez okresní buňky nemá do čeho blendovat a
`ownerMonthly` bez `SEASONS_BY_LOC.praha10` pro sezónu ≠ rok spadne.
Vršovice tedy jdou pullnout a uložit nezávisle, ale **v kalkulačce se
smysluplně neukážou, dokud není integrovaná Praha 10 sama.**

## VAZBA (rozhodnutí člověka 5. 9. 2026 večer, závazné)

1. **Pull Vršovic je do dokončení integrace okresu Praha 10 JEN sběr
   dat.** Raw → artefakt → commit → DB import (`praha10_vrsovice`, ctvrt,
   parents praha10) proběhnou normálně; DB import na modelu nezávisí.
2. **`MARKET_CTVRT.vrsovice` se NEPŘIDÁVÁ do veřejného modelu jako
   samostatný krok.** Žádný commit „Vršovice do modelu" bez Prahy 10.
3. Po zachycení a přejímce měřených Vršovic 1BR/2BR/3BR se integruje
   **Praha 10 okres + `SEASONS_BY_LOC.praha10` + Vršovice v JEDNÉ
   modelové/regresní dávce** (jedna baseline před, jedna po).
4. **Tenké přímé P10 3BR (n ≈ 13, occ 28,7 %, RevPAR 1 633 proti
   odvozeným 3 023) zůstává SAMOSTATNÉ VÝSLOVNÉ ROZHODNUTÍ člověka.**
   Integrace Vršovic ho nesmí vyřešit tiše. Výchozí stav podle
   zmrazených pravidel: P10 3BR do `MARKET_STR` nejde (nMin 11 < 50),
   `marketCell` ho odvodí z 2BR × 1,481 = 3 023 s `derived` a rozšířeným
   rozpětím. Cokoli jiného (jiný donor, potlačení 3+kk/4+kk pro P10,
   vlastní kalibrace) je změna pravidla a chce vlastní předregistraci.
   Před spuštěním dávky se rozhodnutí zapíše sem do logu — buď „výchozí
   pravidlo, beze změny", nebo odkaz na samostatnou předregistraci.
   Je to jediná věc, která může dávku udělat nemechanickou.

## Výchozí stav (Praha 10 okres, měřeno 4. 9. 2026, v DB, ne v modelu)

| | ADR | RevPAR | occ | nMean | nMin | do `MARKET_STR` |
|---|---|---|---|---|---|---|
| 1BR | 1 871 | 1 329,5 | 70,2 % | 199 | 193 | ano |
| 2BR | 3 012 | 2 041,4 | 67,2 % | 65 | 58 | ano |
| 3BR | 5 802 | 1 633,4 | **28,7 %** | 13 | 11 | **ne** (odvozeno 2BR × 1,481 = 3 023) |

Okresní `2BR/1BR = 1,536`, `3BR/1BR = 1,229` (spouštěč P10 sepnul, viz
`PREREGISTRACE.praha10.md`). Sousedé: P4 1BR 1 254, P3 1 569, P2 (Vinohrady
1 670).

## Poměrový model

`2BR/1BR = 1,567`, `3BR/1BR = 2,427`. P10 sám 1,536 / 1,229.

## Očekávaný vzorek a VÁHA — S POKOROU

Vršovice = nejcentrálnější část P10 (Krymská, Kodaňská, Ruská, u
vinohradské hranice). Podíl na P10 odhad **40–65 %** u 1BR → bodový odhad
**1BR ~100**, nízká důvěra.

| 1BR | 2BR | 3BR |
|---|---|---|
| 70–130 → w 0,75 (1,0 nad 100) | 25–45 → w 0,5 | 4–10 → w 0, možná stejně divné jako okres |

3BR: čekej stejnou populaci jako P10 3BR (velké byty zčásti mimo STR,
nízká obsazenost). Pásmo se změří a uloží, nedopočítává se, do výsledku
při w 0 nepromluví. Jestli je P10 3BR anomálie okresní nebo vršovická, je
právě to, co má toto měření říct — do rozhodnutí v bodu 4 VAZBY.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,25–1,75 → prověřit.
2. `3BR/1BR` mimo 1,20–3,20 → při n < 10 jen zaznamenat.
3. `active_listings` 1BR nad ~199 (víc než celý okres) → polygon širší než
   k.ú. Vršovice → STOP, geometrie.
4. Podíl na P10 (1BR) mimo **30–75 %** → prověřit.
5. Podíl nestabilní mezi měsíci (přes ±3 p. b.) → podezření na překryv.
6. RevPAR 1BR POD okresem P10 o víc než 5 % → v rozporu s nájemní prémií
   +2,8 % a centrální polohou; zaznamenat, prověřit geometrii.
7. 3BR occ nad 55 % s n ≥ 8 → P10 anomálie NENÍ vršovická → zapsat jako
   vstup pro rozhodnutí 4, nerozhodovat tady.

## Schválení geometrie — OTEVŘENÉ

Řetězec neexistuje. Dotaz „Vršovice, Prague, official OpenStreetMap
boundary, 1-bedroom. …"; po prvním pásmu STOP na schválení znak po znaku.
Label může být „Vršovice official boundary" nebo anglická varianta. 2BR
a 3BR v téže session s výslovně pojmenovanou hranicí, label + zdroj
ověřit u každého pásma zvlášť.

## Postup a kvóta

SOP beze změny (raw před transformací, jen `data[]`, okno
`2025_08..2026_07`, kalendářní pravidlo, `basis: measured`, žádný
poměrový dopočet chybějícího pásma, `pl-import` bez
`--allow-uncommitted` až po commitu artefaktu). Import `--geo
praha10_vrsovice --level ctvrt --source-geometry vrsovice --parents
praha10 --ltr-context praha10/vrsovice`.

Kvóta: **první volání až v čerstvém okně** (reset ~16:37 UTC 6. 9. 2026);
3 dotazy z 20, začíná se jen s ≥ 5, končí s rezervou ≥ 4. Po Vršovicích
STOP — další volání jen na pokyn (fronta v `docs/pricelabs-autorun.md`).

## Integrační dávka (až po zachycení a přejímce, bez kvóty)

Jeden commit modelu, jedna regrese. Obsah:

- `MeasuredLocation` += `"praha10"`; `MARKET_STR.praha10` = 1BR + 2BR
  z `praha10.json` (nMin 193 / 58), 3BR podle rozhodnutí 4 VAZBY.
- `SEASONS_BY_LOC.praha10` spočítané z pullnutých měsíčních řad P10
  **stejným receptem jako P1–P9** (doc-comment v `yield.ts`: léto duben
  až říjen, zima listopad až březen bez prosince, Vánoce prosinec; vážené
  počtem nabídek přes spolehlivá pásma; vážený součet = roční průměr,
  hlídá `facts.test.ts`). Recept se nejdřív **zapíše jako skript nebo
  reprodukovatelný postup**, ověří se, že pro P1–P9 vrací dnešní
  konstanty, teprve pak se spočítá P10. Bez reprodukce P1–P9 se nic
  nezapisuje.
- Operátorský faktor P10 = výchozí 1,10 (žádné měření).
- `MARKET_CTVRT.vrsovice`, `parents: ["praha10"]`, tři měřená pásma,
  váhy podle `ctvrtWeight(nMean)` beze změny.
- Žádná změna prahů, vah, poměrů, `BAND_BLEND`, `SIZE_RATIO` ani
  `CALC_MODEL_VERSION` nad rámec toho, co si vyžádá nový klíč.

**Regresní očekávání (diff baseline před × po, po id):**

- stavy mimo Prahu 10: **0 změn** (žádný starší okres ani čtvrť se nesmí
  hnout — včetně `praha2|vinohrady`, `praha3|vinohrady`, všech Ostatní);
- dřív nepodporované stavy `praha10|?|…` → nově podporované (změna
  `supported` false → true je JEDINÁ povolená změna existujících řádků);
- `praha10|vrsovice|…` = nové stavy navíc;
- `praha10|-|…` (Ostatní) **= baseline okresu `praha10|?|…`** ve všech
  kombinacích;
- nic staršího se nehýbe.

Testy: kde test enumeruje „všechny měřené okresy", doplní se praha10 —
jen tam, kde to je záměr testu; fixture „okres bez čtvrti" zůstává na
praha6.

## Log pokusů

### Pokus 1 (2026-09-07 17:10 UTC): 1BR ÚSPĚCH — čeká na schválení geometrie

Dotaz doslova: `Vršovice, Prague, official OpenStreetMap boundary,
1-bedroom. For each month from August 2025 through July 2026 give: …`
Čerstvé okno (poslední volání 5. 9. 17:36 UTC), **1. pokus okna**
(ukotveno ~17:10 UTC 7. 9.), zbývá 19.

- `selected_geometry_label`: **`Vršovice official boundary`**
- `selected_geometry_source`: **`openstreetmap`**
- `market_label`: `Vršovice, Prague` · session `lg_sess_AMkfGOv9oOfenpGWqwbzy4pFST1Ph_vy`
- 12/12 měsíců, bez nadmnožiny, identity sedí; raw `e95655d1…`

| | P10 okres | zbytek P10 bez Vršovic | Vršovice | poměr k P10 |
|---|---|---|---|---|
| n (průměr) | 198,8 | 58,7 | 140,2 → 140 | **0,705** (0,68–0,72) |
| n (min) | 193 | | 133 | |
| RevPAR | 1 329,5 | 1 252,4 | 1 361,7 | **1,024** (1,01–1,07); k zbytku 1,087 |
| ADR | 1 871 | | 1 888 | 1,009 |
| occ | 70,2 % | | 71,3 % | |

Spouštěče: #3 ne (140 < 199) · #4 ne (70,5 % v pásmu 30–75 %, u horního
okraje — Vršovice JSOU STR Praha 10) · #5 ne (rozptyl 4 p. b., bez
trendu) · #6 ne (+2,4 % nad okresem, ve směru nájemní prémie +2,8 %;
zbytek P10 je 8 % pod Vršovicemi). Bodový odhad n ~100 byl pesimistický
(140); nMean 140 → váha **1,0**, nMin 133 ≥ 50 → `reliable`.

Důsledek pro integrační dávku (pravidla beze změny): u 1BR w 1,0 →
`praha10|vrsovice` 1BR = čistě vršovická buňka (1 361,7), žádný blend.

Schválení geometrie: **SCHVÁLENO člověkem 7. 9. 2026** znak po znaku
(`Vršovice official boundary` + `openstreetmap`).

### Pokusy 2 a 3 (2026-09-07 17:14 / 17:17 UTC): 2BR a 3BR ÚSPĚCH

Táž session, hranice pojmenovaná v každém dotazu, label + zdroj ověřeny
u obou pásem zvlášť. Oba 12/12, bez nadmnožiny, identity sedí; tabulka
v próze proti `data[]` bez rozdílu. Pokusy okna: 3, zbývá 17.

| pásmo | ADR | RevPAR | occ | nMean | nMin | podíl na P10 | RevPAR/P10 | váha (až v dávce) | raw |
|---|---|---|---|---|---|---|---|---|---|
| 1BR | 1 888 | 1 361,7 | 71,3 % | 140 | 133 | 0,705 (0,68–0,72) | 1,024 | 1,0 | e95655d1… |
| 2BR | 3 233 | 2 114,5 | 64,7 % | 36 | 31 | 0,557 (0,53–0,58) | 1,036 (0,90–1,13) | **0,5** | 84ad602d… |
| 3BR | 6 603 | 2 387,4 | **37,7 %** | 8 | 6 | 0,608 (0,54–0,67) | 1,462 | **0** | 46706242… |

Spouštěče: #1 `2BR/1BR = 1,553` v pásmu (model 1,567, okres 1,536).
#2 `3BR/1BR = 1,753` v pásmu 1,20–3,20, n = 8 → jen záznam. #7 **ne**:
occ 3BR 37,7 % < 55 % → anomálie P10 3BR NENÍ jen mimovršovická. #3–#6 ne.

**Vstup pro rozhodnutí 4 VAZBY (P10 3BR), nerozhoduje se tady:**
- Vršovice = 61 % nabídky P10 3BR. Dopočtený zbytek P10 3BR (n ≈ 5):
  RevPAR ≈ 445, occ ≈ 14 % — to není STR populace vůbec.
- Ani Vršovice samy nejsou u 3BR „normální": occ 37,7 % proti 65–71 %
  u 1BR/2BR, `median_bw` 67–95 dní v 8 z 12 měsíců, únor `median_los`
  38 nocí → pár velkých bytů zčásti mimo krátkodobý trh.
- Odvozený P10 3BR (2 041,4 × 1,481 = **3 023**) je o 27 % nad
  nejlepším přímým měřením (Vršovice 2 387, n 8) a o 85 % nad okresním
  měřením (1 633, n 13). Odvozené z vršovického 2BR (2 114,5 × 1,481 =
  3 132) ho přestřeluje o 31 %. Žádné přímé měření v P10 poměr 3BR/2BR
  1,481 nepodporuje (Vršovice 1,129, okres 0,800).
- Výchozí pravidlo by v dávce dalo: P10 3BR odvozené 3 023 s `derived`
  a rozšířeným rozpětím; `praha10|vrsovice` 3BR w 0 → totéž. Jestli je to
  přijatelné, nebo P10 3+kk/4+kk chce vlastní zacházení, je rozhodnutí
  člověka PŘED dávkou.

### Práce bez kvóty (2026-09-07 17:25 UTC): recept sezón reprodukován, P10 spočítáno, MODEL BEZE ZMĚNY

`scripts/pl-seasons.mjs --check` reprodukuje **všech 54 konstant
`SEASONS_BY_LOC` P1–P9 přesně** z artefaktů `data/pricelabs-2026-08/`.
Recept: spolehlivá pásma = ta v `MARKET_STR`; měsíční ADR/RevPAR vážené
počtem aktivních nabídek přes pásma; léto duben–říjen, zima listopad–
březen bez prosince, Vánoce prosinec; faktor = průměr sezóny / průměr
12 měsíců; 3 desetinná místa. Dvě alternativy (průměr pásmových faktorů
vážený nMean; nevážený měsíční průměr) NESEDÍ — vyloučeno.

`SEASONS_BY_LOC.praha10` z `praha10.json`, pásma 1BR + 2BR (3BR nMin 11
ven, stejně jako u P3/P4/P6/P7/P8/P9):

`{ summer: { adr: 1.031, revpar: 1.089 }, winter: { adr: 0.858, revpar: 0.719 }, xmas: { adr: 1.349, revpar: 1.499 } }`

(součet 7/4/1 = 0,9998; zima RevPAR < ADR; Vánoce > léto — invarianty
`facts.test.ts` sedí. Prakticky totožné s P4: 1,034/1,093 · 0,856/0,714 ·
1,338/1,491.) Zapsáno jen sem; do `yield.ts` až v integrační dávce.

Rozhodnutí 4 VAZBY (P10 3BR): **ROZHODNUTO člověkem 7. 9. 2026 — varianta
(a), výchozí odvozené pravidlo, přijato PROVIZORNĚ pro integraci.**
Doslova: „keep the existing derived rule. Not because 3,023 looks
proven — it clearly isn't — but because option (b) would mean inventing
a P10-specific calibration from even worse data. The direct 3BR samples
are tiny and appear contaminated by medium/long-stay behavior. Keep
`derived: true` + widened range and explicitly preserve the warning/open
calibration item." Výslovně NE: použít vršovických 2 387 jako P10 3BR
(n = 8, occ 38 %, dlouhá okna a pobyty). V modelu se P10 3BR vede jako
**neověřené (odvozené), ne měřené**; otevřená položka kalibrace
odvozeného 3BR (docs/calculator-model.md §4) se rozšiřuje o P10 s touto
poznámkou. Dávka tím je mechanická.
