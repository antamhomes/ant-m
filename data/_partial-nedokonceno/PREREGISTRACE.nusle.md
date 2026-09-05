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

---

## Pokus 1 (2026-09-05 17:02 UTC): 1BR ÚSPĚCH — čeká na schválení geometrie

Dotaz doslova: `Nusle, Prague, official OpenStreetMap boundary, 1-bedroom.
For each month from August 2025 through July 2026 give: …`

- `selected_geometry_label`: **`Nusle official boundary`**
- `selected_geometry_source`: **`openstreetmap`**
- `market_label`: `Nusle, Prague, Czech Republic` · session `lg_sess_TNK2IcsjBJYW03kjE3FTJyR78IvCgvcu`
- 12/12 měsíců, bez nadmnožiny, identity sedí; raw `91ceb0fd…`
- kvóta: 7. pokus okna

| | P4 okres | Nusle | poměr |
|---|---|---|---|
| n (průměr) | 183,5 | 111,5 | **0,608** |
| n (min) | 158 | 101 | |
| RevPAR | 1 254,0 | 1 332,3 | **1,062** (0,98–1,14 po měsících) |
| ADR | 1 810 | 1 903 | 1,052 |
| occ | | 69,1 % | |

Spouštěče: #3 ne (112 < 165) · #4 ne (61 % v pásmu 25–75) · #5 ne
(0,57–0,64; rozptyl 7 p. b. je víc než u dřívějších čtvrtí, ale bez
trendu — Nusle rostou v zimě, P4 v létě) · #6 ne — Nusle jsou **+6,2 %
nad okresem** u 1BR, ve směru nájemní prémie (+4,1 %). Zbytek P4 (n ≈ 72)
má RevPAR ≈ 1 133, 15 % pod Nuslemi. nMean 112 → váha **1,0** (odhad
0,75 byl pesimistický; podíl 61 % je nad bodovým odhadem 45 %).

Schválení geometrie: **OTEVŘENÉ**, čeká na člověka.

## Pokusy 2 a 3 (2026-09-05 17:05 / 17:07 UTC): 2BR a 3BR ÚSPĚCH

Geometrie schválena člověkem znak po znaku. 2BR i 3BR v téže session,
u obou stejný label + zdroj, ověřeno zvlášť. 2BR 12/12; 3BR přišel jako
13 měsíců (`2026_08` navíc, vyřazen kalendářním pravidlem, obálka drží 13).

| pásmo | ADR | RevPAR | occ | nMean | nMin | podíl na P4 | rozsah | RevPAR/P4 | váha | raw |
|---|---|---|---|---|---|---|---|---|---|---|
| 1BR | 1 903 | 1 332,3 | 69,1 % | 112 | 101 | 0,608 | 0,57–0,64 | 1,062 | 1,0 | 91ceb0fd… |
| 2BR | 3 318 | 2 170,1 | 64,3 % | 37 | 27 | 0,538 | 0,42–0,59 | **1,279** | **0,5** | 9d37b7a1… |
| 3BR | 6 419 | 4 323,6 | 67,4 % | 5 | 3 | 0,864 | 0,75–1,00 | 1,226 | **0** | 453c00ff… |

Spouštěče: #1 `2BR/1BR = 1,629` v pásmu (model 1,567 → +4,0 %; okres P4
sám má 1,353 — anomálně nízké 2BR je vlastnost okresu, ne Nuslí).
#2 `3BR/1BR = 3,245` MIMO 1,20–3,00, ale n ≈ 5 → podle předregistrace jen
zaznamenat. #3–#6 ne.

**Zjištění:** Nusle mají u 2BR **+28 % nad okresem** (u 1BR +6 %) — první
čtvrť, kde se lokální efekt liší podle pásma tak výrazně. Pravděpodobný
mechanismus: zbytek P4 2BR (n ≈ 32, Krč/Braník/Michle) táhne okresní 2BR
dolů (dopočtený zbytek ≈ 1 150), zatímco nuselské 2BR jsou centrální. Při
váze 0,5 jde do veřejného výsledku 50 % z 2170,1 + 50 % z 1697,0 =
**1 933,6** (`derived: false`, okresní 2BR je měřené).

3BR: nMean 5 → `ctvrtWeight` 0 → okres, tj. ODVOZENÝ P4 3BR (1697,0 ×
1,481 = 2 513); přímo naměřených 4 324 při n ≈ 5 je o 72 % výš —
čtvrtý okres s tímto vzorcem (P3, P8, P7, P4), zapsáno, pravidlo se nemění.

Kvóta: pokusy 7–9 okna (9 celkem), zbývá 11.
