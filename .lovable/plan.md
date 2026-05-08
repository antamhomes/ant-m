## Animace „klikni na mě" pro CTA „Nezávazně probrat byt"

### Cíl
Všechna tlačítka „Nezávazně probrat byt" mají dnes jen mírný hover efekt. Přidat jemnou, ale výraznou animaci, která láká k prokliku, a to už **bez interakce uživatele** (idle stav) — aby tlačítko bylo vizuálně živé i když na něj zrovna nemíříš myší.

### Kde se tlačítko vyskytuje
Stejné CTA běží napříč webem v 6 komponentách:
- `Navbar.tsx` — `nav_freeConsultation`
- `HeroSection.tsx` — `hero_cta`
- `PotentialCTA.tsx` — `potential_cta`
- `ProcessSection.tsx` — `process_cta`
- `OwnerReportSection.tsx` — `report_cta`
- `CalculatorSection.tsx` — `calc_cta`
- (+ Footer používá `footer_cta` jako odkaz, méně dominantní)

### Jak to vyřešit elegantně (jeden zdroj pravdy)

V `tailwind.config.ts` přidat dvě nové keyframes + animace:

1. **`shimmer`** — gold přejezd zlatého lesku zleva doprava přes tlačítko (pseudo-element `::after` s gradient přes `--gold` overlay), opakuje se každých ~3,5 s. Velmi luxusní, sedí k brand stylu.
2. **`gold-pulse`** — jemné pulzování `box-shadow` v gold tónu (ring kolem tlačítka pomalu „dýchá"), 2,5 s loop.

V `src/index.css` definovat utility třídu **`.cta-shine`**, která kombinuje obojí + zachová stávající ring/border. Tu pak přidat ke všem 6 CTA tlačítkům jediným přidáním třídy.

### Detaily provedení

```text
.cta-shine {
  position: relative;
  overflow: hidden;
  animation: gold-pulse 2.6s ease-in-out infinite;
}
.cta-shine::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(110deg,
     transparent 30%,
     hsl(var(--gold) / 0.35) 50%,
     transparent 70%);
  transform: translateX(-100%);
  animation: shimmer 3.4s ease-in-out infinite;
  pointer-events: none;
}
```

- Animace respektuje `prefers-reduced-motion` (uživatelům s vypnutými animacemi se neaktivuje).
- Gold tóny berou ze stávajících semantic tokenů (`--gold`), žádné hardcoded barvy.
- Pulse je jemný (max ~6 px shadow), aby působil prémiově a ne agresivně.

### Soubory ke změně
- `tailwind.config.ts` — přidat keyframes `shimmer`, `gold-pulse`
- `src/index.css` — přidat utility `.cta-shine` + `@media (prefers-reduced-motion)`
- 6 komponent výše — přidat `cta-shine` do `className` hlavního CTA tlačítka

### Co se NEmění
- Texty, layout, ostatní animace (motion entrance), barvy, styly hover.
- Footer textový odkaz a sekundární odkazy („nebo nezávazně…") zůstávají bez animace, aby hlavní CTA bylo vizuálně dominantní.
