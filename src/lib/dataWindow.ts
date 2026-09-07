import { CALC_MODEL_VERSION } from "@/lib/yield";

/**
 * JEDINÉ místo, kde web ví, za jaké období jsou tržní data v kalkulačce.
 *
 * Každý artefakt v data/pricelabs-2026-08 a data/pricelabs-2026-09 nese
 * `meta.months` = 12 uzavřených měsíců 2025_08..2026_07. Konstanta tady je
 * jejich veřejný popis: karta výsledku, metodika i souhrn v poptávce se z ní
 * renderují, takže příští refresh dat nemůže nechat v překladech ležet staré
 * „12 měsíců do 7/2026“. Hlídá to src/test/data-window.test.ts: když se
 * změní okno v artefaktech a ne tady (nebo naopak), test spadne.
 *
 * Nic z ekonomiky modelu tu není; je to provenience, vázaná na verzi
 * konfigurace, pod kterou se čísla počítají (CALC_MODEL_VERSION).
 */
export const CALC_DATA_WINDOW = {
  /** První měsíc okna, formát artefaktů (YYYY_MM). */
  from: "2025_08",
  /** Poslední uzavřený měsíc okna. */
  to: "2026_07",
  /** Počet měsíců v okně. */
  months: 12,
  /** Verze konfigurace kalkulačky, pod kterou tohle okno platí. */
  modelVersion: CALC_MODEL_VERSION,
} as const;

export type DataWindow = { from: string; to: string; months: number };

/** "2026_07" → { y: 2026, m: 7 } */
const parseYm = (ym: string) => {
  const [y, m] = ym.split("_").map(Number);
  return { y, m };
};

/** Veřejný popis okna: cs „12 měsíců do 7/2026“, vi „12 tháng đến 7/2026“. */
export const dataWindowLabel = (lang: "cs" | "vi", win: DataWindow = CALC_DATA_WINDOW): string => {
  const to = parseYm(win.to);
  return lang === "cs"
    ? `${win.months} měsíců do ${to.m}/${to.y}`
    : `${win.months} tháng đến ${to.m}/${to.y}`;
};

/** Rozsah „8/2025 až 7/2026“ pro metodiku a interní podklady. */
export const dataWindowRange = (lang: "cs" | "vi", win: DataWindow = CALC_DATA_WINDOW): string => {
  const a = parseYm(win.from);
  const b = parseYm(win.to);
  return lang === "cs" ? `${a.m}/${a.y} až ${b.m}/${b.y}` : `${a.m}/${a.y} đến ${b.m}/${b.y}`;
};
