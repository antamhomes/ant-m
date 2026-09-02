# Předregistrace: Vinohrady

Zapsáno **2026-09-02, PŘED prvním voláním PriceLabs.**
Všechno níž je **diagnostický spouštěč, ne kritérium přijetí.** Naměřená
pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Vinohrady

Jedna geometrie, **dva registrované kontexty**: `praha2/vinohrady`
(LTR efekt +0,6 %, n=63) a `praha3/vinohrady` (+3,5 %, n=32). Oba mají
vlastní změřený efekt, ani jeden nepadá na okres. Tři dotazy pokryjí obojí.

## Co model říká DNES (Vinohrady v `MARKET_CTVRT` nejsou → okresní buňky)

| | 1BR | 2BR | 3BR | 2BR/1BR | 3BR/1BR |
|---|---|---|---|---|---|
| praha2 | 586 920 | 942 637 | 1 418 414 | 1,606 | 2,417 |
| praha3 | 529 439 | 780 275 | 1 405 334 | 1,474 | 2,654 |

Majitel na Vinohradech dostane jedno z těchto dvou podle obvodu.

## Poměrový model

Rozpad 0,779 / 1,221 / 1,891 předpovídá `2BR/1BR = 1,567`,
`3BR/1BR = 2,427` — u Nového Města sedělo na −1,1 % a +3,2 %.

## Kontext rozptylu (roční výnos, devět obvodů)

| poměr | min | medián | max | P2 | P3 |
|---|---|---|---|---|---|
| 2BR/1BR | 1,335 | 1,474 | 1,606 | 1,606 | 1,474 |
| 3BR/1BR | 1,431 | 2,417 | 2,706 | 2,417 | 2,654 |

Pozor: **P2 leží přesně na maximu** rozptylu 2BR/1BR a P3 na mediánu.
Vinohrady spadnou nejspíš mezi ně, tedy zhruba 1,47–1,61.

## Očekávaný vzorek (podíl jako Nové Město, ~49 % rodičů)

| pásmo | P2 | P3 | součet | odhad Vinohrady |
|---|---|---|---|---|
| 1BR | 920 | 626 | 1546 | ~758 |
| 2BR | 361 | 179 | 540 | ~265 |
| 3BR | 128 | 46 | 174 | **~85** |

**3BR je těsné pásmo.** U Nového Města jsem odhadoval ~150 a vyšlo 231,
takže odhad může být nízký. Ale zdrojová zásoba je tu 174 proti 448,
takže 3BR pod prahem 50 je reálná možnost. Kdyby k tomu došlo, **není to
důvod pásmo zahodit ani dopočítat** — zapíše se, jak vyšlo, a rozhodne se
zvlášť.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,40–1,65 → prověřit geometrii a vzorek.
2. `3BR/1BR` mimo 1,40–2,80 → totéž.
3. `active_listings` 1BR blízko celého P2+P3 (1546) → polygon je moc široký.
4. Podíl na P2+P3 mimo 30–70 % → totéž.
5. `nMin` kteréhokoli pásma pod 50 → zapsat, nahlásit, neintegrovat bez rozhodnutí.

## Schválení geometrie — OTEVŘENÉ

Pro Vinohrady **žádný schválený řetězec geometrie zatím neexistuje.**
První volání ho teprve ukáže; schválit ho musí člověk, znak po znaku,
než se potáhne 2BR a 3BR.

---

## Pokus 1 (2026-09-02): prázdná obálka

První volání 1BR vrátilo `{"success":false,"error":""}`. Podle SOP §14
se pokus zastavuje a **nevykládá se jako nepřítomnost dat**.

Žádná session nevznikla, takže není co připínat — příští pokus začíná
od nuly včetně výběru geometrie.

Spotřeba dnes: **9 dotazů** (6 úspěšných, 3 prázdné obálky).

---

## Pokus 2 (1BR) uspěl, geometrie schválena

`Vinohrady official boundary` / `openstreetmap`, okno `2025_08 … 2026_07`,
12/12 řady bez děr. `nMin 586`, `nMean 616`, ADR 2335, RevPAR 1669,8,
obsazenost 70,6 %, roční výnos 566 572.
Surová provenience: `data/pricelabs-raw/vinohrady.1BR.raw.json`,
`raw_sha256 194dea24a859807f…`. Session `lg_sess_JgFzb-…` připnuta.

Podíl na P2+P3 1BR: **39,9 %** (Nové Město mělo 49 %). Uvnitř spouštěcího
pásma 30–70 %, takže žádné vyšetřování. Diagnostická poznámka: kdyby týž
podíl platil pro 3BR, vyjde ~70 místo předregistrovaných ~85. **Práh se
tím neposouvá.**

## 2BR: NOVÝ REŽIM SELHÁNÍ — `success: true`, ale `data: null`

Volání ve stejné session, geografie znovu nepopsána, znění jako u Nového
Města. Odpověď:

- `success: true`, `status_code: 200`
- `session_created: false` — do session se opravdu navázalo
- **`data: null`** — žádná strukturovaná data
- próza: „unable to provide … due to the lack of data visible for this
  specific session … please ensure the relevant geography is selected"
- `Analysis area: The exact same geography already selected in this session`
  — agent vzal tu větu jako **název místa**, ne jako odkaz

**Tohle SOP §14 nepokrývá.** Předpokládalo se buď selhání obálky
(`success:false`), nebo neshoda labelu. Tady je odpověď formálně v pořádku
a session navázaná, jen se ztratil geometrický kontext.

