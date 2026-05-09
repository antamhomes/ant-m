## Remove bullet boxes from PotentialCTA section

In `src/components/PotentialCTA.tsx`:

1. Remove the entire `<ul>` block (the 3 boxed bullets: "Transparentní měsíční přehled", "Dynamické ceny podle sezóny", "Optimalizace obsazenosti i ceny za noc").
2. Remove the now-unused `bulletKeys` constant and the `Check` icon import.
3. Restore the spacing on the description paragraph (`mb-8` → `mb-10`) so the CTA button has proper breathing room without the bullets.

Optionally keep the translation keys `potential_bullet1/2/3` in `src/i18n/translations.ts` (CS + VI) in case you want to bring them back later — or also remove them. Default: leave them in translations, they're unused but harmless.