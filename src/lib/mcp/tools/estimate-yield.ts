import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

const locations = {
  praha1: { label: "Praha 1", multiplier: 1.45, occupancy: 0.85 },
  praha2: { label: "Praha 2", multiplier: 1.25, occupancy: 0.83 },
  praha3: { label: "Praha 3", multiplier: 1.05, occupancy: 0.8 },
  praha4: { label: "Praha 4", multiplier: 0.8, occupancy: 0.72 },
  praha5: { label: "Praha 5", multiplier: 1.0, occupancy: 0.78 },
  praha6: { label: "Praha 6", multiplier: 0.95, occupancy: 0.76 },
  praha7: { label: "Praha 7", multiplier: 1.15, occupancy: 0.83 },
  praha8: { label: "Praha 8", multiplier: 0.85, occupancy: 0.74 },
  praha9: { label: "Praha 9", multiplier: 0.7, occupancy: 0.68 },
  praha10: { label: "Praha 10", multiplier: 0.8, occupancy: 0.73 },
} as const;

// Cleaning/laundry is paid by the guest and handled by antam homes; utilities (energy) are paid by the owner.
const sizes = {
  "1kk": { label: "1+kk", baseADR: 1665 },
  "2kk": { label: "2+kk", baseADR: 2250 },
  "3kk": { label: "3+kk", baseADR: 3060 },
  "4kk": { label: "4+kk", baseADR: 4140 },
} as const;

const extras = {
  balkon: 0.04,
  parking: 0.05,
  klima: 0.03,
  vyhled: 0.08,
  vybaveni: 0.06,
  wellness: 0.05,
} as const;

const seasons = {
  year: { adr: 1.05, occDelta: 0.02 },
  summer: { adr: 1.33, occDelta: 0.08 },
  winter: { adr: 0.88, occDelta: 0.05 },
  xmas: { adr: 1.75, occDelta: 0.12 },
} as const;

const ltrTable: Record<string, Record<string, number>> = {
  praha1: { "1kk": 22000, "2kk": 32000, "3kk": 45000, "4kk": 62000 },
  praha2: { "1kk": 19000, "2kk": 28000, "3kk": 38000, "4kk": 52000 },
  praha3: { "1kk": 17000, "2kk": 24000, "3kk": 32000, "4kk": 44000 },
  praha4: { "1kk": 15000, "2kk": 21000, "3kk": 28000, "4kk": 38000 },
  praha5: { "1kk": 16500, "2kk": 23000, "3kk": 31000, "4kk": 42000 },
  praha6: { "1kk": 17500, "2kk": 25000, "3kk": 34000, "4kk": 46000 },
  praha7: { "1kk": 17500, "2kk": 25000, "3kk": 34000, "4kk": 46000 },
  praha8: { "1kk": 14500, "2kk": 20000, "3kk": 27000, "4kk": 36000 },
  praha9: { "1kk": 13000, "2kk": 18000, "3kk": 24000, "4kk": 32000 },
  praha10: { "1kk": 14000, "2kk": 19500, "3kk": 26000, "4kk": 35000 },
};

const MGMT_FEE = 0.25;
const DAYS = 30;

export default defineTool({
  name: "estimate_rental_yield",
  title: "Estimate short-term rental yield",
  description:
    "Estimate the monthly net income an apartment owner in Prague could earn with antam homes short-term rental management, and compare it to long-term rent. Same model as the calculator on the website.",
  inputSchema: {
    location: z
      .enum(["praha1", "praha2", "praha3", "praha4", "praha5", "praha6", "praha7", "praha8", "praha9", "praha10"])
      .describe("Prague district of the apartment."),
    size: z.enum(["1kk", "2kk", "3kk", "4kk"]).describe("Apartment layout size."),
    season: z
      .enum(["year", "summer", "winter", "xmas"])
      .optional()
      .describe("Season to price for. Defaults to 'year' (yearly average)."),
    extras: z
      .array(z.enum(["balkon", "parking", "klima", "vyhled", "vybaveni", "wellness"]))
      .optional()
      .describe("Extra features that raise the nightly rate."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ location, size, season, extras: chosen }) => {
    const loc = locations[location];
    const sz = sizes[size];
    if (!loc || !sz) throw new ToolError("Unknown location or size.");

    const extrasPct = (chosen ?? []).reduce((sum, e) => sum + (extras[e] ?? 0), 0);

    const compute = (seasonKey: keyof typeof seasons) => {
      const adj = seasons[seasonKey];
      const adr = Math.round(sz.baseADR * loc.multiplier * (1 + extrasPct) * adj.adr);
      const occupancy = Math.max(0.5, Math.min(0.98, loc.occupancy + adj.occDelta));
      const gross = Math.round(adr * occupancy * DAYS);
      const commission = Math.round(gross * MGMT_FEE);
      return { adr, occupancy, gross, commission, net: gross - commission };
    };

    const seasonKey = (season ?? "year") as keyof typeof seasons;
    const r = compute(seasonKey);
    const yearly = compute("year");
    const longTermRent = ltrTable[location][size];

    const result = {
      currency: "CZK",
      location: loc.label,
      size: sz.label,
      season: seasonKey,
      averageNightlyRate: r.adr,
      occupancyRate: Math.round(r.occupancy * 100) / 100,
      grossMonthlyRevenue: r.gross,
      managementCommission: r.commission,
      managementCommissionRate: MGMT_FEE,
      netMonthlyIncomeForOwner: r.net,
      netYearlyAverage: yearly.net * 12,
      longTermRentBenchmark: longTermRent,
      multipleVsLongTermRent: Math.round((r.net / longTermRent) * 10) / 10,
      note: "Indicative estimate based on Prague market benchmarks; amounts exclude VAT. Cleaning and laundry are paid by guests as part of each booking and handled by antam homes, so they do not reduce the owner's income. Utilities (electricity, water, gas) are paid by the owner and are not included.",
    };

    return {
      content: [
        {
          type: "text" as const,
          text: `${loc.label}, ${sz.label}: net ~${result.netMonthlyIncomeForOwner.toLocaleString("cs-CZ")} CZK/month for the owner (gross ${result.grossMonthlyRevenue.toLocaleString("cs-CZ")} CZK, ADR ${result.averageNightlyRate} CZK, occupancy ${Math.round(r.occupancy * 100)}%). Long-term rent benchmark ~${longTermRent.toLocaleString("cs-CZ")} CZK — roughly ${result.multipleVsLongTermRent}x.`,
        },
      ],
      structuredContent: result,
    };
  },
});