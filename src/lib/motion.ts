/**
 * One calm reveal for the whole page: small distance, short duration,
 * triggers early, and only once. Use `stagger(i)` for grids (capped so a
 * long list never keeps the reader waiting).
 */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const reveal = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.5, ease: EASE_OUT },
};

export const revealDelayed = (delay: number) => ({
  ...reveal,
  transition: { ...reveal.transition, delay },
});

export const stagger = (index: number, step = 0.06, max = 0.3) => Math.min(index * step, max);
