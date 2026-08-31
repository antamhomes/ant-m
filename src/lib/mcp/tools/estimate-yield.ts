import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  ownerMonthly, rentFor, isMeasured, typicalArea, MGMT_FEE, PLATFORM_FEE,
  operatorFactor, AVAILABILITY,
  type LocationKey, type SizeKey, type SeasonKey,
} from "../../yield";

// Tenhle nástroj NEMÁ vlastní kopii modelu: počítá stejnou funkcí
// ownerMonthly z lib/yield jako kalkulačka na webu.
//
// Popisy níž musí sedět s tím, co model OPRAVDU dělá, jinak MCP klientovi
// vysvětlí jiný model, než spočítá. Stav k 31. 8. 2026: pásmo trhu se bere
// z DISPOZICE A PLOCHY (BAND_BLEND: 2+kk se mezi 40 a 55 m² překlápí z 1BR
// do 2BR, 3+kk mezi 65 a 95 m² z 2BR do 3BR, 1+kk je 1BR a 4+kk je zastropené
// na 3BR, protože pásmo 4BR zatím nemáme). Kapacita hostů NENÍ vstup ani
// násobitel tržby: je to jen důvod, proč se pásmo mísí, a odhad z dispozice
// pro mísení pásma. Ven se kapacita NEVRACÍ (rozhodnutí 31. 8. 2026, stejné jako
// na webu): LLM by orientační číslo zopakovalo majiteli jako tvrdý fakt.
// Efekt Antam je NAMĚŘENÝ poměr tržby proti průměru trhu
// (operatorFactor), ne zvednutá obsazenost — starý model „obsazenost ×1,15,
// strop 85 %" byl 31. 8. 2026 opuštěn a nesmí se objevit v žádném popisu.
// Čtvrť či pásmo s malým vzorkem (a zatím Praha 10) vrací supported: false
// a doporučení individuálního posouzení; nikdy číslo jiné čtvrti.

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
    "Estimate the monthly net income an apartment owner in Prague could earn with Antam Homes short-term rental management, and compare it to long-term rent. Same model and same code as the calculator on the website: realized market prices of the whole district per bedroom band (PriceLabs STR index, 12 closed months). The public model maps LAYOUT + FLOOR AREA to a market band, blending between two bands over an area range; the result is a range whose low end is the district market average and whose high end is that same market times the measured Antam operator factor. Guest capacity is not an input, never multiplies revenue, and is deliberately NOT reported: how many beds fit depends on room proportions rather than total floor area, so do not state or estimate a guest count for the owner. Districts or bands with too small a market sample (and Praha 10 for now) get an individual assessment within 24 hours instead of a number.",
  inputSchema: {
    location: z
      .enum(["praha1", "praha2", "praha3", "praha4", "praha5", "praha6", "praha7", "praha8", "praha9", "praha10"])
      .describe("Prague district of the apartment."),
    size: z.enum(["1kk", "2kk", "3kk", "4kk"]).describe("Apartment layout in Czech notation (1kk = one room with kitchenette, 3kk = two separate bedrooms plus a living room). This is the PHYSICAL layout, not a bedroom count on Airbnb and not a guest capacity: those are three different things. Layout plus floor area picks the commercial market band. 1kk = 1BR. 2kk blends 1BR to 2BR between 40 and 55 m2 (measured on Antam's own flats: 40 m2 sleeping four earns as 1BR, 52 m2 sleeping eight earns as 2BR). 3kk blends 2BR to 3BR between 65 and 95 m2 (HEURISTIC consistency correction of 31 Aug 2026, not measured: no 3kk flat has trading history yet). 4kk is capped at 3BR because no 4BR market band exists yet, so large 4kk flats are understated. Long-term rent uses the district-typical floor area of the layout (Sreality medians) unless floorAreaM2 is given."),
    floorAreaM2: z.number().int().min(18).max(140).optional()
      .describe("Floor area in m2. Drives BOTH the commercial band blend (see `size`) and the long-term rent comparison, so it materially changes the estimate: a 3kk at 95 m2 is priced as a full 3BR product, the same layout at 65 m2 as a 2BR one. Give it whenever it is known. If omitted, the district-typical area for that layout is assumed (Sreality medians) and the answer is correspondingly less precise; the response then reports floorAreaAssumed: true."),
    season: z
      .enum(["year", "summer", "winter", "xmas"])
      .optional()
      .describe("Season to price for. Defaults to 'year' (yearly average). Seasonal factors come from realized monthly market data of the district; summer (Apr-Oct), winter (Nov-Mar excl. December) and December compose the year exactly."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ location, size, floorAreaM2, season }) => {
    const label = locations[location];
    const sz = size as SizeKey;
    const m2 = floorAreaM2 ?? typicalArea(location, sz);
    const seasonKey = (season ?? "year") as SeasonKey;
    // m² MUSÍ jít do modelu: od 31. 8. 2026 z něj plyne pásmo trhu (BAND_BLEND),
    // ne jen nájem. Bez něj by MCP počítalo jiný byt než kalkulačka na webu.
    const r = ownerMonthly(location, sz, { season: seasonKey, m2 });
    const longTermRent = rentFor(location as LocationKey, sz, m2);

    if (!r.supported) {
      const reason = isMeasured(location)
        ? `too few comparable listings in the ${r.band} band in ${label}`
        : `no district market data for ${label} yet`;
      return {
        content: [
          {
            type: "text" as const,
            text: `${label}, ${sz} (${m2} m2): no published estimate (${reason}). Antam Homes only shows numbers where the market sample is solid. Send the address and layout and you get an individual calculation for the specific apartment within 24 hours, free and non-binding. For context, the long-term rent benchmark for ${m2} m2 is ~${czk(longTermRent)} CZK/month (median of current Sreality listings, 8/2026).`,
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
          floorAreaAssumed: floorAreaM2 === undefined,
          note: "Estimates are published only where the district market sample is solid (PriceLabs STR index). An individual assessment for any apartment is free and takes up to 24 hours.",
        },
      };
    }

    const yearly = ownerMonthly(location, sz, { m2 });
    const yearlyNet = yearly.supported ? yearly.antam.net : r.antam.net;
    const yearlyMarketNet = yearly.supported ? yearly.market.net : r.market.net;
    const result = {
      currency: "CZK",
      location: label,
      size: sz,
      floorAreaM2: m2,
      /** true = caller gave no area, district-typical median assumed; estimate is less precise. */
      floorAreaAssumed: floorAreaM2 === undefined,
      supported: true,
      marketBand: r.band,
      bandDerivedFromSmallerFlats: r.derived,
      season: seasonKey,
      realizedMarketNightlyRate: r.adr,
      ownerRangeMonthly: { low: r.low, high: r.high, mid: r.mid },
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
        occupancyAssumption: `district market RevPAR x ${AVAILABILITY} (PriceLabs RevPAR counts available nights only) x measured Antam factor ${operatorFactor(location, "public")}; factor comes from reconciling eleven managed flats against PriceLabs, 8/2025-7/2026`,
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
      note: "Nightly rate = realized market price of the whole district for this bedroom band (PriceLabs STR index, official district boundary, 12 closed months to 7/2026). marketAverage uses the district's market occupancy; withAntamHomes applies the measured Antam operator factor (revenue ratio against the market mean, from reconciling eleven managed flats against PriceLabs) to the same market data. It is a measured revenue ratio, not an occupancy uplift: Antam's flats run 92-96 % occupancy at 63-77 % of market ADR, so the effect shows up in revenue, not in an assumed occupancy number. The Antam Homes fee is 30 % of net revenue: what the platform pays out, after deducting the cleaning fee. The fee is final; nothing is added on top, and it also covers the Czech VAT due on the platform commission. Every apartment Antam Homes accepts for management comes with a written yearly income guarantee (at least the long-term rent plus utilities); eligibility is checked free of charge before signing, and this estimate is not that guarantee. Guests pay the cleaning fee separately; it is retained by Antam Homes. Utilities (electricity, water) are paid by the owner and are not included. Long-term rent = median of 1 300+ fresh Sreality listings (8/2026) by district and actual floor area, cross-checked against Deloitte Rent Index Q2/2026. If floorAreaM2 was not supplied, floorAreaAssumed is true and the district-typical area was used for both the band blend and the rent, which makes the estimate noticeably less precise for atypically small or large flats.",
    };

    return {
      content: [
        {
          type: "text" as const,
          text: `${label}, ${sz}, ${m2} m2 (band ${r.band}${r.derived ? ", derived from smaller flats" : ""}): owner range ~${czk(r.low)} to ${czk(r.high)} CZK/month. Realized market rate ${czk(r.adr)} CZK/night. Market average (occupancy ${Math.round(r.market.occupancy * 100)} %): owner nets ~${czk(r.market.net)} CZK/month. With Antam Homes (occupancy ${Math.round(r.antam.occupancy * 100)} %): owner nets ~${czk(r.antam.net)} CZK/month (gross ${czk(r.antam.gross)} CZK, platform commission ${czk(r.antam.platformFee)} CZK, Antam Homes 30 % ${czk(r.antam.mgmt)} CZK). Long-term rent benchmark ~${czk(longTermRent)} CZK/month, roughly ${result.withAntamHomes.multipleVsLongTermRent}x (market average ${result.marketAverage.multipleVsLongTermRent}x).`,
        },
      ],
      structuredContent: result,
    };
  },
});
