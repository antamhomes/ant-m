# Lepší řazení sekcí pro retention

## Problém s aktuálním pořadím

```
Hero → Trust → Benefits → Partners → Services → WhyBetter →
PotentialCTA → Gallery → BeforeAfter → Process → About →
Calculator → OwnerReport → FAQ → Contact
```

Slabiny pro retention:
- **Vizuální důkaz až moc pozdě.** Galerie reálných bytů je až 8. sekce. Majitel chce hned vidět "umí to vypadat dobře".
- **Benefits + Services + WhyBetter = 3 podobné textové bloky za sebou.** Čtenář ztratí pozornost ještě než dorazí k důkazům.
- **Calculator (silný hook — "kolik vydělám") je až 12. sekce.** Měl by přijít dřív, dokud je člověk zvědavý.
- **About až za vším.** Důvěra v tým má být dřív, ne až těsně před kontaktem.
- **Žádný "rytmus" světlá/tmavá.** Sekce po sobě splývají.

## Navržené nové pořadí

```
1.  Hero                — slib + 2 CTA (zůstává)
2.  TrustStrip          — 4 rychlé jistoty (zůstává)
3.  Gallery             — VIZUÁLNÍ DŮKAZ HNED (přesun nahoru)
4.  Benefits            — co majitel získá (3-4 hlavní body)
5.  Calculator          — INTERAKTIVNÍ HOOK ("kolik vydělám?") — drží na stránce
6.  WhyBetter           — Airbnb vs. dlouhodobý pronájem (rozhodovací moment)
7.  Services            — "Co za vás řešíme" — detail nabídky
8.  BeforeAfter         — design transformace (druhá vlna důkazu)
9.  Process             — "Jak to funguje" — odbourání obav
10. OwnerReport         — ukázka přehledu, který majitel dostává
11. About               — kdo jsme (Antám tým)
12. PartnersStrip       — Airbnb / Booking / PriceLabs loga
13. PotentialCTA        — "spočítáme váš potenciál" (před FAQ)
14. FAQ                 — poslední pochybnosti
15. Contact             — formulář
16. Footer
```

## Proč v tomto pořadí (logika retention)

**První obrazovka (1–3): "stojí to za moje další 2 minuty?"**
Hero → 4 jistoty → reálné fotky bytů. Majitel okamžitě vidí výsledek, ne sliby.

**Druhá vlna (4–5): "co z toho budu mít konkrétně?"**
Benefits přejde rovnou do kalkulačky. Kalkulačka je nejsilnější interaktivní hook na stránce — drží uživatele 30–90 sekund a zvyšuje commitment. Musí přijít dřív než suchý popis služeb.

**Třetí vlna (6–8): "rozhoduji se"**
WhyBetter řeší klíčovou otázku majitele (Airbnb vs. dlouhodobě). Pak Services rozepíše, co za něj děláme. BeforeAfter zavírá vizuální argument.

**Čtvrtá vlna (9–11): "můžu jim věřit?"**
Process odbourá strach z neznáma. OwnerReport ukáže, že má reálný přehled. About představí lidi za firmou.

**Závěr (12–15): konverze**
Partneři + finální CTA + FAQ + formulář.

## Vizuální rytmus pozadí

Aby sekce nesplývaly, alternovat světlou/tmavou:

```
Hero        — tmavá (foto + overlay)
TrustStrip  — světlá
Gallery     — světlá
Benefits    — světlá  ← muted/secondary jako oddělovač
Calculator  — světlá s tmavým "result" panelem
WhyBetter   — světlá
Services    — secondary (jemně tónovaná)
BeforeAfter — světlá
Process     — TMAVÁ (gradient-dark) ← rytmický předěl
OwnerReport — světlá
About       — secondary
Partners    — světlá
PotentialCTA— TMAVÁ (gradient-dark) ← druhý tmavý předěl před závěrem
FAQ         — světlá
Contact     — secondary
Footer      — tmavá
```

Aktuálně jsou Process, PotentialCTA i StatsSection všechny tmavé blízko sebe → tmavé bloky se rozprostřou rovnoměrněji.

## Drobné úpravy navíc (nízká cena, vysoký dopad na retention)

- **Hero CTA #2** (`hero_cta2`) změnit cíl z `#jak-to-funguje` na `#kalkulator` — pošle uživatele rovnou na interaktivní prvek místo na text.
- **PotentialCTA** posunout těsně před FAQ jako "poslední šance" CTA, ne doprostřed stránky kde ruší flow.
- **StickyMobileCTA** ponechat — funguje napříč.

## Co se mění technicky

- `src/pages/Index.tsx` — přeuspořádat importy a JSX podle nového pořadí.
- `src/components/HeroSection.tsx` — změnit `href` druhého CTA na `#kalkulator` (ověřit, že CalculatorSection má toto `id`).
- `src/components/ServicesSection.tsx` — změnit `bg-background` na `bg-secondary` pro vizuální rytmus.
- Případně drobné úpravy paddingu na hranici sekcí, kde nově sousedí stejné pozadí.

## Co se NEMĚNÍ

- Žádné texty, fotky, ikony, fonty ani barvy v design systému.
- Žádné nové komponenty.
- StatsSection zůstává v kódu (momentálně mimo layout) pro případné pozdější použití.
