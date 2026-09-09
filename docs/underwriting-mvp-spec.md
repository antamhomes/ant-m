# Antam: interní vyhodnocovač bytu, specifikace MVP

Verze 3, 9. 9. 2026. Schváleno s pěti rozhodnutími a jednou opravou (viz 11). Implementace fáze 1 je odblokovaná po odsouhlasení tohohle diffu.

Verze 1 téhle specifikace byla přebouchaná: tři tabulky, devět stavů, pět obrazovek. Varoval jsi přesně před tím a stejně to tak vylezlo. Tohle je přepis podle toho, co jsi popsal: **napíšu adresu, dispozici a m², a ono mi řekne, jestli to stojí za další práci.**

Značky: **[DEC]** tvoje rozhodnutí · **[SPEC]** můj návrh k odsouhlasení · **[OPEN]** chybějící konstanta · **[INV]** testovaný invariant.

---

## 0. Dvě různé otázky, dvě různé věci

| | Otázka | Vstup | Výstup | Kdy |
|---|---|---|---|---|
| **Vyhodnocení** (fáze 1) | Stojí to za další práci? | adresa, dispozice, m² | 🟢 STOJÍ · 🟡 K RUČNÍMU POSOUZENÍ · 🔴 NESTOJÍ | během hovoru, do tří sekund |
| **Upsání** (fáze 2) | Má to Antam vzít a napsat na to podlahu? | brány, fakta o bytu, prohlídka, ruční úpravy | ACCEPT · REVIEW · DECLINE | po hovoru a prohlídce |

**[DEC]** Fáze 1 nikdy nevydá ACCEPT. Rozhoduje jenom o tom, jestli zvednout telefon, chtít fotky a jet se podívat.

**Fáze 1 je celý MVP.** Fáze 2 se staví až po třech ručních posouzeních, podle toho, co se z nich naučíš.

---

## 1. Kontext použití, protože mění design

Voláš na stojící inzeráty. V inzerátu je adresa, dispozice a metry. Nástroj tedy běží **během hovoru, na mobilu, jednou rukou**, zatímco majitel mluví.

Z toho plyne:
- jedna obrazovka, tři pole, jedno tlačítko;
- výsledek pod sekundu, žádný spinner;
- verdikt čitelný **bez čtení čísel**, barva a jedno slovo;
- čísla pod tím pro tebe, ne pro majitele;
- funguje na mobilu jako první, ne jako druhá varianta.

**[SPEC]** Není to obrazovka v portálu za třemi kliky. Je to samostatná stránka na vlastní URL, kterou máš na ploše telefonu.

---

## 2. Obrazovka 1: vstup

```
Adresa            [ Vinohradská 123                   ]  text, ukládá se jak napsáno
Praha             [ 1  2  3  4  5  6  7  8  9  10 ]
Čtvrť             [ Vinohrady  Vršovice  …  Ostatní ]     podle zvoleného okresu
Dispozice         [ 1kk  2+kk  3+kk  4+kk ]
Plocha            [ 58 ] m²
Současný nájem    [        ] Kč / měsíc   (nepovinné)

                  [ VYHODNOTIT ]
```

**[DEC] Žádné geokódování ve v1.** Okres a čtvrť se vybírají ručně, adresa je jen text a ukládá se přesně tak, jak ji napíšeš.

Důvod je jednoduchý: ekonomické rozhodnutí nesmí tiše viset na špatném geokódu. Dva taps navíc jsou levnější než jeden tichý omyl v tržní buňce. Zároveň se tím z jednoduchého nástroje nestane geokódovací projekt.

Datový model ale počítá s pozdějším doplněním, aby to nechtělo migraci: `geo_source` enum(`manual`,`geocoded`) a `geo_confidence` existují od začátku a ve v1 jsou vždy `manual` a `null`.

**[DEC]** Po zhruba 50 vyhodnoceních se rozhodne, jestli ušetřené taps za geokódování stojí.

**[INV] L1** Bez zvoleného okresu se verdikt nezobrazí.

---

## 3. Obrazovka 2: výsledek

```
🟢  STOJÍ ZA PROVĚŘENÍ

Vinohrady · Praha 2 · 2+kk · 58 m²          Vinohradská 123

Screeningový baseline           52 000 – 58 000 Kč / měsíc
Nájem plus energie (podlaha)    33 400 Kč / měsíc
Rozdíl                          +18 600 Kč / měsíc · +223 000 Kč / rok
Násobek proti nájmu             1,56×
Rezerva nad podlahou            56 %

Veřejná kalkulačka ukazuje      61 000 Kč   (rozdíl −8 %, jen pro srovnání)

Data      měřená buňka · vzorek n=63 · 12 měsíců do 7/2026
Jistota   vysoká
Faktor    Praha 2 bez měření → interní 1,00 (veřejně 1,10)

Proč: silný rozestup proti nájmu, měřená buňka, dostatečný vzorek.

⚠ Před branami a před konkrétním bytem. Není to nabídka ani finální underwriting.

        [ POKRAČOVAT V PROVĚŘENÍ ]     [ ZAHODIT ]
```

