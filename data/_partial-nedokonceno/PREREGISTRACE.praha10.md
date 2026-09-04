# Předregistrace: Praha 10 (okres, 1BR / 2BR / 3BR)

Zapsáno **2026-09-04 11:42 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Sběr a přejímka dat; **integrace do `MARKET_STR` je
samostatné rozhodnutí**, dnes se nedělá.

## Proč

Praha 10 je jediný obvod v nabídce kalkulačky, který vrací „posoudíme
individuálně" (`isMeasured` false). Tři dotazy zavřou poslední díru
v pokrytí obvodů. Nájemní strana existuje (`praha10` v LTR tabulkách,
čtvrťové kontexty Vršovice n=40, Strašnice n=37, Hostivař, Záběhlice).

## Co bude integrace potřebovat (POZOR, ne dnes)

`SEASONS_BY_LOC` Prahu 10 nemá; `ownerMonthly` by pro sezónu ≠ rok
spadl. Integrace tedy není jen řádek v `MARKET_STR` — sezónní faktory se
musí spočítat z pullnuté měsíční řady STEJNÝM postupem jako u ostatních
obvodů (zdokumentovat, jaký to je, než se cokoli zapíše). Operátorský
faktor spadne na výchozí 1,10 (žádné měření). V regresi se smějí měnit
JEN řádky `praha10|…` (z unsupported na supported); všechno ostatní 0.

## Očekávání

Praha 10 (MČ: Vršovice, Strašnice, Vinohrady-část, Malešice, Záběhlice,
Hostivař) — STR soustředěné do Vršovic a vinohradské části.

| | n (odhad) | nMin ≥ 50 | RevPAR (odhad) |
|---|---|---|---|
| 1BR | 150–250 | ano | ~1 250–1 500 (mezi P4 1 254 a P3 1 569) |
| 2BR | 50–90 | hraničně | ~1 900–2 300 |
| 3BR | 15–35 | ne | — (nejspíš zůstane venku, odvozené z 2BR) |

Poměrový model: `2BR/1BR = 1,567`, `3BR/1BR = 2,427`.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,25–1,70; `3BR/1BR` mimo 1,40–2,90 → prověřit.
2. 1BR n nad 400 → polygon širší než MČ Praha 10.
3. RevPAR 1BR nad P3 (1 569) nebo pod P4 (1 254) → zaznamenat, není
   chyba.
4. `nMin` pásma pod 50 → pásmo se změří a uloží, do `MARKET_STR` nejde
   (stejné pravidlo jako P3/P8 3BR).

## Geometrie

Nová. Očekává se `Praha 10 official boundary` + `openstreetmap`, ale
předpokládat se nesmí. Po 1BR STOP na schválení znak po znaku; 2BR a
3BR s pojmenovanou hranicí v téže session, label + zdroj ověřit zvlášť.

## Postup

SOP beze změny. Artefakt `data/pricelabs-2026-09/praha10.json`, import
`--geo praha10 --level okres`. Kvóta: začíná se jen s ≥ 5 zbývajícími,
končí s rezervou ≥ 4.

---

## Výsledek (2026-09-04 11:53–11:58 UTC) — pokusy 14, 15, 16 okna

Geometrie schválena člověkem znak po znaku po 1BR: `Praha 10 official
boundary` + `openstreetmap`; 2BR a 3BR v téže session, u obou stejný
label + zdroj, ověřeno zvlášť. Všechna pásma 12/12 měsíců, bez nadmnožiny.

| pásmo | ADR | RevPAR | occ | nMean | nMin | nMin ≥ 50 | raw |
|---|---|---|---|---|---|---|---|
| 1BR | 1 871 | 1 329,5 | 70,2 % | 199 | 193 | **ano** | ae0d1330… |
| 2BR | 3 012 | 2 041,4 | 67,2 % | 65 | 58 | **ano** | ecd7b884… |
| 3BR | 5 802 | 1 633,4 | **28,7 %** | 13 | 11 | ne | 70c3a1b6… |

Spouštěče: `2BR/1BR = 1,536` v pásmu (model 1,567 → −2,0 %). **`3BR/1BR
= 1,229` MIMO pásmo 1,40–2,90 → spouštěč #1 SEPNUL.** Diagnóza: n ≈ 13
a obsazenost 28,7 % proti 67–70 % u 1BR/2BR (`median_los` v únoru 38
nocí) — to není srovnatelná STR populace, spíš pár velkých bytů zčásti
mimo krátkodobý trh. Pásmo je podle stávajícího pravidla stejně
nepoužitelné (nMin 11 < 50) a do `MARKET_STR` nejde; `marketCell` by
P10 3BR odvodil z 2BR: 2041,4 × 1,481 = **3 023** proti přímo
naměřeným 1 633. Odvozená buňka by tenké přímé měření přestřelila
o 85 % — u P10 by se každý 3+kk/l a 4+kk odhad opíral o odvozený 3BR,
který jediná přímá data zásadně nepotvrzují. Zapsat, nerozhodovat.
#2 ne (199 < 400). #3 ne (1 329 mezi P4 1 254 a P3 1 569). #4: 3BR ano
(nMin 11), viz výše.

Drobnost: u 3BR 2025_09 identita ADR×occ vs RevPAR sedí jen na 0,26 %
(occ 15,1 % zaokrouhlené na desetinu) — zaokrouhlení PriceLabs, ne přepis.

**Co chybí k integraci (dnes se nedělá):**
1. `SEASONS_BY_LOC.praha10` — sezónní faktory (summer/winter/xmas) se
   musí spočítat z pullnutých řad stejným postupem jako u P1–P9;
   postup není v repu zdokumentovaný jako skript → nejdřív ho dohledat/
   zapsat, pak spočítat, pak zapsat.
2. `MARKET_STR.praha10` = 1BR + 2BR (měřené), 3BR ven (nMin 11) →
   odvozené z 2BR se všemi výhradami výše; `isMeasured("praha10")` tím
   přejde na true.
3. Operátorský faktor: výchozí 1,10 (žádné měření).
4. Regrese: měnit se smějí JEN řádky `praha10|…` (unsupported →
   supported), vše ostatní 0 změn.
5. UI: `LOCS` P10 už nabízí; texty „posoudíme individuálně" pro P10
   zmizí samy přes `supported`.

Artefakt `data/pricelabs-2026-09/praha10.json`, import `--geo praha10
--level okres`, tři řádky (3BR `reliable: false`). Kvóta: 16 pokusů
okna, **4 v rezervě, žádné další volání dnes.**
