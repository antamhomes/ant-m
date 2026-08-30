import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  ownerMonthly, rentFor, isMeasured, SIZE_PRESET, MGMT_FEE, PLATFORM_FEE,
  OCC_UPLIFT, OCC_CAP, bandFor,
  type LocationKey, type SizeKey, type SeasonKey,
} from "../../yield";

// Tenhle nástroj NEMÁ vlastní kopii modelu: počítá stejnou funkcí
// ownerMonthly z lib/yield jako kalkulačka na webu. Od patche 127 (30. 8.
// 2026) jsou vstupy tři (čtvrť, dispozice, plocha) a výsledek nese dvě čísla
// ze stejných dat: průměr trhu (realizovaná tržní cena za noc × tržní
// obsazenost čtvrti) a s Antam Homes (táž cena × obsazenost zvednutá ×1,15,
// strop 85 %). Čtvrť či pásmo s malým vzorkem (a zatím Praha 10) vrací
// supported: false a doporučení individuálního posouzení; nikdy číslo jiné
// čtvrti.

const locations: Record<string, string> = {
  praha1: "Praha 1", praha2: "Praha 2", praha3: "Praha 3", praha4: "Praha 4",
  praha5: "Praha 5", praha6: "Praha 6", praha7: "Praha 7", praha8: "Praha 8",
  praha9: "Praha 9", praha10: "Praha 10",
};

const czk = (n: number) => n.toLocaleString("cs-CZ");

