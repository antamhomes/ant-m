# PriceLabs CAPI pull 20. 10. 2026 (nearby listings kolem vlastních bytů)

Zdroj: MCP `get_listing_neighborhood_market` (Customer API, zdroj „Nearby
Listings“, bez kvóty) pro 11 vlastních listingů, + `get_bookings_report`
(938 rezervací, check-in 8/2025–10/2026) agregovaný do
`own-monthly-revenue.csv` (tržba za ubytování `rental_revenue`, bez
úklidového poplatku `extra_charges`; noci rozpočítané rovnoměrně na
kalendářní měsíce; EUR rezervace přepočtené plochým kurzem 24,30 CZK/EUR —
citlivost ±1,2 % kurzu = ±0,6 % na faktorech; surové rezervace se do repa
záměrně neukládají).

Soubory `<listing>.json` = celé odpovědi CAPI: Market KPI (měsíční řady
10/2024–10/2026 po binech ložnic: Revenue, Booked/Available Days, Booking
Window, LOS, pickup), Future Percentile Prices (p25/50/75/90 + median
booked, 13 měsíců dopředu), Future Occ vs STLY. `b01.json` platí i pro
B02, `b04.json` i pro B05, `402/405/302` sdílejí Nové Město.

POZOR na definice (plyne z analýzy, viz docs/pricelabs-audit-2026-10.md):

1. „Nearby Listings“ NENÍ oficiální polygon čtvrti. Na shodném okně
   8/2025–7/2026 je nearby benchmark o 9–17 % NAD artefakty z
   market_research (NM 2BR 92,2k vs 84,7k; Žižkov 2BR 74,9k vs 64,7k;
   Smíchov 1BR 52,2k vs 44,7k). Faktory měřené proti nearby proto vychází
   o ~10–15 % níž než OPERATOR_EVIDENCE proti polygonu. NIKDY nemíchat
   obě báze v jednom čísle.
2. Tržba trhu (Revenue) může obsahovat úklidové poplatky; vlastní strana
   je bez nich. Bias jde proti nám (konzervativní směr).
3. Do modelu kalkulačky tahle data NEVSTUPUJÍ (jiná geometrie). Slouží ke
   kalibraci, driftu a validaci.
