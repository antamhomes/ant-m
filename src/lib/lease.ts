import { ENERGY, ownerMonthly, typicalArea, type LocationKey, type SizeKey } from "@/lib/yield";

/**
 * NÁJEM NA 3 ROKY (5. 11. 2026, nová nabídka). Antam si byt od investora
 * pronajme a platí nájem ve výši splátky jeho hypotéky. Tenhle modul je
 * JEDINÉ místo, kde se počítá splátka a kde se rozhoduje, jestli ji byt
 * unese. Web, lead i MCP čtou odsud.
 *
 * Parametry nabídky (rozhodnutí V., 5. 11. 2026):
 *  - standardní investiční hypotéka: 70 % ceny (strop ČNB od 1. 4. 2026),
 *    splatnost 30 let; kratší splatnost nebo vyšší LTV investor doplácí
 *  - doba nájmu 36 měsíců, nájem splatný 5 dní před splátkou
 *  - sazba je ORIENTAČNÍ a na webu editovatelná; nic z toho není nabídka úvěru
 */
export const LTV = 0.7;
export const TERM_YEARS = 30;
export const LEASE_MONTHS = 36;
/** Orientační sazba investiční hypotéky, podzim 2026. Investor si ji na webu přepíše. */
export const RATE_DEFAULT = 0.0491;
export const RENT_DAYS_BEFORE = 5;
export const DEFAULT_EXIT_DAYS = 30;
export const REGULATION_NOTICE_MONTHS = 2;

/** Anuitní splátka. */
export const annuity = (principal: number, rate: number, years: number): number => {
  const r = rate / 12;
  const n = years * 12;
  if (r <= 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
};

/**
 * UNDERWRITING (5. 11. 2026): kolik nájmu byt unese.
 * Základ je roční průměr čistého výnosu TRHU pro danou dispozici a čtvrť
 * (marketAnchor.netRevenue: po provizi platforem, bez úklidu, který platí
 * host), tedy BEZ operátorského faktoru. Z toho jdou energie a provoz, a
 * z toho, co zbyde, pokryjeme nejvýš LEASE_COVER_RATIO. Zbytek je marže,
 * rezerva na zimu a na opravy.
 *
 * Proč trh a ne naše výsledky: nájem je pevný závazek na 36 měsíců. Kdyby se
 * počítal z našeho faktoru, jeden slabší byt by nás stál rozdíl každý měsíc.
 * Lepší výsledek je náš zisk, ne důvod slíbit víc.
 */
export const LEASE_OPS = 2000;          // internet, služby SVJ k užívání, drobné opravy, měsíčně
export const LEASE_COVER_RATIO = 0.6;   // z čistého provozního výnosu nejvýš 60 % jde na nájem

export type LeaseQuote = {
  price: number;
  rate: number;
  own: number;        // vlastní zdroje 30 %
  loan: number;       // hypotéka 70 %
  payment: number;    // měsíční splátka
  cap: number | null; // kolik nájmu byt unese (null = lokalitu/dispozici neumíme posoudit)
  rent: number | null;      // nájem, který nabídneme: min(payment, cap)
  covered: "full" | "partial" | "review";
  shortfall: number;  // kolik by investor dopláce (payment - rent)
  noi: number | null; // čistý provozní výnos trhu po energiích a provozu, pro interní kontrolu
};

export const quoteLease = (
  price: number,
  loc: LocationKey | null,
  size: SizeKey,
  opts: { ctvrt?: string | null; rate?: number; m2?: number } = {},
): LeaseQuote => {
  const rate = opts.rate ?? RATE_DEFAULT;
  const own = Math.round(price * (1 - LTV));
  const loan = Math.round(price * LTV);
  const payment = Math.round(annuity(loan, rate, TERM_YEARS));

  let cap: number | null = null;
  let noi: number | null = null;
  if (loc) {
    const m2 = opts.m2 ?? typicalArea(loc, size);
    const r = ownerMonthly(loc, size, { season: "year", m2, ctvrt: opts.ctvrt ?? null, scope: "internal" });
    if (r.supported) {
      noi = Math.max(0, r.marketAnchor.netRevenue - ENERGY[size] - LEASE_OPS);
      cap = Math.round((noi * LEASE_COVER_RATIO) / 100) * 100;
    }
  }

  if (cap === null) return { price, rate, own, loan, payment, cap, rent: null, covered: "review", shortfall: 0, noi };
  const rent = Math.min(payment, cap);
  const covered = rent >= payment ? "full" : "partial";
  return { price, rate, own, loan, payment, cap, rent, covered, shortfall: payment - rent, noi };
};

/** Formát částky bez desetin, s pevnými mezerami: 34 962 Kč. */
export const czk = (n: number): string =>
  `${Math.round(n).toLocaleString("cs-CZ").replace(/\s/g, " ")} Kč`;
