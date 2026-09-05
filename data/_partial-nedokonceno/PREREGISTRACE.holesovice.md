# Předregistrace: Holešovice

Zapsáno **2026-09-05 16:49 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem). Všechno níž je **diagnostický spouštěč, ne kritérium
přijetí.** Naměřená pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Holešovice

Jediný kontext `praha7/holesovice` (LTR efekt **+0,08 %, n=62** — nájem
Holešovic je na úrovni okresu). Praha 7 zatím žádnou čtvrť nemá → první
selektor pro P7. Praha 7 je STR malý okres (1BR n 215, 2BR 98, 3BR 25
NEPOUŽITELNÉ — v `MARKET_STR` není, odvozuje se z 2BR poměrem: 2087,1 ×
1,481 = 3 091).

Otázka: **Žižkov a Smíchov ukázaly paritu s okresem bez ohledu na nájemní
rozestup; Karlín prémii shodnou s nájmem. Holešovice mají nájem na paritě
(+0,1 %) — ukáže STR taky paritu, nebo se od okresu odchýlí (Letná /
Bubeneč jsou v P7 taky)?**

## Výchozí stav (Holešovice v `MARKET_CTVRT` nejsou → okres Praha 7)

| | ADR | RevPAR | nMean | nMin | v MARKET_STR |
|---|---|---|---|---|---|
| 1BR | 2 105 | 1 507,0 | 215 | 196 | ano |
| 2BR | 3 336 | 2 087,1 | 98 | 91 | ano |
| 3BR | 7 130 | 4 077,6 | 25 | 21 | **ne** (odvozuje se 2BR × 1,481 = 3 091; přímé tenké měření 4 078 — stejný vzorec jako P3: odvozené pod tenkým přímým) |

`2BR/1BR = 1,385` · `3BR/1BR (odvozené) = 2,051`.

## Poměrový model

Předpovídá `2BR/1BR = 1,567`, `3BR/1BR = 2,427`. Dosavadní odchylky:
NM −1,1 / +3,2 %, Vinohrady +3,3 / −3,7 %, Žižkov −5,8 / +15,6 %, Smíchov
−2,8 / −6,3 %, Karlín −16,2 / −20,6 %, Staré Město −2,4 / −16,8 %.

## Očekávaný vzorek a VÁHA — S POKOROU

MČ Praha 7 = Holešovice + část Bubenče (Letná je součást Holešovic i
Bubenče) + Troja není (samostatná MČ). Holešovice jsou většina STR v P7:
bodový odhad ~80 %, nízká důvěra.

| podíl na P7 | 1BR | 2BR | 3BR |
|---|---|---|---|
| 65 % | 140 (w 1,00) | 64 (w 0,75) | 16 (**w 0**) |
| 80 % | 172 (w 1,00) | 78 (w 0,75) | 20 (**w 0**) |
| 95 % | 204 (w 1,00) | 93 (w 0,75) | 24 (**w 0**) |

**3BR skoro jistě váha 0** (okres má 25); změří se a uloží, do veřejného
výsledku nepromluví, odvozený okresní rodič zůstane. Kdyby vyšlo ≥ 25,
je to známý žižkovský režim (w 0,5 do odvozeného rodiče) — vypsat, co
`localCell` vrátí. 2BR bude na váze 0,75 (první čtvrťové 2BR pod plnou
vahou bylo Karlín).

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,25–1,70 (P7 sám 1,385) → prověřit.
2. `3BR/1BR` mimo 1,40–2,90 → totéž (při n ≈ 20 hlučné, zaznamenat).
3. `active_listings` 1BR nad ~195 (≈ 90 % P7) → polygon moc široký
   (Bubeneč uvnitř?).
4. Podíl na P7 mimo **50–95 %** → prověřit.
5. Podíl nestabilní mezi měsíci (přes ±3 p. b.) → podezření na překryv.
6. RevPAR Holešovic mimo ±5 % okresu u 1BR → zaznamenat jako zjištění
   (odchylka od „nájem na paritě → STR na paritě").

## Schválení geometrie — OTEVŘENÉ

Schválený řetězec **neexistuje**. Dotaz pojmenuje hranici výslovně
(„Holešovice, Prague, official OpenStreetMap boundary, 1-bedroom. …");
po prvním úspěšném pásmu STOP, člověk schvaluje `selected_geometry_label`
+ `selected_geometry_source` znak po znaku. Pozor: label může být česky
(„Holešovice official boundary") i anglicky — Staré Město vrátilo „Old
Town"; nic se nepředpokládá.

## Postup

SOP beze změny: výslovná hranice v každém dotazu, session jen pin, label
+ zdroj u každého pásma, `pl-raw.mjs` před transformací, okno
`2025_08..2026_07`, nadmnožina jen kalendářním pravidlem, bez poměrového
dopočtu. Kvóta: před voláním 3 pokusy okna (Staré Město), zbývá 17;
po Holešovicích ≥ 14 → Nusle → Libeň, každá se zastaví pod 4 zbývajícími.
