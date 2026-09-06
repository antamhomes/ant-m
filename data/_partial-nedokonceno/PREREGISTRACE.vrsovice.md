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

(prázdné — před prvním voláním)
