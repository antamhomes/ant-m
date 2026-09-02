# Předregistrace: Žižkov

Zapsáno **2026-09-02, PŘED prvním voláním PriceLabs.**
Diagnostické spouštěče, **ne** kritéria přijetí.

## Proč Žižkov

Jediný kontext (`praha3/zizkov`, LTR efekt −3,81 %, n=79) — na rozdíl od
Nového Města a Vinohrad neobsluhuje dva obvody. Hodnota je jinde: Praha 3
už jednu čtvrť má (Vinohrady), takže Žižkov je první test, jestli je
**obvod sám o sobě heterogenní na STR**, ne jen na nájmu.

V nájmu se ty dvě čtvrti liší o **7,6 %** (Vinohrady +3,53 %, Žižkov
−3,74 % proti okresu). Otázka je, jestli se podobný rozestup ukáže i ve
výnosu STR, nebo jestli je Praha 3 na STR jednolitá.

## Výchozí stav (Žižkov v `MARKET_CTVRT` není → okres Praha 3)

| | roční výnos | ADR | n |
|---|---|---|---|
| 1BR | 529 439 | 2 130 | 626 |
| 2BR | 780 275 | 3 085 | 179 |
| 3BR | 1 405 334 | 5 880 | 46 |

`2BR/1BR = 1,474` · `3BR/1BR = 2,654`

## Poměrový model

Předpovídá `2BR/1BR = 1,567`, `3BR/1BR = 2,427`.
Dosavadní odchylky: Nové Město −1,1 % / +3,2 %, Vinohrady +3,3 % / −3,7 %.

## Očekávaný vzorek a VÁHA

| podíl na P3 | 1BR | 2BR | 3BR |
|---|---|---|---|
| 35 % | 219 (w 1,00) | 63 (w 0,75) | 16 (**w 0**) |
| 40 % | 250 (w 1,00) | 72 (w 0,75) | 18 (**w 0**) |
| 45 % | 282 (w 1,00) | 81 (w 0,75) | 21 (**w 0**) |

**3BR skoro jistě vyjde s váhou 0.** `ctvrtWeight` pod 25 vrací nulu,
takže `localCell` čtvrťovou buňku zahodí a vrátí okres. Pásmo se přesto
stáhne, změří a uloží — jen do veřejného výsledku nepromluví, dokud
vzorek nevyroste. Není to důvod pull nedělat ani pásmo dopočítávat.

2BR poprvé skončí na váze 0,75 už při realistickém podílu (u Vinohrad
byla 0,75 až u 3BR).

## Spouštěče vyšetřování (ne zamítnutí)

1. `2BR/1BR` mimo 1,30–1,70 → prověřit geometrii a vzorek.
2. `3BR/1BR` mimo 1,40–2,90 → totéž.
3. `active_listings` 1BR nad ~500 (80 % celé P3) → polygon moc široký.
4. Podíl na P3 mimo 25–60 % → totéž.
5. Součet Vinohrady(P3 část) + Žižkov výrazně nad stavem P3 → překryv
   geometrií; je to DIAGNOSTIKA, ne invariant (čtvrti se můžou překrývat
   a PriceLabs vrací agregát bez ID listingů).

## Schválení geometrie — OTEVŘENÉ

Pro Žižkov schválený řetězec **neexistuje**. Čeká se, co vrátí první
volání; schvaluje člověk, znak po znaku. Podle vzoru předchozích dvou
to nejspíš bude `Žižkov official boundary (openstreetmap)`, ale
**předpokládat se to nesmí** — Nové Město ukázalo, že auto-výběr umí
vrátit i patnáctikilometrový kruh s věrohodným popiskem.

## Postup

Podle SOP §14 a §15: výslovné pojmenování hranice v KAŽDÉM dotazu
(referenční „same geography in this session" u Vinohrad selhalo s
`data:null`), ověření `selected_geometry_label` + `_source` u každého
pásma zvlášť, záchyt syrové odpovědi před transformací, okno se smí
vrátit jako nadmnožina a ořízne se kalendářním pravidlem.
