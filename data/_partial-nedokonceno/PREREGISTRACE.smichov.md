# Předregistrace: Smíchov

Zapsáno **2026-09-04 11:02 UTC, PŘED prvním voláním PriceLabs** (commit
před pullem, aby bylo z gitu vidět, že se nic nedopisovalo dodatečně).
Všechno níž je **diagnostický spouštěč, ne kritérium přijetí.** Naměřená
pásma platí bez ohledu na to, jestli se s tímhle shodnou.

## Proč Smíchov

Jediný kontext `praha5/smichov` (LTR efekt **+7,73 %, n=101** — nejlepší
nájemní vzorek ze všech čtvrtí). Praha 5 má jako jediný z rodičů dosud
integrovaných čtvrtí **všechna tři pásma měřená a spolehlivá** (1BR nMin 408,
2BR 158, 3BR 65), takže případné 3BR Smíchova se bude míchat do MĚŘENÉ
okresní buňky, ne do odvozené jako u Žižkova. Antam v Praze 5 provozuje
(operátorský faktor měřený 1,08), a pořadí fronty říká „nejdřív čtvrti,
kde Antam provozuje".

Otázka, na kterou pull odpovídá: **nájem říká, že Smíchov je o 7,7 % dražší
než zbytek Prahy 5. Ukáže STR podobnou prémii, nebo je Praha 5 na STR
jednolitá jako Praha 3?** (Žižkov: LTR −3,8 %, STR 1BR/2BR −1,5 % — nájemní
rozestup se na STR skoro nepřenesl.)

## Výchozí stav (Smíchov v `MARKET_CTVRT` není → okres Praha 5)

| | roční výnos (DB `annual_rev`) | ADR | RevPAR | nMean | nMin |
|---|---|---|---|---|---|
| 1BR | 538 013 | 2 259 | 1 579,7 | 452 | 408 |
| 2BR | 794 662 | 3 378 | 2 363,4 | 183 | 158 |
| 3BR | 1 267 399 | 5 599 | 3 710,5 | 74 | 65 |

`2BR/1BR = 1,477` · `3BR/1BR = 2,356` (okres sám).

## Poměrový model

Předpovídá `2BR/1BR = 1,567`, `3BR/1BR = 2,427`.
Dosavadní odchylky: Nové Město −1,1 % / +3,2 %, Vinohrady +3,3 % / −3,7 %,
Žižkov −5,8 % / **+15,6 %** (3BR při n=44, hlučné).

## Očekávaný vzorek a VÁHA — S POKOROU

Žižkov naučil, že odhad podílu čtvrti na okresu je nejslabší část
předregistrace (čekáno 35–45 %, vyšlo 86 %). Praha 5 (MČ: Smíchov, Košíře,
Motol, Radlice, Jinonice, Hlubočepy/Barrandov) má STR soustředěné kolem
Anděla, ale Košíře a Barrandov nejsou prázdné. Bodový odhad ~65 %,
**nízká důvěra**; proto široké pásmo.

| podíl na P5 | 1BR | 2BR | 3BR |
|---|---|---|---|
| 50 % | 226 (w 1,00) | 92 (w 0,75) | 37 (w 0,50) |
| 65 % | 294 (w 1,00) | 119 (w 1,00) | 48 (w 0,50) |
| 80 % | 361 (w 1,00) | 147 (w 1,00) | 59 (w 0,75) |

3BR skončí nejspíš na váze 0,5 (25–49) nebo 0,75 (50–99); váha 0 by
znamenala podíl pod ~34 %, což by samo o sobě byl spouštěč #4. Připomínka:
`ctvrtWeight` váží **nMean**, ne nMin.

## Spouštěče vyšetřování (NE zamítnutí)

1. `2BR/1BR` mimo 1,30–1,70 → prověřit geometrii a vzorek.
2. `3BR/1BR` mimo 1,40–2,90 → totéž.
3. `active_listings` 1BR nad ~400 (≈ 90 % celého P5) → polygon moc široký.
4. Podíl na P5 mimo **40–85 %** → prověřit (širší než u Žižkova záměrně).
5. Podíl **nestabilní** mezi měsíci (rozptyl přes ±3 p. b.) → podezření na
   překryv/jinou geometrii; u Žižkova byl 0,85–0,86 ve všech 12 měsících,
   to je otisk podmnožiny.
6. RevPAR Smíchova pod okresem ve všech pásmech → v rozporu s LTR prémií
   +7,7 %; není to chyba dat, ale je to zjištění k zaznamenání.

## Schválení geometrie — OTEVŘENÉ

Pro Smíchov schválený řetězec **neexistuje**. Dotaz pojmenuje hranici
výslovně (vzor: „Smíchov, Prague, official OpenStreetMap boundary,
1-bedroom. …"), po prvním úspěšném pásmu STOP a člověk schvaluje
`selected_geometry_label` + `selected_geometry_source` znak po znaku.
Podle vzoru tří předchozích to nejspíš bude `Smíchov official boundary` +
`openstreetmap`, ale **předpokládat se to nesmí**.

## Postup

SOP §14 a §15: výslovné pojmenování hranice v KAŽDÉM dotazu, session_id
jen jako pin, ověření labelu + zdroje u každého pásma zvlášť, `pl-raw.mjs`
před jakoukoli transformací, nadmnožina měsíců se ořízne jen kalendářním
pravidlem, chybějící/duplicitní měsíc = tvrdý STOP. Bez poměrového
dopočtu. Kvóta: před prvním dotazem Smíchova použity 3 pokusy okna
(10:38 UTC), rezerva ≥ 4 splněna.
