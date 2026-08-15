import { defineMcp } from "@lovable.dev/mcp-js";
import estimateYieldTool from "./tools/estimate-yield";
import listPortfolioTool from "./tools/list-portfolio";
import getServicesTool from "./tools/get-services";
import getContactTool from "./tools/get-contact";

export default defineMcp({
  name: "antamhome",
  title: "Antamhome",
  version: "0.1.0",
  instructions:
    "Tools for Antam Homes, a short-term rental (Airbnb/Booking) management company for apartment owners in Prague. Use `estimate_rental_yield` to estimate an owner's monthly net income for a given Prague district and apartment size, `list_portfolio` for the apartments under management, `get_services_and_faq` for what the company does, and `get_contact_info` for contact details. All data is public marketing information.",
  tools: [estimateYieldTool, listPortfolioTool, getServicesTool, getContactTool],
});