Řádek `Faktor` je tam schválně. Dokud u okresu není měření, má to být vidět při každém vyhodnocení, ne schované v nastavení.

---

## 4. Verdikt

| | Podmínka | Znamená |
|---|---|---|
| 🟢 **STOJÍ ZA PROVĚŘENÍ** | rezerva ≥ 35 % a buňka měřená a `n ≥ 50` | tlač na adresu, fotky, prohlídku |
| 🟡 **K RUČNÍMU POSOUZENÍ** | rezerva 10 až 35 %; **nebo** rezerva ≥ 35 %, ale buňka dopočtená nebo `n < 50` | podívej se na to, ale ne dnes; do týdenní dávky |
| 🔴 **NESTOJÍ** | rezerva < 10 % | slušně ukonči, pošli data za čtvrť, jdi dál |

**[DEC] Prahy v0:** `WORTH_MIN = 0,35`, `REVIEW_MIN = 0,10`.

Zdůvodnění, které je součástí rozhodnutí, ať se za měsíc neztratí: **fáze 1 není rozhodnutí o přijetí.** Její cena za omyl je asymetrická. Když pustí horší byt do žluté, stojí to pár minut pozornosti. Když omylem hodí dobrý byt do červené, zahodíš jednotku, na které bys vydělával roky. Proto je pre-screen citlivější a finální underwriting smí být brutálně konzervativní.

**[DEC]** Tohle jsou v0 prahy, ne ekonomika. Ukládá se spojité `buffer_pct`; po prvních 20 až 30 vyhodnocených bytech se reportuje rozdělení a kolik ze zelených, žlutých a červených nakonec postoupilo nebo umřelo. **Do té doby se neladí.**

**[SPEC] Žlutá má dvě různé populace a je potřeba je rozlišit ve výstupu**, jinak z ní bude hromada „možná“, kterou nikdy nezpracuješ. Proto se ukládá a zobrazuje `verdict_reason`:

| `verdict_reason` | Co to je | Co s tím |
|---|---|---|
| `thin_evidence` | ekonomika dobrá (≥ 35 %), ale dopočtená buňka nebo malý vzorek | tohle honit dřív: chybí důkaz, ne peníze |
| `marginal_spread` | rezerva 10 až 35 %, důkaz v pořádku | tohle honit později: peníze jsou těsné |

**[SPEC] Předpověď, ať se dá zkontrolovat.** Ze skladby veřejného modelu (medián 1,53× nájem, pásma 29 / 54 / 16 %) a z toho, že screeningová cesta srazí poměr zhruba o 12 až 15 %, čekám zhruba **25 až 30 % zelených, 45 až 50 % žlutých a 20 až 25 % červených**. Když ti po třiceti vyhodnoceních vyjde něco výrazně jiného, není špatně prah, ale můj odhad skladby trhu, a to je užitečnější zjištění.

---

## 5. Výpočet

Počítá edge function `evaluate` v projektu webu, **generovaná při buildu z `yield.ts`**, stejným vzorem jako `supabase/functions/mcp/index.ts`.

**[SPEC]** Proč ne kopie modelu do portálu: dvě implementace se rozejdou. Tohle je jedna, a nástroj si ukládá `model_version` u každého vyhodnocení, takže rozjezd je vidět.

### 5.1 Tržní buňka
`bandForSize(size, m2)` → `BAND_BLEND` → `marketCell(loc, band)`. Odpověď nese `derived` a `nMin`.

### 5.2 Konzervativní odhad, tři a jen tři odchylky od veřejné cesty

1. **Operator factor** = `OPERATOR_EVIDENCE[okres].measured`, když existuje, jinak **1,00**. Nikdy 1,10, nikdy `publicFactorFrom`. Praha 1 vyšla 1,032 a Praha 5 1,08, tedy dvě ze tří solidních měření pod výchozí 1,10. Výchozí uplift je bez důkazu a u garantovaného bytu teče rovnou do rezervy.
2. **Band blend** na spodní hraně (`weight = 0`), místo váženého středu. Neznámá konfigurace se u upisování řeší dolů, ne doprostřed.
3. **Availability 0,92** beze změny. Není to opatrnost, je to převod RevPAR na tržbu na inzerát.

`screening_baseline = cons_low`. **[DEC]** Spodní hrana rozpětí, ne střed.

**[DEC] Přesné názvosloví, protože na tom záleží.** Tohle je `screening_baseline`, konzervativní podklad pro screening rizika. **Není** to naše očekávaná tržba. Fáze 2 se od něj může pohnout **oběma směry**, jakmile je znám konkrétní byt. Slovo `expected` se v kódu ani v UI nepoužívá.

