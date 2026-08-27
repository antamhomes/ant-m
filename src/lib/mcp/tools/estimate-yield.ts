import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

const locations = {
  praha1: { label: "Praha 1", multiplier: 1.35, occupancy: 0.85 },
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

// Cleaning/laundry is paid by the guest and handled by Antam Homes; utilities (energy) are paid by the owner.
// Each layout is priced for its usual guest capacity (shown as `guests` in the result).
const sizes = {
  "1kk": { label: "1+kk", baseADR: 1665, guests: "2–4" },
  "2kk": { label: "2+kk", baseADR: 2250, guests: "6–8" },
  "3kk": { label: "3+kk", baseADR: 3060, guests: "8–10" },
  "4kk": { label: "4+kk", baseADR: 4140, guests: "10–12" },
} as const;

const extras = {
  balkon: 0.04,
  parking: 0.05,
  klima: 0.03,
  wellness: 0.05,
} as const;

// Season factors calibrated on real results of managed flats (Aug 2025 – Jul 2026); ADR is net of platform commission.
const seasons = {
  year: { adr: 1.05, occDelta: 0.02 },
  summer: { adr: 1.25, occDelta: 0.03 },
  winter: { adr: 0.7, occDelta: 0.0 },
  xmas: { adr: 1.65, occDelta: 0.05 },
} as const;

// Long-term rent benchmark (CZK/month), Bohemian Estates rent map, Nov 2025; 4+kk ≈ 1.3 × 3+kk
const ltrTable: Record<string, Record<string, number>> = {
  praha1: { "1kk": 23000, "2kk": 28000, "3kk": 32000, "4kk": 41500 },
  praha2: { "1kk": 21500, "2kk": 28000, "3kk": 32500, "4kk": 42500 },
  praha3: { "1kk": 20500, "2kk": 26500, "3kk": 31000, "4kk": 40500 },
  praha4: { "1kk": 18000, "2kk": 23000, "3kk": 26000, "4kk": 33500 },
  praha5: { "1kk": 18500, "2kk": 24500, "3kk": 28000, "4kk": 36000 },
  praha6: { "1kk": 19000, "2kk": 25500, "3kk": 30000, "4kk": 39000 },
  praha7: { "1kk": 20000, "2kk": 25500, "3kk": 30500, "4kk": 40000 },
  praha8: { "1kk": 16000, "2kk": 21500, "3kk": 24000, "4kk": 31000 },
  praha9: { "1kk": 18500, "2kk": 23500, "3kk": 29000, "4kk": 37500 },
  praha10: { "1kk": 18000, "2kk": 23000, "3kk": 27500, "4kk": 35500 },
};

const MGMT_FEE = 0.30; // Antam Homes fee: 30 % of net revenue (after platform commission)
// Platforms charge their commission on the WHOLE reservation price incl. the cleaning fee.
// Czech VAT (reverse charge) on that commission is paid by Antam Homes out of its own fee
// and is NOT deducted from the owner's revenue.
// Measured 27 Aug 2026 across 7 managed flats: real commission runs 17.3–20.6 % of the room
// price depending on the listing (Airbnb 15.4–20.7 %, Booking 18.1–21.4 %). 0.17 is the middle.
const PLATFORM_FEE = 0.17;
const CLEANING_SHARE = 0.1; // internal estimate of cleaning fees as a share of accommodation revenue (used only for the commission deduction)
const DAYS = 30;

export default defineTool({
  name: "estimate_rental_yield",
  title: "Estimate short-term rental yield",
  description:
    "Estimate the monthly net income an apartment owner in Prague could earn with Antam Homes short-term rental management, and compare it to long-term rent. Same model as the calculator on the website.",
  inputSchema: {
    location: z
      .enum(["praha1", "praha2", "praha3", "praha4", "praha5", "praha6", "praha7", "praha8", "praha9", "praha10"])
      .describe("Prague district of the apartment."),
    size: z.enum(["1kk", "2kk", "3kk", "4kk"]).describe("Apartment layout size (each is priced for its usual guest capacity: 1+kk 2–4, 2+kk 6–8, 3+kk 8–10, 4+kk 10–12 guests)."),
    season: z
      .enum(["year", "summer", "winter", "xmas"])
      .optional()
      .describe("Season to price for. Defaults to 'year' (yearly average)."),
    extras: z
      .array(z.enum(["balkon", "parking", "klima", "wellness"]))
      .optional()
      .describe("Extra features that raise the nightly rate."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ location, size, season, extras: chosen }) => {
    const loc = locations[location];
    const sz = sizes[size];
    if (!loc || !sz) throw new ToolError("Unknown location or size.");
    const baseADR = sz.baseADR;

    const extrasPct = (chosen ?? []).reduce((sum, e) => sum + (extras[e] ?? 0), 0);

    // Contract-aligned model: platform commission is deducted from gross accommodation
    // revenue first (commission is charged on the whole reservation incl. the cleaning
    // fee); the remaining net revenue is split 70/30.
    const compute = (seasonKey: keyof typeof seasons) => {
      const adj = seasons[seasonKey];
      const adr = Math.round(baseADR * loc.multiplier * (1 + extrasPct) * adj.adr);
      const occupancy = Math.max(0.5, Math.min(0.98, loc.occupancy + adj.occDelta));
      // Gross accommodation revenue (before platform commission) from the net-of-commission ADR benchmark.
      const gross = Math.round((adr / (1 - PLATFORM_FEE)) * occupancy * DAYS);
      const platformFee = Math.round(PLATFORM_FEE * gross * (1 + CLEANING_SHARE));
      const netRevenue = gross - platformFee;
      const commission = Math.round(netRevenue * MGMT_FEE);
      return { adr, occupancy, gross, platformFee, netRevenue, commission, net: netRevenue - commission };
    };

    const seasonKey = (season ?? "year") as keyof typeof seasons;
    const r = compute(seasonKey);
    const yearly = compute("year");
    const longTermRent = ltrTable[location][size];

    const result = {
      currency: "CZK",
      location: loc.label,
      size: sz.label,
      guests: sz.guests,
      season: seasonKey,
      averageNightlyRate: r.adr,
      occupancyRate: Math.round(r.occupancy * 100) / 100,
      grossMonthlyRevenue: r.gross,
      platformCommission: r.platformFee,
      netRevenueAfterPlatform: r.netRevenue,
      managementCommission: r.commission,
      managementCommissionRate: MGMT_FEE,
      netMonthlyIncomeForOwner: r.net,
      netYearlyAverage: yearly.net * 12,
      longTermRentBenchmark: longTermRent,
      multipleVsLongTermRent: Math.round((r.net / longTermRent) * 10) / 10,
      note: "Indicative estimate based on Prague market benchmarks. The Antam Homes fee is 30 % of net revenue: what the platform pays out, after deducting the cleaning fee. The fee is final; nothing is added on top, and it also covers the Czech VAT due on the platform commission. Every apartment Antam Homes accepts for management comes with a written yearly income guarantee (at least the long-term rent plus utilities); eligibility is checked free of charge before signing, and this estimate is not that guarantee. Platform commission is charged on the whole reservation price incl. the cleaning fee. Guests pay the cleaning fee separately; it covers cleaning and laundry and is retained by Antam Homes. Utilities (electricity, water) are paid by the owner and are not included.",
    };

    return {
      content: [
        {
          type: "text" as const,
          text: `${loc.label}, ${sz.label} (${sz.guests} guests): net ~${result.netMonthlyIncomeForOwner.toLocaleString("cs-CZ")} CZK/month for the owner (gross ${result.grossMonthlyRevenue.toLocaleString("cs-CZ")} CZK, platform commission ${result.platformCommission.toLocaleString("cs-CZ")} CZK, ADR ${result.averageNightlyRate} CZK, occupancy ${Math.round(r.occupancy * 100)}%). Long-term rent benchmark ~${longTermRent.toLocaleString("cs-CZ")} CZK, roughly ${result.multipleVsLongTermRent}x.`,
        },
      ],
      structuredContent: result,
    };
  },
});