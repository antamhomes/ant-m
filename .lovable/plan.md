## Cíl

Reagovat na audit konverzního funnelu. Projedeme každý bod, opravíme to, co opravdu chybí, ignorujeme to, co audit napsal slepě (kalkulačka, počet CTA — už máš).

## Co se mění

### 1. Sociální důkaz — zapnout existující `StatsSection`

Komponenta už existuje (15+ bytů, 4.9★, až 95 % obsazenost, až 2.8× výnos), ale není mountnutá v `Index.tsx`. Připojíme ji hned pod hero (před `BenefitsSection`), aby bylo číselné proof viditelné nad foldem na mobilu po prvním scrollu.

`TestimonialsSection` zatím necháváme nezapnutou — vrátíš se k ní, až budou reálné citace.

### 2. Pricing transparency — nová sekce

Přidat samostatnou sekci `PricingSection` mezi `ServicesSection` a `BeforeAfterSection`:

- Nadpis: „Jasná cena. Bez překvapení."
- 1 hlavní karta s velkým „22 %" z čistého výnosu
- 3 podpůrné body: bez vstupních poplatků · bez vázané smlouvy · měsíční vyúčtování
- Drobný odkaz na kalkulačku („Spočítat váš výnos →")

Bilingvní (CZ/VI) přes `translations.ts`.

### 3. „This is for you if…" — nová sekce

Přidat `ForOwnersSection` před `ServicesSection`. Zrcadlí konkrétní obavy/cíle majitele:

- 4 karty (2×2 grid podle memory pravidla):
  1. „Nemáte čas řešit hosty a jejich dotazy v noci"
  2. „Bojíte se o stav bytu a vybavení"
  3. „Daně, faktury a evidence vás odrazují"
  4. „Chcete si byt občas nechat pro sebe nebo rodinu"
- Každá karta = pain point + jednověté řešení od antam homes

Bilingvní.

### 4. Hero headline — beze změny

Necháváme „Váš byt. Naše péče. Váš zisk." Bod auditu zamítnut.

### 5. Lovable badge — skrýt

Použijeme `set_badge_visibility(hide_badge=true)`. Vyžaduje Pro plán a tvůj souhlas v dialogu.

### 6. Pořadí sekcí v `Index.tsx` po změně

```text
HeroSection
StatsSection            ← NOVĚ zapnuté
BenefitsSection
PartnersStrip
CalculatorSection
ForOwnersSection        ← NOVÁ
WhyBetterSection
ServicesSection
PricingSection          ← NOVÁ
BeforeAfterSection
ProcessSection
OwnerReportSection
AboutSection
PotentialCTA
FAQSection
ContactSection
Footer
```

### Co NEděláme (a proč)

- **Nepřidáváme kalkulačku** — `CalculatorSection` už existuje a je mountnutá. Audit byl mimo.
- **Nepřidáváme další CTA** — máš jich 5 (hero ×2, PotentialCTA, ContactSection, Navbar, sticky mobile). Stačí.
- **Neměníme hero headline** — tvoje rozhodnutí.
- **Nezapínáme TestimonialsSection** — bez reálných citací by působila falešně.

## Technické detaily

- `src/pages/Index.tsx` — přidat `<StatsSection />` pod `<HeroSection />`, přidat `<ForOwnersSection />` a `<PricingSection />` na pozice výše.
- `src/components/PricingSection.tsx` — nová komponenta, framer-motion, design tokens (`bg-gradient-dark` nebo `bg-secondary`), gold akcent na „22 %".
- `src/components/ForOwnersSection.tsx` — nová komponenta, 2×2 grid karet s ikonami z lucide-react (Clock, Shield, FileText, Calendar).
- `src/i18n/translations.ts` — přidat klíče `pricing_*` a `forOwners_*` do `cs` i `vi` bloku.
- Badge: zavolat `publish_settings--set_badge_visibility` s `hide_badge: true`.

## Výsledek

Stránka získá: viditelná čísla pod hero (proof), zrcadlení obav majitele (empatie), transparentní cenu (důvěra), čistý pro feel bez Lovable badge.