**[DEC]** Žádný address-level uplift se nedopočítává automaticky nikdy. Terasa, výhled, parkování, reálná kapacita ani stav nezvednou baseline samy: musí je někdo zadat jako ruční úpravu ve fázi 2, s důvodem a jistotou.

### 5.3 Podlaha a rezerva

```
floor_monthly = rentFor(okres, dispozice, skutečné m², "mix", čtvrť) + ENERGY[dispozice]
buffer_pct    = screening_baseline / floor_monthly − 1
ratio_to_rent = screening_baseline / ltr_monthly        (POZOR: bez energií)
```

**OPRAVA 9. 9. 2026: podlaha nestojí na Deloitte.** Spec v3 to tvrdil podle rozhodnutí z 30. 8., ale kód mezitím říká opak. `yield.ts` u nájemního modelu doslova uvádí, že Deloitte Rent Index Q2/2026 „zůstává jako kotva v testu (±12 %), do výpočtu už nevstupuje“. Peníze počítá `rentFor` na 1 354 čerstvých pražských inzerátech ze Sreality (8/2026), Kč/m² klesající s plochou podle celopražské mocninné křivky, úroveň drží čtvrť.

Pro use case „adresa plus dispozice plus skutečné m²“ je to i věcně lepší: bere reálnou plochu a čtvrť místo kbelíků 40 / 60 / 85 m². Deloitte zůstává tam, kam patří, jako sanity kotva v `facts.test.ts`.

**Dva různé jmenovatele, nezaměnitelně popsané v UI.** `ratio_to_rent` je proti samotnému nájmu, `buffer_pct` proti podlaze, tedy nájmu plus energiím. Byt může mít násobek 1,23× a přitom rezervu jen 9 %, protože energie u 2+kk dělají 3 500 Kč, tedy zhruba 15 % nájmu. Popisky v nástroji to říkají natvrdo, aby se ta dvě čísla nedala porovnávat mezi sebou.

Když zadáš současný nájem, ukáže se jako druhý srovnávací sloupec, ale **do verdiktu nevstupuje**: podlaha stojí na modelu, ne na tom, co majitel dneska vybírá.

### 5.4 Jistota
Odvozená, ne zadaná: `vysoká` = měřená buňka a `n ≥ 50` a měřený operator factor okresu. `střední` = měřená buňka, ale bez měřeného faktoru okresu, nebo `n` 25 až 49. `nízká` = dopočtená buňka nebo `n < 25`.

---

## 6. Co se ukládá

Jedna tabulka, `evaluations`. Zapisuje se **každé** vyhodnocení, i to zahozené.

`id`, `created_at`, `author`, `address_raw`, `geo_source` enum(`manual`,`geocoded`), `geo_confidence` null, `district`, `ctvrt`, `size`, `m2`, `current_rent` null, `model_version`, `data_window`, `public_monthly`, `cons_low`, `cons_high`, `screening_baseline`, `floor_monthly`, `buffer_pct`, `cell_derived`, `n_min`, `operator_factor_used`, `operator_measured` bool, `confidence`, `verdict`, `verdict_reason` null, `action` enum(`continue`,`discard`,`none`), `source` enum(`phone`,`web`,`agent`,`vn_network`,`referral`), `note`.

**[DEC]** `geo_source` a `geo_confidence` existují od začátku, i když jsou ve v1 vždy `manual` a `null`. Geokódování se pak přidá bez migrace.

Proč ukládat i zahozené: je to zadarmo a je to tvůj jediný zdroj pro experiment E5 z OS, tedy jak se liší veřejné číslo od interního, a pro to, jak vlastně vypadá trh, na který voláš. Po měsíci volání z toho vypadne rozložení rezerv v Praze, které dnes nikdo nemá.

**[INV] E1** Vyhodnocení je neměnný záznam. Změna vstupu vytvoří nový řádek, nepřepíše starý.

---

## 7. Fáze 2, až po třech ručních posouzeních

Spustí se tlačítkem POKRAČOVAT, a teprve tehdy vznikne „případ“ nad vyhodnocením. Sem patří to, co jsem minule dal do MVP a nepatřilo tam:

