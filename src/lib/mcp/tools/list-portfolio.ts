import { defineTool } from "@lovable.dev/mcp-js";

// Owner income = real results recalculated to the current 30 % Antam fee: room revenue after
// platform commission, without cleaning fees and without the local tourist tax, monthly average
// over the last 12 full months (to 31 Jul 2026) or since the first stay for newer flats.
// Recomputed 27 Aug 2026 from real reservations and reconciled against Booking.com payout
// statements; the earlier figures wrongly counted the guest-paid tourist tax as owner income.
const apartments = [
  { name: "Secret garden loft", location: "Praha 4", maxGuests: 13, managedSince: "2026-07", note: "new, results after the first season" },
  { name: "Elegant Museum View Apartment (402)", location: "Praha 1", maxGuests: 8, ownerMonthlyCzk: 61000, occupancyPct: 96, period: "12 months to 2026-07", vsLongTermRent: 2.2 },
  { name: "Modern Museum View Apartment (405)", location: "Praha 1", maxGuests: 8, ownerMonthlyCzk: 53000, occupancyPct: 95, period: "12 months to 2026-07", vsLongTermRent: 1.9 },
  { name: "Moderní apartmán se zahradou", location: "Praha 4", maxGuests: 6, ownerMonthlyCzk: 42000, occupancyPct: 83, period: "2026-04 to 2026-07", vsLongTermRent: 1.6 },
  { name: "Secret garden studio I", location: "Praha 4", maxGuests: 4, managedSince: "2026-07", note: "new, results after the first season" },
  { name: "Secret garden studio II", location: "Praha 4", maxGuests: 4, managedSince: "2026-07", note: "new, results after the first season" },
  { name: "Klement apartment s terasou", location: "Mladá Boleslav", maxGuests: 8, ownerMonthlyCzk: 30000, occupancyPct: 93, period: "2026-04 to 2026-07" },
  { name: "Klement apartment", location: "Mladá Boleslav", maxGuests: 8, managedSince: "2026-08", note: "new, results after the first season" },
  { name: "My Mozart studio", location: "Praha 5", maxGuests: 4, ownerMonthlyCzk: 31000, occupancyPct: 93, period: "2026-02 to 2026-07", vsLongTermRent: 1.7 },
];

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
          "\n\nOwner income = real results recalculated to the current 30 % Antam Homes fee: room revenue after the Airbnb/Booking commission, without cleaning fees and without the local tourist tax; energy paid by owner. Past results are not a guarantee." +
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