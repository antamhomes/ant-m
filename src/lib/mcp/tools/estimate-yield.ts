import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  ownerMonthly, rentFor, isMeasured, SIZE_PRESET, MGMT_FEE, PLATFORM_FEE,
  CALC_OCCUPANCY, bandFor,
  type LocationKey, type SizeKey, type SeasonKey,
} from "../../yield";

// Od patche 119 tenhle nástroj NEMÁ vlastní kopii modelu: počítá stejnou
// funkcí ownerMonthly z lib/yield jako kalkulačka na webu. Úroveň ceny za noc
// = realizované tržní ADR okolí našich listingů (PriceLabs, 12 měsíců), tvar
// mezi kapacitními pásmy z nabídkových mediánů, obsazenost 85 %. Lokality bez
// vlastních dat (Praha 2, 6 až 10) vracejí supported: false a doporučení
// individuálního posouzení; nikdy číslo jiné čtvrti.

const locations: Record<string, string> = {
  praha1: "Praha 1", praha2: "Praha 2", praha3: "Praha 3", praha4: "Praha 4",
  praha5: "Praha 5", praha6: "Praha 6", praha7: "Praha 7", praha8: "Praha 8",
  praha9: "Praha 9", praha10: "Praha 10",
};

export default defineTool({
  name: "estimate_rental_yield",
  title: "Estimate short-term rental yield",
  description:
    "Estimate the monthly net income an apartment owner in Prague could earn with Antam Homes short-term rental management, and compare it to long-term rent. Same model and same code as the calculator on the website. Numbers exist only for districts where Antam Homes manages apartments and sees real market data (Praha 1, 3, 4, 5); other districts get an individual assessment within 24 hours instead of a number.",
  inputSchema: {
    location: z
      .enum(["praha1", "praha2", "praha3", "praha4", "praha5", "praha6", "praha7", "praha8", "praha9", "praha10"])
      .describe("Prague district of the apartment."),
    size: z.enum(["1kk", "2kk", "3kk", "4kk"]).describe("Apartment layout. It only presets the usual guest capacity (4/6/8/10) and floor area (35/53/71/88 m2); the estimate is driven by capacity for the Airbnb side and by floor area for the long-term rent comparison."),
    guests: z.number().int().min(2).max(14).optional()
      .describe("Guest capacity of the apartment. Overrides the layout preset."),
    floorAreaM2: z.number().int().min(18).max(140).optional()
      .describe("Floor area in m2. Overrides the layout preset; drives the long-term rent comparison."),
    season: z
      .enum(["year", "summer", "winter", "xmas"])
      .optional()
      .describe("Season to price for. Defaults to 'year' (yearly average). Seasonal factors come from realized monthly market data of the district; summer (Apr-Oct), winter (Nov-Mar excl. December) and December compose the year exactly."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ location, size, guests: guestsIn, floorAreaM2, season }) => {
    const label = locations[location];
    const sz = size as SizeKey;
    const guests = guestsIn ?? SIZE_PRESET[sz].guests;
    const m2 = floorAreaM2 ?? SIZE_PRESET[sz].m2;
    const seasonKey = (season ?? "year") as SeasonKey;
    const r = ownerMonthly(location, guests, { season: seasonKey });
    const longTermRent = rentFor(location as LocationKey, sz, m2);

    if (!r.supported) {
      const reason = isMeasured(location)
        ? `too few comparable listings for capacity band ${bandFor(guests)} in ${label}`
        : `Antam Homes has no own listings and therefore no market data in ${label}`;
      return {
        content: [
          {
            type: "text" as const,
            text: `${label}, ${sz} (${guests} guests): no published estimate (${reason}). Antam Homes only shows numbers where it manages apartments and sees realized market prices. Send the address and layout and you get an individual calculation for the specific apartment within 24 hours, free and non-binding. For context, the long-term rent benchmark for ${m2} m2 is ~${longTermRent.toLocaleString("cs-CZ")} CZK/month (Deloitte Rent Index Q2/2026).`,
          },
        ],
        structuredContent: {
          currency: "CZK",
          location: label,
          size: sz,
          guests,
          floorAreaM2: m2,
          supported: false,
          reason,
          longTermRentBenchmark: longTermRent,
          note: "Estimates are published only for districts with own market data (Praha 1, 3, 4, 5). An individual assessment for any apartment is free and takes up to 24 hours.",
        },
      };
    }

    const yearly = ownerMonthly(location, guests);
    const yearlyNet = yearly.supported ? yearly.net : r.net;
    const result = {
      currency: "CZK",
      location: label,
      size: sz,
      guests,
      floorAreaM2: m2,
      supported: true,
      capacityBand: r.band,
      season: seasonKey,
      averageNightlyRate: r.adr,
      occupancyRate: CALC_OCCUPANCY,
      grossMonthlyRevenue: r.gross,
      platformCommission: r.platformFee,
      platformCommissionRate: PLATFORM_FEE,
      netRevenueAfterPlatform: r.netRevenue,
      managementCommission: r.mgmt,
      managementCommissionRate: MGMT_FEE,
      netMonthlyIncomeForOwner: r.net,
      netYearlyAverage: yearlyNet * 12,
      longTermRentBenchmark: longTermRent,
      multipleVsLongTermRent: Math.round((r.net / longTermRent) * 10) / 10,
      note: "Nightly rate = realized prices of comparable listings around Antam Homes apartments in this district (PriceLabs, 12 closed months); occupancy assumed 85 %, which Antam Homes apartments hold or beat (85-97 % vs market 64-78 %). The Antam Homes fee is 30 % of net revenue: what the platform pays out, after deducting the cleaning fee. The fee is final; nothing is added on top, and it also covers the Czech VAT due on the platform commission. Every apartment Antam Homes accepts for management comes with a written yearly income guarantee (at least the long-term rent plus utilities); eligibility is checked free of charge before signing, and this estimate is not that guarantee. Guests pay the cleaning fee separately; it is retained by Antam Homes. Utilities (electricity, water) are paid by the owner and are not included.",
    };

    return {
      content: [
        {
          type: "text" as const,
          text: `${label}, ${sz} (${guests} guests, band ${r.band}): net ~${result.netMonthlyIncomeForOwner.toLocaleString("cs-CZ")} CZK/month for the owner (gross ${result.grossMonthlyRevenue.toLocaleString("cs-CZ")} CZK, platform commission ${result.platformCommission.toLocaleString("cs-CZ")} CZK, realized market ADR ${result.averageNightlyRate} CZK, occupancy 85%). Long-term rent benchmark ~${longTermRent.toLocaleString("cs-CZ")} CZK, roughly ${result.multipleVsLongTermRent}x.`,
        },
      ],
      structuredContent: result,
    };
  },
});