- sedm bran ručně (SVJ, právní použitelnost, vlastnictví, nájemník, hypotéka, připravenost k focení, noci pro majitele);
- fakta o bytu (přesné m², patro, výtah, reálná lůžka, stav, terasa a výhled, náklad na dovybavení);
- ruční úpravy **oběma směry**, každá povinně s důvodem, jistotou, autorem a časem, v append-only tabulce, která je zároveň audit i budoucí kalibrační dataset. Lepší reálná kapacita, terasa, výhled, parkování nebo mimořádný stav baseline zvednou; brány a špatný stav ho srazí. **[DEC]** Z prvních pár případů se nesmí odvodit pravidlo: přepis úprav na koeficienty je samostatná kalibrační úloha po dostatečném počtu opakovaných případů.
- finální rozpětí, navržená podlaha, rezerva v Kč a %, pro rata snížení podlahy za blokované noci (2/365, 3/365 v sezóně);
- verdikt ACCEPT / REVIEW / DECLINE;
- dvě tlačítka: **GENEROVAT PITCH DECK** a **GENEROVAT ODMÍTNUTÍ**;
- pole registru garancí ve stejném řádku, včetně měsíce výročí a nároků při šoku 10, 20 a 30 %.

Kontrakty pro deck a pro odmítnutí napíšu, až budeš mít ty tři ruční posouzení, protože ta určí, co v decku vlastně musí být.

---

## 8. Co MVP záměrně NEUMÍ

1. **Žádné koeficienty** za terasu, výtah, patro, výhled, lůžka, stav, parkování. Ani jako návrh. **[DEC]**
2. Žádná predikce, regrese, ML, doporučená úprava.
3. Žádný ACCEPT ve fázi 1.
4. Žádná garance, žádná podlaha jako nabídka. Fáze 1 ukazuje podlahu jenom jako referenci pro rezervu.
5. Žádné volání PriceLabs v čase leadu. Market data jsou vrstva, ne dotaz na lead. **[DEC]**
6. Žádné odesílání čehokoli majiteli.
7. Žádné scrapování inzerátů.
8. Žádná editace konstant veřejné kalkulačky z nástroje.
9. Žádné tiché přepočítání starého vyhodnocení po změně modelu.
10. Žádné CRM. Pipeline zůstává tenhle měsíc v tabulce podle sekce 7 v OS.

---

## 9. Testy

| # | Invariant |
|---|---|
| **I1** | Interní operator factor okresu bez `OPERATOR_EVIDENCE` je 1,00. Test **selže**, když je `OPERATOR_FACTOR_INTERNAL` alias `OPERATOR_FACTOR_PUBLIC`. |
| **I2** | `screening_baseline ≤ public_monthly` pro každou buňku populace. |
| I3 | Fáze 1 nikdy nevrátí ACCEPT. |
| I4 | Dopočtená buňka nebo `n < 50` nemůže dát zelenou. |
| I5 | Bez zvoleného okresu není verdikt. |
| I6 | `buffer_pct` se ze stejných vstupů přepočítá identicky (golden fixtures). |
| I7 | Každý řádek `evaluations` nese `model_version` a `data_window`. |
| I8 | `evaluations` nemá GRANT UPDATE ani DELETE. |
| I9 | `screening_baseline` se nikdy nezvýší address-level faktorem bez ručně zadané úpravy. |
| I10 | Slovo `expected` se v kódu ani v UI nevyskytuje jako název screeningového čísla. |

---

## 10. Kde to žije

**[DEC]** Privátní autentizovaná cesta uvnitř stávající admin domény portálu, ne samostatný produkt ani subdoména. Cesta musí být přímo bookmarkovatelná a přidatelná na plochu telefonu, tedy stabilní URL, `manifest` pro instalaci a žádné přesměrování přes rozcestník po přihlášení.

---

## 11. Rozhodnutí z 9. 9. a jedna oprava

| # | Věc | Rozhodnutí |
|---|---|---|
| 1 | Prahy | `WORTH_MIN = 0,35`, `REVIEW_MIN = 0,10`, obojí v0. Neladit před 20 až 30 případy. |
| 2 | Baseline | Spodní hrana. Přejmenováno na `screening_baseline`; `expected` se nepoužívá. |
| 3 | Model | Edge function, jedna generovaná implementace. |
| 4 | Umístění | Privátní cesta v portálu, bookmarkovatelná. |
| 5 | Geokódování | Ne ve v1. Ruční okres a čtvrť, `geo_source` a `geo_confidence` v modelu od začátku. |

**Oprava mého tvrzení.** Ve v2 jsem napsal, že fakta o konkrétním bytu s rezervou hýbou jenom dolů, a odvodil z toho odstup prahů. Není to pravda a odporuje to i mé vlastní fázi 2, kde jsou úpravy obousměrné. Brány jsou převážně downside, ale kapacita, terasa, výhled, parkování nebo stav můžou baseline zvednout. Věta ve výsledku je opravená a zdůvodnění odstupu prahů teď stojí na asymetrii ceny omylu, ne na jednosměrnosti.

**Pořadí zůstává:** odemknout web a ověřit GA → rozpojit interní a veřejný faktor (risk logic, jde hned a nečeká na tenhle spec) → první reálné leady → tenhle vyhodnocovač → tři ruční posouzení → z nich fáze 2.
