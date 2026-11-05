import { defineMcp } from "@lovable.dev/mcp-js";
import estimateYieldTool from "./tools/estimate-yield";
import listPortfolioTool from "./tools/list-portfolio";
import getServicesTool from "./tools/get-services";
import getContactTool from "./tools/get-contact";
import quoteLeaseTool from "./tools/quote-lease";

export default defineMcp({
  name: "antamhome",
  title: "Antamhome",
  version: "0.1.0",
  instructions:
    "Tools for Antam (Antam Homes s.r.o.), Prague. Antam rents investors' apartments for 3 years and pays a monthly rent equal to the investor's mortgage payment, even in empty months; it operates the apartments as short- and mid-term rentals. Use `quote_lease` for the payment and the rent Antam would pay for a given price, district and layout, `get_services_and_faq` for the offer and FAQ, `list_portfolio` for the apartments Antam operates today, `estimate_rental_yield` for market revenue data by district, and `get_contact_info` for contact details. All data is public marketing information.",
  tools: [quoteLeaseTool, getServicesTool, listPortfolioTool, estimateYieldTool, getContactTool],
});