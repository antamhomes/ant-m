import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { quoteLease, LTV, TERM_YEARS, LEASE_MONTHS, RATE_DEFAULT, RENT_DAYS_BEFORE, DEFAULT_EXIT_DAYS, REGULATION_NOTICE_MONTHS } from "../../lease";
import { ctvrtiOf, type LocationKey, type SizeKey } from "../../yield";

// Stejná funkce jako sekce „Vaše splátka" na webu (lib/lease.ts). Nic tu
// nepočítá jinak; popis musí sedět s tím, co quoteLease opravdu dělá.
const locations: Record<string, string> = {
  praha1: "Praha 1", praha2: "Praha 2", praha3: "Praha 3", praha5: "Praha 5", praha7: "Praha 7", praha8: "Praha 8",
};
const czk = (n: number) => n.toLocaleString("cs-CZ");

export default defineTool({
  name: "quote_lease",
  title: "Quote the Antam 3-year lease (mortgage coverage)",
  description:
    "Antam's offer to property investors in Prague: Antam rents the investor's apartment for 36 months and pays a monthly rent equal to the investor's mortgage payment, every month, even when the apartment is empty. This tool computes the standard mortgage payment for a purchase price (70 % loan-to-value, 30-year term, indicative rate) and whether Antam would cover it in full, in part, or needs an individual review. The coverage cap comes from realized market revenue of comparable apartments in the district and quarter (PriceLabs STR index, 12 closed months), minus utilities and operations, times a 60 % coverage ratio. It is NOT a loan offer; the bank confirms the rate and payment.",
  inputSchema: {
    priceCzk: z.number().int().min(2_000_000).max(40_000_000).describe("Purchase price of the apartment in CZK."),
    location: z.enum(["praha1", "praha2", "praha3", "praha5", "praha7", "praha8"]).describe("Prague district. Antam covers Praha 1, 2, 3, Karlín (Praha 8) and Smíchov (Praha 5); other districts are reviewed individually."),
    size: z.enum(["1kk", "2kk", "3kk"]).describe("Layout in Czech notation (1kk studio, 2kk one bedroom, 3kk two bedrooms)."),
    quarter: z.string().optional().describe("Optional quarter id inside the district, e.g. 'nove_mesto', 'stare_mesto', 'vinohrady', 'zizkov', 'smichov', 'karlin', 'holesovice'. Without it the district average is used."),
    ratePct: z.number().min(0.5).max(15).optional().describe(`Mortgage interest rate in % p.a. Defaults to the indicative ${(RATE_DEFAULT * 100).toFixed(2)} %.`),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ priceCzk, location, size, quarter, ratePct }) => {
    const loc = location as LocationKey;
    const valid = ctvrtiOf(loc).some((c) => c.id === quarter);
    const q = quoteLease(priceCzk, loc, size as SizeKey, { ctvrt: valid ? quarter : null, rate: ratePct ? ratePct / 100 : undefined });
    const verdict = q.covered === "full" ? "Antam covers the full payment." : q.covered === "partial" ? `Antam covers up to ${czk(q.cap ?? 0)} CZK/month; the investor tops up the rest.` : "Individual review needed.";
    return {
      content: [{
        type: "text" as const,
        text: `${locations[location]}${valid ? ` · ${quarter}` : ""}, ${size}, price ${czk(priceCzk)} CZK: own funds 30 % = ${czk(q.own)} CZK, loan 70 % = ${czk(q.loan)} CZK over ${TERM_YEARS} years at ${(q.rate * 100).toFixed(2)} % -> payment ${czk(q.payment)} CZK/month. Antam rent ${q.rent === null ? "to be assessed" : `${czk(q.rent)} CZK/month`} for ${LEASE_MONTHS} months, paid ${RENT_DAYS_BEFORE} days before the mortgage date, also in empty months. ${verdict}`,
      }],
      structuredContent: {
        offer: {
          termMonths: LEASE_MONTHS, loanToValue: LTV, mortgageTermYears: TERM_YEARS, rentDaysBeforeMortgage: RENT_DAYS_BEFORE,
          defaultExitDays: DEFAULT_EXIT_DAYS, regulationNoticeMonths: REGULATION_NOTICE_MONTHS,
          furniture: "bought by the investor through Antam at cost + 20 %, stays the investor's",
          investorPays: ["repair fund (fond oprav)", "property tax", "building and contents insurance"],
          antamPays: ["utilities", "internet", "building services for use", "cleaning", "minor repairs", "operations"],
        },
        quote: { priceCzk: q.price, ownCzk: q.own, loanCzk: q.loan, ratePct: Math.round(q.rate * 10000) / 100, paymentCzk: q.payment, capCzk: q.cap, rentCzk: q.rent, covered: q.covered, shortfallCzk: q.shortfall },
        note: "Indicative. The cap is derived from district market data, not from Antam's own results. Not a loan offer.",
      },
    };
  },
});
