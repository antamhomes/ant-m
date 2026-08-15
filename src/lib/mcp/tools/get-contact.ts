import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_contact_info",
  title: "Get contact information",
  description:
    "Get antam homes contact details and how an apartment owner can start a no-obligation conversation about their apartment.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      company: "Donut Point, s.r.o.",
      companyId: "21904022",
      registeredSeat: "Příčná 1892/4, Nové Město, 110 00 Praha 1",
      brand: "antam homes",
      email: "antamhomes@gmail.com",
      phone: "727 952 459",
      officePhone: "607 338 126",
      website: "https://www.antamhomes.com",
      vietnameseVersion: "https://www.antamhomes.com/vn",
      serviceArea: "Praha a okolí",
      languages: ["čeština", "Tiếng Việt"],
    };
    return {
      content: [
        {
          type: "text" as const,
          text: `antam homes (Donut Point, s.r.o., IČO 21904022)\nEmail: ${info.email}\nTelefon: ${info.phone}\nKancelář: ${info.officePhone}\nWeb: ${info.website} (Vietnamese: ${info.vietnameseVersion})\nOblast: ${info.serviceArea}`,
        },
      ],
      structuredContent: info,
    };
  },
});