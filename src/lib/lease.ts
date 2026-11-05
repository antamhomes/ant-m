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
/**
 * Výchozí sazba = průměr nových hypoték podle ČBA Hypomonitoru za poslední
 * zveřejněný měsíc (vychází v půlce dalšího měsíce). Není to nabídka úvěru;
 * investor si ji v kalkulačce přepíše. Při změně měnit OBĚ konstanty.
 */
export const RATE_DEFAULT = 0.051;
export const RATE_SOURCE = "průměr nových hypoték, ČBA Hypomonitor, září 2026";
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
 * UNDERWRITING (5. 11. 2026, zpřísněno týž den): kolik nájmu byt unese.
 * JEDNA funkce pro web, MCP i interní nástroj, aby web nikdy neslíbil víc,
 * než nástroj podepíše.
 *
 * Základ je roční průměr čistého výnosu TRHU pro danou dispozici a čtvrť
 * (marketAnchor.netRevenue: po provizi platforem, bez úklidu, který platí
 * host), BEZ operátorského faktoru. Z toho:
 *  - konzervativní tržba = trh × srážky z prohlídky × BAD_YEAR (rezerva na
 *    špatný rok; na webu bez srážek, ty zná jen interní nástroj);
 *  - provozní náklady = energie + provoz + práce;
 *  - strop roční = LEASE_COVER_RATIO × konzervativní NOI;
 *  - strop zimní = WINTER_RATIO × zimní NOI (listopad až březen bez prosince);
 *  - nájem = min obou stropů, na stovky.
 * Proč trh a ne naše výsledky: nájem je pevný závazek na 36 měsíců. Lepší
 * výsledek je náš zisk, ne důvod slíbit víc.
 */
export const LEASE_OPS = 2000;          // internet, služby SVJ k užívání, drobné opravy, měsíčně
export const LABOUR = 6000;             // koordinace úklidu, hosté, čas; interní odhad na byt a měsíc
export const BAD_YEAR = 0.9;            // rezerva na špatný rok
export const LEASE_COVER_RATIO = 0.6;   // z konzervativního NOI nejvýš 60 % na nájem
export const WINTER_RATIO = 0.9;        // nájem nejvýš 90 % průměrného zimního NOI

export type LeaseCap = {
  marketRevenue: number; conservativeRevenue: number; winterRevenue: number;
  opex: number; noi: number; winterNoi: number; capYear: number; capWinter: number; maxRent: number;
  /** nejvyšší cena bytu, při které standardní splátka ještě nepřesáhne maxRent */
  maxPrice: number;
};

/** Strop nájmu pro byt; haircut = součin srážek z prohlídky (web: 1). null = bez spolehlivých dat. */
export const leaseCap = (
  loc: LocationKey, size: SizeKey, opts: { ctvrt?: string | null; m2?: number; haircut?: number; rate?: number } = {},
): LeaseCap | null => {
  const m2 = opts.m2 ?? typicalArea(loc, size);
  const hc = opts.haircut ?? 1;
  const year = ownerMonthly(loc, size, { season: "year", m2, ctvrt: opts.ctvrt ?? null, scope: "internal" });
  const winter = ownerMonthly(loc, size, { season: "winter", m2, ctvrt: opts.ctvrt ?? null, scope: "internal" });
  if (!year.supported || !winter.supported) return null;
  const marketRevenue = year.marketAnchor.netRevenue;
  const conservativeRevenue = marketRevenue * hc * BAD_YEAR;
  const winterRevenue = winter.marketAnchor.netRevenue * hc;
  const opex = ENERGY[size] + LEASE_OPS + LABOUR;
  const noi = Math.max(0, conservativeRevenue - opex);
  const winterNoi = Math.max(0, winterRevenue - opex);
  const capYear = noi * LEASE_COVER_RATIO;
  const capWinter = winterNoi * WINTER_RATIO;
  const maxRent = Math.round(Math.min(capYear, capWinter) / 100) * 100;
  const rate = opts.rate ?? RATE_DEFAULT;
  const perCrown = annuity(1, rate, TERM_YEARS) * LTV; // splátka na 1 Kč ceny
  const maxPrice = Math.floor(maxRent / perCrown / 100_000) * 100_000;
  return { marketRevenue, conservativeRevenue, winterRevenue, opex, noi, winterNoi, capYear, capWinter, maxRent, maxPrice };
};

export type LeaseQuote = {
  price: number;
  rate: number;
  own: number;        // vlastní zdroje 30 %. Vybavení je navíc, v hotovosti, za pořizovací ceny + 20 %; částku neodhadujeme (rozhodnutí V., 5. 11. 2026)
  loan: number;       // hypotéka 70 %
  payment: number;    // měsíční splátka
  cap: number | null; // kolik nájmu byt unese (null = lokalitu/dispozici neumíme posoudit)
  maxPrice: number | null; // do jaké ceny bytu pokryjeme celou splátku
  rent: number | null;      // nájem, který nabídneme: min(payment, cap)
  covered: "full" | "partial" | "review";
  shortfall: number;  // kolik by investor doplácel (payment - rent)
  noi: number | null; // konzervativní NOI, pro interní kontrolu
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
  const c = loc ? leaseCap(loc, size, { ctvrt: opts.ctvrt ?? null, m2: opts.m2, rate }) : null;
  if (!c) return { price, rate, own, loan, payment, cap: null, maxPrice: null, rent: null, covered: "review", shortfall: 0, noi: null };
  const rent = Math.min(payment, c.maxRent);
  const covered = rent >= payment ? "full" : "partial";
  return { price, rate, own, loan, payment, cap: c.maxRent, maxPrice: c.maxPrice, rent, covered, shortfall: payment - rent, noi: c.noi };
};

/** Formát částky bez desetin, s pevnými mezerami: 34 962 Kč. */
export const czk = (n: number): string =>
  `${Math.round(n).toLocaleString("cs-CZ").replace(/\s/g, " ")} Kč`;

/**
 * VEŘEJNÉ ROZPĚTÍ (5. 11. 2026 večer). Web nikdy neukazuje strop jako jedno
 * číslo: majitel by se na něj ukotvil. Ukazuje rozpětí 90 až 100 % stropu,
 * zaokrouhlené dolů na 500 Kč. Přesné číslo přijde po prohlídce a může vyjít
 * i níž (srážky z prohlídky). Interní nástroj pracuje se stropem přímo.
 */
export const PUBLIC_RANGE_LOW = 0.9;
export const indicativeRange = (cap: number) => ({
  low: Math.floor((cap * PUBLIC_RANGE_LOW) / 500) * 500,
  high: Math.floor(cap / 500) * 500,
});
