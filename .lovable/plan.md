## Cíl
V sekci „Co za vás řešíme" sjednotit eyebrow label tak, aby měl po stranách zlaté čárky — stejně jako v ostatních sekcích (Benefits, Gallery atd.).

## Změna
V `src/components/ServicesSection.tsx` nahradit současný eyebrow:
```tsx
<p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-4">
```
za sdílenou utilitu z design systému:
```tsx
<p className="eyebrow eyebrow-center mb-4">
```

Třída `.eyebrow.eyebrow-center` definovaná v `src/index.css` automaticky přidá zlaté čárky vlevo i vpravo (`::before` a `::after`) a barvu/typografii zachová identickou s ostatními sekcemi. Na nově tmavě zeleném pozadí budou čárky výrazně viditelné.

### Soubory
- `src/components/ServicesSection.tsx` (jediný řádek)