Rozdíl proti Novému Městu: tam táž konstrukce fungovala třikrát.
Pin přes session tedy **není spolehlivý mechanismus** — u jedné čtvrti
držel, u druhé ne.

Nic se nepřijalo, 2BR neexistuje. Spotřeba dnes: **11 dotazů**
(7 úspěšných, 3 prázdné obálky, 1× `data: null`).

## 2BR (výslovné pojmenování hranice): geometrie SEDÍ, okno NE

Dotaz `Vinohrady, Prague, official OpenStreetMap boundary, 2-bedroom`
ve stejné session.

- `session_created: false`
- `selected_geometry_label: "Vinohrady official boundary"` ✓
- `selected_geometry_source: "openstreetmap"` ✓
- strukturovaná `data[]` přítomná ✓
- **`months` má 13 položek a končí `2026_08`** ✗

Srpen 2026 je NEUZAVŘENÝ měsíc (uzavírá se 10. 9.). Že je nedojetý, je
vidět i z dat: obsazenost 55,9 % proti 81,7 % loni v srpnu (−25,8 pp)
a záznam jako jediný postrádá `avg_bookings`.

Dvanáct měsíců v okně je kompletních:

```
nMin 215  nMean 226  adr 3656  revpar 2710,4  rocni vynos 917 370  occ 73,0 %
2BR/1BR = 1,619   podil na P2+P3 2BR: 41,9 %  (1BR melo 39,9 %)
```

Poměr 1,619 je nad P2 (1,606) i nad očekávaným pásmem 1,47–1,61, ale
**uvnitř spouštěcího pásma 1,40–1,65** — žádné vyšetřování se nespouští.

**Nezachyceno, nepřijato.** `extractFromResponse` vyžaduje shodu měsíců
na doraz, takže 13 řádků proti 12 by envelope neprošla. Ořez na pravidlo
by byl transformace, o které rozhoduje člověk, ne skript.

Spotřeba dnes: **12 dotazů.**

---

# 3BR: PROŠLO. Všechna tři pásma měřená.

Táž session, totéž výslovné pojmenování hranice.
`session_created: false`, `Vinohrady official boundary` / `openstreetmap`,
strukturovaná `data[]`, 13 měsíců → `2026_08` vyřazen kalendářním pravidlem,
raw `cadd680064ec8f6a…`, `basis: measured`.

| pásmo | nMin | nMean | ADR | RevPAR | roční výnos | obsazenost | raw |
|---|---|---|---|---|---|---|---|
| 1BR | 586 | 616 | 2 335 | 1 669,8 | 566 572 | 70,6 % | `194dea24…` |
| 2BR | 215 | 227 | 3 656 | 2 710,4 | 917 370 | 73,0 % | `3bcd36a3…` |
| 3BR | **63** | **71** | **5 437** | **3 946,1** | **1 324 151** | **71,9 %** | `cadd6800…` |

## Předregistrovaný test

| | model | naměřeno | rozdíl |
|---|---|---|---|
| 2BR/1BR | 1,567 | **1,619** | +3,3 % |
| 3BR/1BR | 2,427 | **2,337** | **−3,7 %** |

Oba uvnitř spouštěcích pásem, **žádné vyšetřování se nespouští.**
3BR předpověď 1 375 070 vs naměřeno 1 324 151.

## Podíl na rodičích P2+P3 — třetí potvrzení polygonu

1BR **39,8 %** · 2BR **41,9 %** · 3BR **40,2 %**

Tři pásma v rozmezí dvou procentních bodů. Geometrie je konzistentní.
Revidovaný odhad 3BR (~70 při 40 %) vyšel **na jednotku**.

## DŮSLEDEK PRO MODEL, který vyžaduje rozhodnutí

`ctvrtWeight(nMean)` = 1,0 při ≥100; **0,75 při 50–99**; 0,5 při 25–49.

Vinohrady 3BR má `nMean 70` → **váha 0,75**. Je to **první čtvrťové pásmo,
které nedostane plnou váhu** — Staré Město i Nové Město měly všechna pásma
nad 100. Výsledek pro 3BR bude tedy 75 % Vinohrad + 25 % okresu, a protože
geometrie patří do dvou obvodů, smíchá se s **jiným** okresem podle toho,
jestli je byt v Praze 2 nebo 3.

Není to vada, pravidlo funguje, jak má. Ale je to nová situace, kterou
předchozí dvě čtvrti nevyzkoušely, a před integrací si zaslouží vědomé
přijetí.

## Próza opět nesedí (počtvrté)

Tvrdila „RevPAR 3 876,80" a „71 active listings"; z `data[]` za dvanáct
uzavřených měsíců vychází **3 946,1** a **70**. Rozdíl je srpnem 2026,
který próza započítala. Strukturovaná data jsou zdroj, próza dekorace.

Spotřeba dnes: **13 dotazů.**

## OPRAVA zaokrouhlení

Ve zprávě jsem uvedl `nMean` 226 a 70. **Správně je 227 a 71.**
Počítal jsem to v Pythonu, jehož `round()` zaokrouhluje půlky k sudé
(226,5 → 226; 70,5 → 70), zatímco produkční `deriveBands` používá
`Math.round`, který půlky zvedá nahoru (→ 227, 71). Autorita je skript,
ne moje mezivýpočty.

Na závěrech to nemění nic: 71 je pořád v pásmu 50–99, takže váha
Vinohrad u 3BR zůstává **0,75**.
