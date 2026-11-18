import { FAQ_KEYS } from "@/components/SEO";
import { t } from "@/i18n/translations";
import { META } from "@/lib/seoMeta";
import { pathFor, type PageKey } from "@/lib/pages";

const SITE = "https://www.antamhomes.com";
const plain = (s: string) => s.replace(/\u00a0/g, " ").replace(/\s*\n\s*/g, " ").trim();
type Key = Parameters<typeof t>[1];

/**
 * /llms.txt: stejná fakta jako na webu, v čistém textu pro AI asistenty
 * (ChatGPT, Perplexity, Claude, Gemini). Skládá se při buildu z META a z FAQ
 * v translations, takže se nemůže rozejít s tím, co je na stránkách.
 */
export const buildLlmsTxt = (): string => {
  const pages: PageKey[] = ["home", "sprava", "vlastni-provoz"];
  const faq = (page: PageKey) =>
    FAQ_KEYS[page]
      .map((k) => `### ${plain(t("cs", `${k}_q` as Key))}\n${plain(t("cs", `${k}_a` as Key))}`)
      .join("\n\n");
  return [
    "# Antam Homes",
    "",
    `> ${META.home.cs.desc}`,
    "",
    "Antam Homes is a short-term rental (Airbnb, Booking.com) management company in Prague, Czech Republic. Website language: Czech and Vietnamese.",
    "",
    "## Stránky",
    ...pages.map((p) => `- [${META[p].cs.title}](${SITE}${pathFor(p, "cs")}): ${META[p].cs.desc}`),
    "",
    "## Kontakt",
    `- E-mail: ${plain(t("cs", "footer_email"))}`,
    `- Telefon: ${plain(t("cs", "footer_phone"))}, ${plain(t("cs", "footer_office_phone"))}`,
    `- ${plain(t("cs", "footer_legal"))}`,
    "",
    "## Časté otázky: správa bytu",
    "",
    faq("sprava"),
    "",
    "## Časté otázky: vlastní provoz",
    "",
    faq("vlastni-provoz"),
    "",
  ].join("\n");
};
