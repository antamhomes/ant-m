# PriceLabs deep dive 20. 10. 2026: čerstvý trh, faktor dnes, percentily

Navazuje na docs/calculator-model.md §6. Všechno níž je ZMĚŘENÉ z vrstvy
bez kvóty (Customer API „Nearby Listings“ kolem 11 vlastních listingů +
bookings report, 938 rezervací 8/2025–10/2026). Surová data a definiční
výhrady: data/pricelabs-capi-2026-10/ (README). Reprodukce: skript
analyze.py v session workspace; agregát vlastních tržeb je v CSV vedle dat.

## 1. Drift trhu po konci baked okna (7/2026) — YoY stejných měsíců

Mikrotrh (bin) · srpen / září / říjen 2026 vs 2025, tržba na listing:

- Nové Město 2BR (n≈230): **−6,6 % / +3,4 % / −5,8 %**, obsazenost −3,0 /
  −0,2 / −2,3 pb. Booking window 24→31 dní v říjnu (hosté rezervují dřív).
- Nové Město 1BR (kolem Rustic, n≈260): −7,8 % / +2,4 % / −6,6 %.
- Žižkov 2BR (n≈83): **−6,9 % / +0,6 % / −12,7 %**, obsazenost −5,2 /
  −1,3 / −5,6 pb. Nejslabší z pražských mikrotrhů.
- Žižkov/Hrdlořezy 2BR (free movies): −7,1 % / −0,4 % / −11,7 %.
- Smíchov 1BR (n≈233): **+3,5 % / +12,7 % / +1,6 %** — jediný silnější trh.
- Libuš 1BR (n≈165): −2,3 % / +3,4 % / −3,7 %; Libuš 2BR: +6,9 % / +20,4 %
  / +2,3 % (malé n).
- Mladá Boleslav 1BR (n≈22): srpen +2,4 %, ale **říjen −33 %** (tenký trh).

Závěr: baked okno (do 7/2026) není dramaticky zastaralé, ale P1/P3 trh
od léta MĚKNE o jednotky až desítku procent YoY, Smíchov naopak roste.
Refresh okna (→ 9/2026) by čísla v P3 spíš snížil; argument „čísla
nenafukujeme“ drží, argument „jsme 3 měsíce za trhem“ platí hlavně pro P3.

## 2. Vlastní byty proti okolním comps (stejný vendor, stejné měsíce)

Faktor = vlastní měsíční tržba za ubytování / tržba na listing okolního
trhu téhož binu. POZOR: benchmark „okolí“ je o 9–17 % NAD okresním
polygonem (viz README), takže tyhle faktory NEJSOU srovnatelné 1:1
s OPERATOR_EVIDENCE — měří tvrdší laťku.

- P1 Nové Město: 402 **1,07** · 405 0,92 · 302 0,93 (okno 8/25–7/26;
  v 8–9/2026 všechny ~o 5–9 pb níž). Přepočteno na okresní bázi
  (×1,082 offset NM/P1): ≈ 1,04 — sedí na OPERATOR_EVIDENCE 1,032.
- P3 Žižkov: Modern AC **1,22 v okně, 1,35 v 8–9/2026** — i proti tvrdší
  nearby lati. Potvrzuje, že P3 faktor 1,21 v repu není artefakt; spíš je
  konzervativní. free movies 1,02 okno → 1,18 čerstvě.
- P5 Smíchov: Mozart 0,91 okna proti nearby (Anděl, nejhustší konkurence,
  n 233); proti P5 polygonu s offsetem ≈ 1,07 — sedí na repo 1,08.
- P4 Libuš (B-dům, jen 2 plné měsíce, rozjezd): B01 0,76 · B02 0,67 ·
  B04/B05 bez plného měsíce · Loft B03 0,88. Obsazenost 94–100 % při
  nízkém ADR = klasický ramp-up; navíc nearby okruh v Libuši sahá do
  dražších čtvrtí. Pro OPERATOR_EVIDENCE praha4 to zatím NENÍ použitelné
  měření (krátké okno + špatná báze) — nezapisovat.

Portfolio proti okolním comps ≈ 0,98; proti okresním polygonům (po
offsetu) ≈ 1,05–1,10. Konzistentní s webovým defaultem 1,10 jako horní
realistickou hranou a s měřenými 1,03–1,21.

## 3. Percentily a „defensible upper“

Budoucí nabídkové ceny (12 m dopředu, průměr): p75/p50 = 1,27–1,41,
p90/p50 = 1,65–2,37 podle mikrotrhu. **Median BOOKED price je všude
≈ p25–p50 nabídek** (NM 2BR: ask p50 4 573, booked 4 045 = 0,88×) —
trh se reálně prodává POD nabídkovým mediánem. To je datový podklad
strategie „plná obsazenost za 63–77 % tržního ADR“ a zároveň důvod,
proč horní konec kalkulačky nekotvit na nabídkové percentily: byly by
to ceníky, ne realizace.

## 4. Co z toho plyne pro model (nic z toho se nemění bez předregistrace)

1. Refresh okna přes market_research má smysl hlavně kvůli P3 (trh měkne)
   a novým vahám OPERATOR_EVIDENCE; očekávaný směr: P3 mírně dolů,
   Smíchov mírně nahoru, P1 ±.
2. OPERATOR_EVIDENCE: Modern AC drží 1,2+ i čerstvě a proti tvrdší lati;
   až doběhne nové okno, váha P3 může jít nahoru. B-dům do evidence až
   po celé sezóně A po vyjasnění báze (nearby ≠ polygon).
3. Tržní kotva v kalkulačce (patch 136) je bezpečně POD nearby realitou
   mikrotrhů kolem vlastních bytů (okresní polygon je o 9–17 % níž) —
   další důvod, proč je obhajitelná.
4. Booking window se v P1/P3 prodlužuje (24→31 dní) — provozní signál
   pro pricing, do webu nejde.
