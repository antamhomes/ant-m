## Cíl
Vizuálně začlenit prémiovou zelenou (charcoal/primary) do sekce „Co za vás řešíme" (`ServicesSection.tsx`), aniž by trpěla čitelnost.

## Návrh
Změnit sekci ze světlé (`bg-secondary`) na tmavě‑zelený gradient s gold akcenty — stejný jazyk jako Portfolio CTA a hero CTA. Text zůstane plně čitelný díky `text-primary-foreground` a tlumeným odstínům.

### Konkrétní úpravy v `src/components/ServicesSection.tsx`
1. **Pozadí sekce**: `bg-secondary` → `bg-gradient-dark` + jemná zlatá záře nahoře (radial accent overlay).
2. **Eyebrow** „Naše služby": ponechat `text-gold`.
3. **H2 nadpis**: `text-foreground` → `text-primary-foreground`.
4. **Podtitulek**: `text-muted-foreground` → `text-primary-foreground/70`.
5. **Karty služeb** (řádky):
   - Oddělovač: `border-border/60` → `border-primary-foreground/10`.
   - Název služby: `text-foreground` → `text-primary-foreground`, hover `group-hover:text-gold`.
   - Popis: `text-muted-foreground` → `text-primary-foreground/70`.
   - Ikona: ponechat `text-gold` (kontrast na zeleném pozadí je výborný), zachovat hover glow.
6. Doplnit nahoru/dole jemné gold „divider" linky (`border-t border-gold/15`) pro editorial feel a oddělení od sousedních světlých sekcí.

### Čitelnost
- Tělo textu na `--charcoal` (#0B241F) s bílou na 70 % = WCAG AA pro běžný text.
- Nadpisy 100 % bílá = AAA.
- Gold (#brown‑gold) na tmavě zelené je vysoce kontrastní — již používáme v hero a Portfolio CTA.

### Soubory
- `src/components/ServicesSection.tsx` (jediný soubor)

Žádné nové tokeny ani změny v `index.css` nejsou potřeba — vše už v design systému existuje.