export default defineTool({
  name: "estimate_rental_yield",
  title: "Estimate short-term rental yield",
  description:
    "Estimate the monthly net income an apartment owner in Prague could earn with Antam Homes short-term rental management, and compare it to long-term rent. Same model and same code as the calculator on the website: realized market prices of the whole district per bedroom count (PriceLabs, 12 closed months), shown twice: at the district's market occupancy and at the occupancy Antam Homes plans with. Districts or sizes with too small a market sample (and Praha 10 for now) get an individual assessment within 24 hours instead of a number.",
  inputSchema: {
    location: z
      .enum(["praha1", "praha2", "praha3", "praha4", "praha5", "praha6", "praha7", "praha8", "praha9", "praha10"])
      .describe("Prague district of the apartment."),
    size: z.enum(["1kk", "2kk", "3kk", "4kk"]).describe("Apartment layout (Czech notation). Picks the market band by bedroom count: 1kk and 2kk = one bedroom, 3kk = two, 4kk = three or more. Also presets the floor area (35/53/71/88 m2)."),
    floorAreaM2: z.number().int().min(18).max(140).optional()
      .describe("Floor area in m2. Overrides the layout preset; drives only the long-term rent comparison."),
    season: z
      .enum(["year", "summer", "winter", "xmas"])
      .optional()
      .describe("Season to price for. Defaults to 'year' (yearly average). Seasonal factors come from realized monthly market data of the district; summer (Apr-Oct), winter (Nov-Mar excl. December) and December compose the year exactly."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ location, size, floorAreaM2, season }) => {
    const label = locations[location];
    const sz = size as SizeKey;
    const m2 = floorAreaM2 ?? SIZE_PRESET[sz].m2;
    const seasonKey = (season ?? "year") as SeasonKey;
    const r = ownerMonthly(location, sz, { season: seasonKey });
    const longTermRent = rentFor(location as LocationKey, sz, m2);

    if (!r.supported) {
      const reason = isMeasured(location)
        ? `too few comparable listings in the ${bandFor(sz)} band in ${label}`
        : `no district market data for ${label} yet`;
      return {
        content: [
          {
            type: "text" as const,
            text: `${label}, ${sz} (${m2} m2): no published estimate (${reason}). Antam Homes only shows numbers where the market sample is solid. Send the address and layout and you get an individual calculation for the specific apartment within 24 hours, free and non-binding. For context, the long-term rent benchmark for ${m2} m2 is ~${czk(longTermRent)} CZK/month (Deloitte Rent Index Q2/2026).`,
          },
        ],
        structuredContent: {
          currency: "CZK",
          location: label,
          size: sz,
          floorAreaM2: m2,
          supported: false,
          reason,
          longTermRentBenchmark: longTermRent,
          note: "Estimates are published only where the district market sample is solid (PriceLabs STR index). An individual assessment for any apartment is free and takes up to 24 hours.",
        },
      };
    }

    const yearly = ownerMonthly(location, sz);
    const yearlyNet = yearly.supported ? yearly.antam.net : r.antam.net;
    const yearlyMarketNet = yearly.supported ? yearly.market.net : r.market.net;
    const result = {
      currency: "CZK",
      location: label,
      size: sz,
      floorAreaM2: m2,
      supported: true,
      bedroomBand: r.band,
      season: seasonKey,
      realizedMarketNightlyRate: r.adr,
      marketAverage: {
        occupancyRate: r.market.occupancy,
        grossMonthlyRevenue: r.market.gross,
        platformCommission: r.market.platformFee,
        netRevenueAfterPlatform: r.market.netRevenue,
        managementCommission: r.market.mgmt,
        netMonthlyIncomeForOwner: r.market.net,
        netYearlyAverage: yearlyMarketNet * 12,
        multipleVsLongTermRent: Math.round((r.market.net / longTermRent) * 10) / 10,
      },
      withAntamHomes: {
        occupancyRate: r.antam.occupancy,
        occupancyAssumption: `district market occupancy x ${OCC_UPLIFT}, capped at ${Math.round(OCC_CAP * 100)} %; apartments under Antam Homes management measure 85-97 %`,
        grossMonthlyRevenue: r.antam.gross,
        platformCommission: r.antam.platformFee,
        netRevenueAfterPlatform: r.antam.netRevenue,
        managementCommission: r.antam.mgmt,
        netMonthlyIncomeForOwner: r.antam.net,
        netYearlyAverage: yearlyNet * 12,
        multipleVsLongTermRent: Math.round((r.antam.net / longTermRent) * 10) / 10,
      },
      platformCommissionRate: PLATFORM_FEE,
      managementCommissionRate: MGMT_FEE,
      longTermRentBenchmark: longTermRent,
      note: "Nightly rate = realized market price of the whole district for this bedroom count (PriceLabs STR index, official district boundary, 12 closed months to 7/2026). marketAverage uses the district's market occupancy; withAntamHomes uses the same price at the occupancy Antam Homes plans with (market x 1.15, capped at 85 %). The Antam Homes fee is 30 % of net revenue: what the platform pays out, after deducting the cleaning fee. The fee is final; nothing is added on top, and it also covers the Czech VAT due on the platform commission. Every apartment Antam Homes accepts for management comes with a written yearly income guarantee (at least the long-term rent plus utilities); eligibility is checked free of charge before signing, and this estimate is not that guarantee. Guests pay the cleaning fee separately; it is retained by Antam Homes. Utilities (electricity, water) are paid by the owner and are not included. Long-term rent = Deloitte Rent Index Q2/2026 for the district applied to the floor area (MF price map size gradient).",
    };

    return {
      content: [
        {
          type: "text" as const,
          text: `${label}, ${sz} (${r.band}, ${m2} m2): realized market rate ${czk(r.adr)} CZK/night. Market average (occupancy ${Math.round(r.market.occupancy * 100)} %): owner nets ~${czk(r.market.net)} CZK/month. With Antam Homes (occupancy ${Math.round(r.antam.occupancy * 100)} %): owner nets ~${czk(r.antam.net)} CZK/month (gross ${czk(r.antam.gross)} CZK, platform commission ${czk(r.antam.platformFee)} CZK, Antam Homes 30 % ${czk(r.antam.mgmt)} CZK). Long-term rent benchmark ~${czk(longTermRent)} CZK/month, roughly ${result.withAntamHomes.multipleVsLongTermRent}x (market average ${result.marketAverage.multipleVsLongTermRent}x).`,
        },
      ],
      structuredContent: result,
    };
  },
});
