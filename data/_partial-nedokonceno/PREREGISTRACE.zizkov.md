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

---

## Pokus 1: KVÓTA VYČERPÁNA — žádná data

```
success:false  status_code:429  ERR-MCP-RATE-LIMITED
"You have used all 20 Market Research requests on this account.
 The 20 are counted over a 24 hour window that starts at your first
 request, so all of them become available again in 21 hours and 43 minutes."
```

Odmítnuto **před** jakýmkoli dotazem na trh, takže se nic nestáhlo,
nic nezachytilo a Žižkov zůstává nedotčený. Předregistrace platí dál.

Zamítnutí přišlo 2026-09-02 17:35 UTC → **kvóta se obnoví
2026-09-03 v 15:18 UTC**.

## Pokus 2 (2026-09-04 10:38 UTC): 1BR ÚSPĚCH — čeká na schválení geometrie

Dotaz doslova: `Žižkov, Prague, official OpenStreetMap boundary, 1-bedroom.
For each month from August 2025 through July 2026 give: occupancy rate,
ADR, RevPAR, number of active listings, and average revenue per active listing.`

- `selected_geometry_label`: **`Žižkov official boundary`**
- `selected_geometry_source`: **`openstreetmap`**
- `market_label`: `Žižkov, Prague` · session `lg_sess_5ex-Oc5yZ4Jpczs3L7RoXWQmkAmTAI8v` · geometry_token: žádný
- okno: 12/12 měsíců `2025_08..2026_07`, žádná nadmnožina, 0 vyřazených řádků
- syrová obálka: `data/pricelabs-raw/zizkov.1BR.raw.json`, raw_sha256 `cfc82183…`
- kvóta: 1. pokus tohoto okna (okno ukotveno 10:38 UTC); stav před ním neznámý
  (autorun 3. 9. 15:20 UTC běžel bez připojené složky, nic nezapsal, počet
  jeho volání nelze ověřit) → počítej konzervativně.

### Spouštěče — #3 a #4 SEPNULY (diagnostika, ne zamítnutí)

| | P3 okres | Žižkov | podíl |
|---|---|---|---|
| n (průměr) | 625,9 | 537,1 | **0,858** |
| n (min) | 592 | 510 | |
| RevPAR (průměr) | 1 568,9 | 1 545,0 | 0,985 |

Podíl 86 % je mimo očekávaných 25–60 %. Ale: podíl je **0,85–0,86 v každém
z 12 měsíců** (stabilní, jak se chová podmnožina, ne překryv), RevPAR
Žižkova je pod okresem (0,95–1,01 podle měsíce), a dopočtený zbytek P3
(n ≈ 89, RevPAR ≈ 1 714) sedí na vinohradskou úroveň (Vinohrady celé
1 670). Stejné okno jako okres (`praha3.json`, pulled 2026-08-30, tytéž měsíce).

Závěr diagnostiky: **polygon není moc široký; špatný byl předpoklad
předregistrace**, že P3 je z 55–65 % Vinohrady. Na STR je Praha 3 ze
~86 % Žižkov. Vinohradská část P3 je ~14 % nabídky.

Důsledek pro váhy (přepočet z podílu 0,86): 2BR ≈ 154 (**w 1,0**, ne 0,75),
3BR ≈ 40 (**w 0,5**, ne 0). Otevřená otázka k integraci: P3 3BR je v okresním
souboru označen UNRELIABLE (n ≈ 46 < 50) — jak se chová blend, když čtvrť
dostane w 0,5 a okres sám je pod prahem spolehlivosti. Řešit až při
integraci, s čísly v ruce; nic nepředjímat.

Schválení geometrie: **OTEVŘENÉ**, čeká na člověka.

## Pokusy 3 a 4 (2026-09-04 10:45 / 10:46 UTC): 2BR a 3BR ÚSPĚCH

Geometrie schválena člověkem znak po znaku (`Žižkov official boundary` +
`openstreetmap`). 2BR i 3BR položeny v téže session s výslovným pojmenováním
hranice; u obou vrácen **stejný** `selected_geometry_label` + `_source`,
ověřeno zvlášť. 12/12 měsíců, 0 vyřazených řádků, žádná nadmnožina.

| pásmo | ADR | RevPAR | occ | nMean | nMin | podíl na P3 | RevPAR/P3 | raw_sha256 |
|---|---|---|---|---|---|---|---|---|
| 1BR | 2 085 | 1 545,0 | 73,5 % | 537 | 510 | 0,858 | 0,985 | cfc82183… |
| 2BR | 3 052 | 2 279,6 | 73,8 % | 152 | 135 | 0,850 | 0,990 | 2322d061… |
| 3BR | 6 006 | 4 333,9 | 71,7 % | 44 | 38 | 0,948 | 1,029 | 1da04923… |

Artefakt: `data/pricelabs-2026-09/zizkov.json`, sha256 `dcddc021…`, basis
measured u všech tří pásem, `raw_provenance` u všech tří.

Spouštěče: #1 `2BR/1BR = 1,476` v pásmu 1,30–1,70 (poměrový model 1,567 →
odchylka −5,8 %; okres P3 sám 1,474). #2 `3BR/1BR = 2,805` v pásmu
1,40–2,90, těsně pod horní mezí (poměrový model 2,427 → +15,6 %, zatím
největší odchylka; n=44, takže je to hlučné měření, ne důkaz proti modelu).
#3, #4 sepnuly u 1BR (viz Pokus 2) a diagnostika je uzavřela. #5: podíly
0,86/0,85/0,95 stabilní → Žižkov je podmnožina P3, ne překryv.

Kvóta: 3 pokusy tohoto okna (10:38–10:46 UTC), všechny úspěšné.

Váhy z naměřeného: 1BR w 1,0 · 2BR w 1,0 (nMean 152) · 3BR **w 0,5**
(nMean 44; `ctvrtWeight` váží nMean, ne nMin). Případ 3BR viz samostatná
inspekce před integrací — STOP na pokyn člověka.
