## Cíl

Zkrátit pocit opakování na hlavní stránce: sloučit dvě benefitové sekce do jedné a oddělit dva foto-bloky tak, aby na sebe nenavazovaly.

## Změny

### 1. Sloučit BenefitsSection + ForYouSection do jedné sekce

- Smazat `BenefitsSection` z `src/pages/Index.tsx` (a její import).
- Komponentu `src/components/BenefitsSection.tsx` smazat.
- `ForYouSection` zůstává jako **jediný** „proč my" blok hned za Hero. Mírně posílit nadpis a podnadpis, aby fungoval jako kompletní hodnotová sekce (ne jen srovnání). Zbytek karet (4× Antam vs dlouhodobý nájem) zůstává beze změny.
- Překladové klíče `benefits_*` a `benefit1..6_*` v `src/i18n/translations.ts` smazat (CS i VI).

### 2. Oddělit BeforeAfterSection a GallerySection

Dnes jdou těsně za sebou (dva foto bloky v řadě). Nový pořadí:

```text
Hero
ForYouSection         (merged „proč my")
PartnersStrip
CalculatorSection
ServicesSection
BeforeAfterSection    (detaily fotek — důkaz řemesla)
ProcessSection
OwnerReportSection
GallerySection        (portfolio jako social proof před About)
AboutSection
PotentialCTA
FAQSection
ContactSection
```

Tím je mezi BeforeAfter a Gallery proklad Process + OwnerReport, takže se vizuálně neopakují.

### 3. Drobnost

V `Index.tsx` smazat i nepoužívané importy (`TrustStrip`, `StatsSection`, `SectionDivider`), pokud nikde nejsou použité — vyčistí soubor.

## Co se NEMĚNÍ

- ServicesSection, ProcessSection, OwnerReportSection zůstávají všechny tři (dle tvé volby).
- Žádné texty v Process / Services / Report / Calculator / FAQ / Contact se neupravují.
- Design tokens, fonty, barvy beze změny.

## Výsledek

Stránka se zkrátí o jednu redundantní sekci a dva foto bloky už nebudou hned vedle sebe — funnel by měl působit svižněji a méně repetitivně.