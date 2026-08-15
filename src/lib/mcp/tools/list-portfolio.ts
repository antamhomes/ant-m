import { defineTool } from "@lovable.dev/mcp-js";

const apartments = [
  { name: "Secret garden studio", location: "Praha 4" },
  { name: "Secret garden studio", location: "Praha 4" },
  { name: "Secret garden loft", location: "Praha 4" },
  { name: "Moderní apartmán se zahradou", location: "Praha 4" },
  { name: "Klement apartment s terasou", location: "Mladá Boleslav" },
  { name: "Klement apartment", location: "Mladá Boleslav" },
  { name: "My Mozart studio", location: "Praha 3" },
];

export default defineTool({
  name: "list_portfolio",
  title: "List managed apartments",
  description:
    "List the apartments antam homes currently prepares, photographs and manages, with their locations.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text" as const,
        text: apartments
          .map((a, i) => `${i + 1}. ${a.name} — ${a.location}`)
          .join("\n") +
          "\n\nComing soon: the portfolio is expanding to a total of 10 apartments across Prague.",
      },
    ],
    structuredContent: {
      apartments,
      total: apartments.length,
      plannedTotalInPrague: 10,
    },
  }),
});