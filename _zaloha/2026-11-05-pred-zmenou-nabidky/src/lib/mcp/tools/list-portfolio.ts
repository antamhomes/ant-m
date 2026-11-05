import { defineTool } from "@lovable.dev/mcp-js";
import { ratioFor } from "../../yield";

// Owner income, method confirmed by the owner 28 Aug 2026: what the platform actually pays out
// (already net of its own commission), minus the cleaning fee, then the 20 % + VAT fee. Airbnb
// settles in CZK, Booking.com in EUR (converted at 25,00); the local tourist tax was collected
// separately online and is not owner income. Monthly average over the last 12 full
// months (to 31 Oct 2026) or since the first stay for newer flats. Recomputed 2 Nov 2026 from
// Hospitable (accepted stays only); the Booking.com city tax collected inside the price on 402/405
// is excluded from owner income (it is remitted to the city). Klement: historical figure to 7/2026.
// vsLongTermRent (patch 127) is computed by the same ratioFor as the website cards: owner income /
// long-term rent for the flat's district and actual floor area (Deloitte Q2/2026 + MF size gradient).
type Apt =
  | { name: string; location: string; maxGuests: number; managedSince: string; note: string }
  | { name: string; location: string; maxGuests: number; floorAreaM2: number; ownerMonthlyCzk: number; occupancyPct: number; period: string; vsLongTermRent?: number };
const apartments: Apt[] = ([
  { name: "Elegant Museum View Apartment (402)", location: "Praha 1", maxGuests: 8, floorAreaM2: 52, ownerMonthlyCzk: 64000, occupancyPct: 94, period: "12 months to 2026-10" },
  { name: "Modern Museum View Apartment (405)", location: "Praha 1", maxGuests: 8, floorAreaM2: 52, ownerMonthlyCzk: 58000, occupancyPct: 94, period: "12 months to 2026-10" },
  { name: "Modern AC Apartment", location: "Praha 3", maxGuests: 6, floorAreaM2: 55, ownerMonthlyCzk: 57000, occupancyPct: 97, period: "2026-02 to 2026-10" },
  { name: "Moderní apartmán se zahradou", location: "Praha 3", maxGuests: 6, floorAreaM2: 60, ownerMonthlyCzk: 52000, occupancyPct: 92, period: "2026-04 to 2026-10" },
  // Správa skončila 10/2026; karta i tahle položka zůstávají jako historický měřený výsledek (rozhodnutí V. 22. 10. 2026).
  { name: "Klement apartment s terasou", location: "Mladá Boleslav", maxGuests: 8, floorAreaM2: 85, ownerMonthlyCzk: 32000, occupancyPct: 91, period: "2026-04 to 2026-07" },
  { name: "Secret Garden Loft", location: "Praha 4", maxGuests: 13, floorAreaM2: 110, ownerMonthlyCzk: 55000, occupancyPct: 79, period: "2026-07 to 2026-10" },
  // Two identical studios in one house, shown as one entry: average per studio.
  { name: "Secret Garden Studios (2 units, average per studio)", location: "Praha 4", maxGuests: 4, floorAreaM2: 22, ownerMonthlyCzk: 24000, occupancyPct: 95, period: "2026-07 to 2026-10" },
  { name: "Secret Garden Apartment", location: "Praha 4", maxGuests: 6, managedSince: "2026-09", note: "new, still ramping up, results after the first season" },
  { name: "Secret Garden 2BR Apartment", location: "Praha 4", maxGuests: 6, managedSince: "2026-09", note: "new, still ramping up, results after the first season" },
  { name: "Rustic AC Studio, Vinohrady", location: "Praha 2", maxGuests: 4, managedSince: "2026-09", note: "new, still ramping up, results after the first season" },
] as Apt[]).map((a) => ("ownerMonthlyCzk" in a ? { ...a, vsLongTermRent: ratioFor(a.location, a.floorAreaM2, a.ownerMonthlyCzk) ?? undefined } : a));

export default defineTool({
  name: "list_portfolio",
  title: "List managed apartments",
  description:
    "List the apartments Antam Homes currently prepares, photographs and manages, with their locations.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text" as const,
        text: apartments
          .map((a, i) => {
            const base = `${i + 1}. ${a.name}, ${a.location} (up to ${a.maxGuests} guests)`;
            if ("ownerMonthlyCzk" in a) {
              return `${base}: owner receives ~${a.ownerMonthlyCzk.toLocaleString("en-US")} CZK/month after all fees, occupancy ${a.occupancyPct} % (${a.period})${a.vsLongTermRent ? `, ${a.vsLongTermRent}x long-term rent` : ""}`;
            }
            return `${base}: managed since ${a.managedSince}, ${a.note}`;
          })
          .join("\n") +
          "\n\nOwner income = real results recalculated to the current Antam Homes fee of 20 % + 21 % VAT: what the platform actually pays out, minus the cleaning fee; energy paid by owner. Occupancy counts flats managed for more than three months and skips the first 45 days of operation. Long-term rent comes from the Deloitte Rent Index Q2/2026 applied to the flat\u2019s actual floor area. Past results are not a guarantee." +
          "\n\nComing soon: the portfolio is expanding to a total of 10 apartments across Prague. Guests have left over 520 reviews across Airbnb and Booking.com.",
      },
    ],
    structuredContent: {
      apartments,
      total: apartments.length,
      plannedTotalInPrague: 10,
      guestReviewsTotal: "520+",
    },
  }),
});