import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

const locations = {
  praha1: { label: "Praha 1", measured: true },
  praha2: { label: "Praha 2", measured: false },
  praha3: { label: "Praha 3", measured: true },
  praha4: { label: "Praha 4", measured: false },
  praha5: { label: "Praha 5", measured: true },
  praha6: { label: "Praha 6", measured: false },
  praha7: { label: "Praha 7", measured: false },
  praha8: { label: "Praha 8", measured: false },
  praha9: { label: "Praha 9", measured: false },
  praha10: { label: "Praha 10", measured: false },
} as const;

// Market nightly price: median of comparable listings around our own flats
// (PriceLabs, 28 Aug 2026). Measured for Praha 1, 3 and 5 only; the other
// districts conservatively get the Praha 3 level, which is the lowest measured.
// The band is picked by GUEST CAPACITY, not by layout: guests filter by party size.
const ADR_P3 = { "1BR": 2037, "2BR": 2792, "3BR": 2910 } as const;
const marketAdr: Record<string, Record<string, number>> = {
  praha1: { "1BR": 2767, "2BR": 3775, "3BR": 6047 },
  praha3: ADR_P3,
  praha5: { "1BR": 2265, "2BR": 3011, "3BR": 3011 },
  praha2: ADR_P3, praha4: ADR_P3, praha6: ADR_P3,
  praha7: ADR_P3, praha8: ADR_P3, praha9: ADR_P3, praha10: ADR_P3,
};
const guestBand = (g: number) => (g <= 4 ? "1BR" : g <= 8 ? "2BR" : "3BR");
// Occupancy the estimate assumes. Deliberately below the 94 % our own flats hold,
// so the published figure stays under what we actually deliver.
const CALC_OCCUPANCY = 0.84;

// Layout only presets the capacity and the floor area; neither is an input to the model.
// Airbnb revenue follows capacity, long-term rent follows floor area.
const sizes = {
  "1kk": { label: "1+kk", guests: 4, m2: 35, coef: 1.18 },
  "2kk": { label: "2+kk", guests: 6, m2: 53, coef: 1.0 },
  "3kk": { label: "3+kk", guests: 8, m2: 71, coef: 0.9 },
  "4kk": { label: "4+kk", guests: 10, m2: 88, coef: 0.89 },
} as const;

const extras = {
  balkon: 0.04,
  parking: 0.05,
  klima: 0.03,
  wellness: 0.05,
} as const;

// Season factors calibrated on real results of managed flats (Aug 2025 – Jul 2026).
// MARKET_ADR is the guest-facing nightly price (gross); the platform commission is deducted below.
const seasons = {
  year: { adr: 1.0, occDelta: 0.0 },
  summer: { adr: 1.19, occDelta: 0.01 },
  winter: { adr: 0.67, occDelta: -0.02 },
  xmas: { adr: 1.57, occDelta: 0.03 },
} as const;

// Long-term rent benchmark (CZK/month): Deloitte Rent Index Q2/2026 for the CZK/m2 level,
// Ministry of Finance rent price map (15 Aug 2026) for the gradient between flat sizes.
// Long-term rent: Deloitte Rent Index Q2/2026 (CZK/m2 per district) times the
// actual floor area, times the size gradient from the Ministry of Finance rent
// price map (15 Aug 2026). A 2+kk can be 45 or 90 m2, so area is what matters.
const rentPerM2: Record<string, number> = {
  praha1: 490, praha2: 482, praha3: 480, praha4: 443, praha5: 461,
  praha6: 454, praha7: 493, praha8: 465, praha9: 468, praha10: 442,
};

const MGMT_FEE = 0.30; // Antam Homes fee: 30 % of net revenue (after platform commission)
// Platforms charge their commission on the WHOLE reservation price incl. the cleaning fee.
// Czech VAT (reverse charge) on that commission is paid by Antam Homes out of its own fee
// and is NOT deducted from the owner's revenue.
// Measured 27 Aug 2026 across 7 managed flats: real commission runs 17.3–20.6 % of the room
// price depending on the listing (Airbnb 15.4–20.7 %, Booking 18.1–21.4 %). 0.17 is the middle.
const PLATFORM_FEE = 0.17;
const DAYS = 30.44;

export default defineTool({
  name: "estimate_rental_yield",
  title: "Estimate short-term rental yield",
  description:
    "Estimate the monthly net income an apartment owner in Prague could earn with Antam Homes short-term rental management, and compare it to long-term rent. Same model as the calculator on the website.",
  inputSchema: {
    location: z
      .enum(["praha1", "praha2", "praha3", "praha4", "praha5", "praha6", "praha7", "praha8", "praha9", "praha10"])
      .describe("Prague district of the apartment."),
    size: z.enum(["1kk", "2kk", "3kk", "4kk"]).describe("Apartment layout. It only presets the usual guest capacity (4/6/8/10) and floor area (35/53/71/88 m2); the estimate is driven by capacity for the Airbnb side and by floor area for the long-term rent comparison."),
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
    const guests = sz.guests;

    const extrasPct = (chosen ?? []).reduce((sum, e) => sum + (extras[e] ?? 0), 0);

    // Contract-aligned model: platform commission is deducted from gross accommodation
    // revenue first (commission is charged on the whole reservation incl. the cleaning
    // fee); the remaining net revenue is split 70/30.
    const compute = (seasonKey: keyof typeof seasons) => {
      const adj = seasons[seasonKey];
      const adr = Math.round(marketAdr[location][guestBand(guests)] * (1 + extrasPct) * adj.adr);
      const occupancy = Math.max(0.5, Math.min(0.98, CALC_OCCUPANCY + adj.occDelta));
      // Market ADR is the guest-facing nightly price, so it is already gross.
      const gross = Math.round(adr * occupancy * DAYS);
      const platformFee = Math.round(PLATFORM_FEE * gross);
      const netRevenue = gross - platformFee;
      const commission = Math.round(netRevenue * MGMT_FEE);
      return { adr, occupancy, gross, platformFee, netRevenue, commission, net: netRevenue - commission };
    };

    const seasonKey = (season ?? "year") as keyof typeof seasons;
    const r = compute(seasonKey);
    const yearly = compute("year");
    const longTermRent = Math.round(sz.m2 * rentPerM2[location] * sz.coef);

    const result = {
      currency: "CZK",
      location: loc.label,
      size: sz.label,
      guests: sz.guests,
      floorAreaM2: sz.m2,
      marketDataMeasured: loc.measured,
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