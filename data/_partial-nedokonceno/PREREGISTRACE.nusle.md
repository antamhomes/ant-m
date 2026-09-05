# Předregistrace: Nusle

Zapsáno **2026-09-05 17:00 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Všechno níž je **diagnostický spouštěč, ne kritérium
přijetí.** Naměřená pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Nusle

Jediný kontext `praha4/nusle` (LTR efekt **+4,07 %, n=48**). Praha 4 zatím
žádnou čtvrť nemá → první selektor pro P4. Praha 4 je velký, na STR řídký
okres (1BR n 184, 2BR 69, 3BR n ≈ 5 NEPOUŽITELNÉ — odvozuje se z 2BR:
1697,0 × 1,481 = 2 513). Nusle jsou jeho nejcentrálnější část (Vyšehrad,
Náměstí Bratří Synků, hranice s Vinohrady) — pokud má P4 vnitřní STR
rozdíl, je to tady.

Otázka: **nájem říká Nusle +4,1 % nad P4. Karlín (+11,4 % nájem) ukázal
STR +7–9 %; Smíchov (+7,7 %) paritu. Kde se zařadí Nusle?**

## Výchozí stav (Nusle v `MARKET_CTVRT` nejsou → okres Praha 4)

| | ADR | RevPAR | nMean | nMin | v MARKET_STR |
|---|---|---|---|---|---|
| 1BR | 1 810 | 1 254,0 | 184 | 158 | ano |
| 2BR | 2 539 | 1 697,0 | 69 | 60 | ano |
| 3BR | 5 070 | 3 526,1 | 5 | 4 | **ne** (odvozuje se 2 513) |

`2BR/1BR = 1,353` (P4 sám).

## Poměrový model

`2BR/1BR = 1,567`, `3BR/1BR = 2,427`. P4 sám je u 2BR/1BR o 14 % pod
modelem (stejný vzorec jako P8 1,335); Nusle nejspíš taky nízko.

## Očekávaný vzorek a VÁHA — S POKOROU

MČ Praha 4 = Nusle + Michle + Krč + Braník + Podolí + Hodkovičky + Lhotka
(+ malé části). Nusle jsou STR nejhustší, ale P4 je široká: bodový odhad
podílu **~45 %**, nízká důvěra.

| podíl na P4 | 1BR | 2BR | 3BR |
|---|---|---|---|
| 30 % | 55 (w 0,75) | 21 (**w 0**) | ~2 (w 0) |
| 45 % | 83 (w 0,75) | 31 (w 0,50) | ~2 (w 0) |
| 60 % | 110 (w 1,00) | 41 (w 0,50) | ~3 (w 0) |

**Poprvé může být čtvrťové 1BR pod plnou vahou** (nMean 50–99 → 0,75).
2BR w 0,5 nebo 0. 3BR jistě w 0 a nejspíš n < 5 — může přijít i prázdná
odpověď / `data:null`; počítá se jako pokus, pásmo se zapíše jako
změřené s tím, co přišlo, žádný dopočet.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,20–1,70 (P4 1,353) → prověřit.
2. `3BR/1BR` mimo 1,20–3,00 → při n < 10 jen zaznamenat, ne vyšetřovat.
3. `active_listings` 1BR nad ~165 (≈ 90 % P4) → polygon moc široký.
4. Podíl na P4 mimo **25–75 %** → prověřit.
5. Podíl nestabilní mezi měsíci (přes ±3 p. b.) → podezření na překryv.
6. RevPAR 1BR POD okresem → v rozporu s centrální polohou i nájemní prémií;
   zaznamenat jako zjištění.

## Schválení geometrie — OTEVŘENÉ

Řetězec neexistuje. Dotaz „Nusle, Prague, official OpenStreetMap
boundary, 1-bedroom. …"; po prvním pásmu STOP na schválení znak po
znaku. K.ú. Nusle leží v Praze 4 i malým dílem v Praze 2 (Nusle-P2 část
u Folimanky) — GEO registr má jen `praha4/nusle`, takže rodič je jen
praha4; kdyby n vyšlo výrazně nad P4 odhad, podezření na P2 přesah.

## Postup

SOP beze změny. Kvóta: před voláním 6 pokusů okna, zbývá 14; po Nuslích
≥ 11 → Libeň; každá čtvrť se zastaví pod 4 zbývajícími.
