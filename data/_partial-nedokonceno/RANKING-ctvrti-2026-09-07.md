# Pořadí zbývajících čtvrtí GEO registru (7. 9. 2026, bez kvóty)

19 čtvrtí v `GEO`, které nejsou v `MARKET_CTVRT` (Vysočany vyřazeny —
`partial` rozhodnutím člověka, znovu se nepullují). Kritérium: **očekávaný
dopad na veřejný výstup kalkulačky na jeden dotaz PriceLabs** (3 dotazy
na čtvrť), ne prestiž, ne zbývající kvóta.

Vstupy: `MARKET_STR` (okresní n/nMin po pásmech), `MARKET_CTVRT` (už
změřené podíly), LTR efekt z `GEO`, dopočtený zbytek okresu = okresní
n − známé čtvrti (Libeň leží skoro celá v P8: P8 zbytek ≈ 0, P9 zbytek
≈ 52 u 1BR). Odhady vzorku jsou hrubé (±50 %), váhy podle
`ctvrtWeight(nMean)`: ≥ 100 → 1 · ≥ 50 → 0,75 · ≥ 25 → 0,5 · jinak 0.

| # | čtvrť | rodič(e) | LTR efekt (n) | okres 1BR/2BR/3BR nMean (nMin) | zbytek okresu 1BR/2BR | odhad 1BR / 2BR / 3BR | váhy 1BR / 2BR / 3BR | kontexty | rodič odvozený | hodnota |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** | **Bubeneč** | praha6 (k.ú. zasahuje i do P7 — GEO má jen praha6) | +1,4 % (16) | 155 (144) / 83 (79) / 3BR odv. | 121 / 63 | **40–70** / 20–35 / 2–6 | **0,5–0,75** / 0–0,5 / 0 | 1 (praha6; P7 díl polygonu se nepřipojí, jako Nusle-P2) | 3BR ano → 4BR žádné | **VYSOKÁ**: P6 má jen Dejvice (22 %, +14 %); Bubeneč je největší centrální kus zbytku, odchylka ±10–15 % pravděpodobná, může hýbat 1BR i 2BR |
| **2** | **Strašnice** | praha10 | −0,4 % (37) | 199 (193) / 65 (58) / 3BR odv. (neověřené) | 59 / 29 | **25–40** / 10–15 / 1–3 | **0,5** / 0 / 0 | 1 | 3BR ano | **STŘEDNÍ**: největší kus „zbytku P10" (1 252, −8 % pod Vršovicemi); ověří, jestli vršovická prémie je reálná; 1BR na 0,5 hýbe výsledkem o ~−3 až −5 % |
| 3 | Hlubočepy (Barrandov) | praha5 | −1,3 % (37) | 452 (408) / 183 (158) / 74 (65) | 56 / 30 | 20–35 / 8–15 / 2–5 | 0–0,5 / 0 / 0 | 1 | ne (P5 má vše měřené) | STŘEDNÍ−: třetí kontext P5, periferie, hraniční váha |
| 4 | Břevnov | praha6 | +0,3 % (15) | 155 / 83 / odv. | 121 / 63 (s Bubenčí sdílené) | 20–35 / 10–20 / 1–4 | 0–0,5 / 0 / 0 | 1 | 3BR ano | NÍZKÁ+: hraniční váha, LTR ≈ 0 |
| 5 | Michle | praha4 | +0,5 % (22) | 184 (158) / 69 (60) / 3BR odv. | 72 / 32 | 15–25 / 6–12 / 0–2 | 0–0,5 / 0 / 0 | 1 | 3BR ano | NÍZKÁ: pravděpodobně inertní |
| 6 | Krč | praha4 | −0,9 % (21) | — | 72 / 32 | 10–20 / 5–10 / 0–2 | 0 / 0 / 0 | 1 | ano | NÍZKÁ: inertní |
| 7 | Stodůlky | praha5 | **−4,6 % (48)** | — | 56 / 30 | 10–20 / 5–10 / 0–2 | 0 / 0 / 0 | 1 | ne | NÍZKÁ: silný LTR efekt, ale STR vzorek pod váhou |
| 8 | Braník | praha4 | −1,0 % (16) | — | 72 / 32 | 10–20 / 4–8 / 0–2 | 0 / 0 / 0 | 1 | ano | NÍZKÁ |
| 9 | Ruzyně (letiště) | praha6 | −0,6 % (12) | — | 121 / 63 | 15–30 / 8–15 / 0–3 | 0–0,5 / 0 / 0 | 1 | ano | NÍZKÁ: letištní produkt, nereprezentativní pro majitele v P6 |
| 10 | Prosek | praha9 | −1,2 % (14) | 76 (64) / 2BR odv. / 3BR odv. | 52 / ~20 | 10–25 / 3–8 / 0–2 | 0 / 0 / 0 | 1 | 2BR i 3BR | NÍZKÁ: inertní (viz Vysočany 21) |
| 11 | Hloubětín | praha9 | +0,2 % (19) | — | 52 / ~20 | 8–20 / 2–6 / 0–2 | 0 | 1 | ano | NÍZKÁ: inertní |
| 12 | Modřany | praha4 | +0,5 % (22) | — | 72 / 32 | 8–15 / 3–8 / 0–1 | 0 | 1 | ano | NÍZKÁ: inertní |
| 13 | Chodov | praha4 | −0,0 % (24) | — | 72 / 32 | 8–15 / 3–8 / 0–1 | 0 | 1 | ano | NÍZKÁ: inertní |
| 14 | Záběhlice | praha10 | −1,8 % (18) | — | 59 / 29 | 5–12 / 2–6 / 0–1 | 0 | 1 | ano | NÍZKÁ: inertní |
| 15 | Hostivař | praha10 | +0,1 % (18) | — | 59 / 29 | 5–10 / 2–5 / 0–1 | 0 | 1 | ano | NÍZKÁ: inertní |
| 16 | Kobylisy | praha8 | −3,0 % (19) | 350 (336) / 92 (86) / 3BR odv. | ≈ 0 / ≈ 0 | 5–15 / 2–6 / 0–2 | 0 | 1 | 3BR ano | NÍZKÁ: Karlín + Libeň = celé P8, inertní |
| 17 | Troja | praha8 | −0,8 % (14) | — | ≈ 0 | 3–10 / 1–4 / 0–1 | 0 | 1 | ano | NÍZKÁ: inertní |
| 18 | Černý Most | praha9 | −1,2 % (12) | — | 52 | 3–10 / 1–4 / 0 | 0 | 1 | ano | NÍZKÁ: inertní, možná `data:null` |
| — | Vysočany | praha9 | +0,8 % (37) | — | — | změřeno 21 | 0 | 1 | ano | `partial` rozhodnutím člověka, nepulluje se |

**Výběr: #1 Bubeneč, #2 Strašnice.** Nic jiného dnes. Bubeneč 3 dotazy
(11–13), pak Strašnice jen když po ní zůstanou ≥ 4 (14–16 → zbývá 4:
ano, těsně). Rezerva 4 se neutrácí.

Poznámka k Bubenči: k.ú. Bubeneč leží v P6 i P7 (díl u Stromovky /
Výstaviště). GEO má jen `praha6/bubenec`, takže `parents: ["praha6"]`
(precedens Nusle: katastrální dílek v jiném okresu kontext nezakládá).
Polygon PriceLabs ale díl P7 zahrne → podíl na P6 bude nadsazený a
spouštěč „n nad zbytkem P6" se musí číst s tolerancí ≈ +40 (zbytek P7
bez Holešovic). Zapsáno v předregistraci.
