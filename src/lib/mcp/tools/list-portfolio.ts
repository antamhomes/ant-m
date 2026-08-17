import { defineTool } from "@lovable.dev/mcp-js";

const apartments = [
  { name: "Secret garden loft", location: "Praha 4", maxGuests: 13 },
  { name: "Moderní apartmán se zahradou", location: "Praha 4", maxGuests: 6 },
  { name: "Secret garden studio I", location: "Praha 4", maxGuests: 4 },
  { name: "Secret garden studio II", location: "Praha 4", maxGuests: 4 },
  { name: "Elegant Museum View Apartment (402)", location: "Praha 1", maxGuests: 8 },
  { name: "Modern Museum View Apartment (405)", location: "Praha 1", maxGuests: 8 },
  { name: "Klement apartment s terasou", location: "Mladá Boleslav", maxGuests: 8 },
  { name: "Klement apartment", location: "Mladá Boleslav", maxGuests: 8 },
  { name: "My Mozart studio", location: "Praha 5", maxGuests: 4 },
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
          .map((a, i) => `${i + 1}. ${a.name}, ${a.location} (up to ${a.maxGuests} guests)`)
          .join("\n") +
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