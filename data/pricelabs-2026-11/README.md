# Přeměření operátorského faktoru 3.–4. 11. 2026

Trh: PriceLabs `market_research`, okno 2025_10..2026_09, geometrie
„Praha N official boundary" (openstreetmap), spárováno automaticky.
Vlastní strana: PriceLabs `get_bookings_report` (rental_revenue = Hospitable
guest.accommodation, ověřeno na 402 v 9/2026 rezervace po rezervaci),
EUR × 24,30, check-in 10/2025–9/2026, 740 rezervací.

## Nález: DPH u Booking.com
Booking.com vede 12% DPH jako samostatný řádek nad ubytováním; Airbnb ho má
v ceně. Tržní ceny (převážně Airbnb) ho obsahují. Vlastní Booking tržby se
proto pro srovnání násobí 1,12. Podíl Booking na tržbě: 402 67 %, 405 70 %,
302 49 %, free movies 59 %, Modern AC 30 %, Mozart 31 %.
Úklid v tržní avg_revenue NENÍ (avg_revenue ≈ ADR × avg_booked_nights, odchylka 1,5 %).

## Faktory (vlastní / avg_revenue téhož pásma, po korekci DPH)
- Praha 1 vs 2BR: 402 1,07 · 302 0,98 · 405 0,91 → ~0,99 (v modelu 1,032, beze změny)
- Praha 3 vs 2BR: Modern AC 1,46 (3–9/2026) · free movies 1,17 (5–9/2026) → 1,34, 12 bytoměsíců
- Praha 5 vs 1BR: Mozart 1,08 (3–9/2026) (v modelu 1,08, beze změny)
- Praha 4 Libuš: rozjezd, 2 plné měsíce, ~0,8–1,0; NEZAPSÁNO

Avg_revenue 2BR P1 (10/25..9/26): 109539 75001 158160 56698 54585 76782 109490 113836 93705 112941 103834 102392
Avg_revenue 2BR P3: 69284 50929 100604 37916 35261 53400 73774 80354 63030 75351 67521 67399
Avg_revenue 1BR P5: 49527 38288 70303 24580 26180 37914 51733 55774 44993 49287 49020 50961

## Rozhodnutí majitele 4. 11. 2026
Okresy bez měření mimo Prahu 1–3 (P4, P6–P10) dostávají veřejný CÍLOVÝ faktor
1,25 (`OPERATOR_TARGET_PUBLIC`). Není podložený měřením (portfolio ~1,06);
web to říká v calc_method_window. Interní underwriting zůstává 1,00.
