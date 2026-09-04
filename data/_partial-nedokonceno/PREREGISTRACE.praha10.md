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
