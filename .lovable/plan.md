## Cíl
Posunout celkový dojem stránky z „hezky udělaný web" k „tichý luxus / editorial premium". Drobné, ale konzistentní úpravy napříč celou stránkou — žádný kompletní redesign.

## Kde to teď drhne (audit)

1. **Hero CTA** — gold-pulse + shimmer + scale + glow je trochu „casino". Premium značky (Aman, The Hoxton, Blueground) nehoupou tlačítky. Tichý hover stačí.
2. **Gold gradient v nadpisech** (`text-gradient-gold`) — používá se moc často. Ztrácí váhu.
3. **Border radius 0.5rem** + místy `rounded-sm` — nekonzistentní. Premium = buď ostře (2px) NEBO velkoryse (16px+), ne mix.
4. **Stíny** — defaultní `shadow-lg` je generický. Chybí dlouhé, měkké, barevné stíny.
5. **Typografie** — chybí pořádný kontrast velikostí (display 56–80px vs body 16px). H2 je teď 3xl–5xl, drobné.
6. **Sekce labels** (`tracking-[0.3em] uppercase` zlatě) — fajn nápad, ale opakuje se v každé sekci stejně. Chce to variaci (číslování 01 / 02, nebo tenká linka).
7. **Spacing** — `py-16 md:py-24` všude. Premium dýchá víc — `py-24 md:py-32` u hero/key sekcí.
8. **Karty** — všechno má border `bg-card`. Chybí hierarchie (hero karta vs vedlejší).
9. **Obrázky** — chybí jemný grain/vignette overlay, který sjednotí fotky různých kvalit.
10. **Microinterakce** — hover states jsou většinou jen `transition-colors`. Chybí subtle scale, image zoom v galerii, link underline animace.
11. **Sticky mobile CTA** — pravděpodobně přebíjí. Nutno zkontrolovat.

## Návrh — 6 oblastí ke zlepšení

### 1. Ztišit CTA, posílit hierarchii
- Odebrat `cta-shine` (gold-pulse + shimmer) z hlavních CTA. Nechat jen jako jednorázový peak (např. po dokončení kalkulačky).
- Hero primary CTA: solid charcoal/gold, jemný hover lift, žádný puls.
- Sticky mobile CTA: ztmavit pozadí, ne zlaté ale charcoal s gold okrajem.

### 2. Sjednotit tvarosloví
- Jeden radius systém: **karty 2px** (ostré, editorial), **inputy 4px**, **pill badge 999px**. Zrušit mix `rounded-sm` / `rounded-lg`.
- Hairline bordery (1px gold/15) místo plných border-border na premium kartách.

### 3. Typografická hierarchie
- Hero H1: zvětšit na `text-6xl md:text-7xl lg:text-[5.5rem]`, tighter tracking `-0.03em`.
- Section H2: `text-4xl md:text-6xl`, ne `3xl–5xl`.
- Eyebrow labels: přidat tenkou zlatou linku 24px vedle textu místo jen tracking.
- Šetřit `text-gradient-gold` — použít max 1× za sekci, jinak solid foreground.

### 4. Stíny & hloubka
- Definovat 3 tokeny: `--shadow-soft` (karty), `--shadow-elegant` (hero, modální), `--shadow-gold` (CTA hover).
- Dlouhé měkké stíny: `0 30px 60px -20px hsl(var(--charcoal)/0.25)`.
- Image karty: jemný inner border `inset 0 0 0 1px hsl(var(--gold)/0.1)`.

### 5. Premium detaily
- Galerie: hover zoom 1.05 + slow ease 700ms, caption se vysune zespoda.
- Kalkulačka: výsledné číslo větší (text-7xl), animovat counter.
- Před/po slider: ztmavit handle, přidat zlatou tenkou linku.
- Sekce divider: tenká zlatá linka 1px × 60px centrovaná mezi sekcemi (místo jen padding).
- Footer: ztmavit na charcoal, gold akcenty místo gold pozadí.

### 6. Spacing rytmus
- Hero a Kalkulačka: `py-32 md:py-40`.
- Ostatní sekce: `py-20 md:py-28`.
- Between cards `gap-6` → `gap-8` na desktopu.
- Container max-width: některé sekce zúžit na `max-w-5xl` pro lepší čtenářský rytmus.

## Co bych NEdělal
- Neměnit barvy, fonty, fotky.
- Nepřidávat 3D efekty, glassmorphism někam mimo hero.
- Nepřepisovat copy.
- Neměnit strukturu sekcí ani jejich pořadí.

## Doporučený rozsah pro tuto iteraci

Navrhuju to rozdělit do **3 úzce zaměřených dávek**, abych nerozbil to, co už funguje:

- **Dávka A — Quick wins (cca 40 % efektu):** ztišit CTA pulse, zvětšit H1 + H2, sjednotit radius, přidat shadow tokeny, zlatá linka u eyebrow labels.
- **Dávka B — Microinterakce:** galerie hover zoom + caption, image hover lift na realizacích, animovaný counter v kalkulačce, before/after handle redesign.
- **Dávka C — Spacing & polish:** padding rytmus sekcí, section dividery, footer charcoal verze, image grain overlay.

Po každé dávce se podíváme a doladíme — premium dojem se ladí iterativně.
