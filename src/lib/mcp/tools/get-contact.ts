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
      company: "Antam s.r.o.",
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
          text: `antam homes (Antam s.r.o.)\nEmail: ${info.email}\nTelefon: ${info.phone}\nKancelář: ${info.officePhone}\nWeb: ${info.website} (Vietnamese: ${info.vietnameseVersion})\nOblast: ${info.serviceArea}`,
        },
      ],
      structuredContent: info,
    };
  },
});