import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import translations from "@/i18n/translations";

/**
 * POŘADÍ A SLOVNÍ ZÁSOBA TRYCHTÝŘE (patch 2, docs/funnel-spec-2026-09-07.md §1, §6).
 * Primární cesta: Hero → Výsledky → Kalkulačka → Ceník (s garancí) → Jak začít
 * → Kontakt. Za formulářem jen ujištění. Jedna slovní zásoba pro jednu akci.
 */
const cs = translations.cs;
const src = (p: string) => readFileSync(p, "utf8");

describe("poradi sekci (tri stranky, 2. 11. 2026)", () => {
  const order = (file: string) =>
    [...src(file).matchAll(/<Suspense fallback=\{null\}><(\w+)(?: variant="[\w-]+")? \/><\/Suspense>/g)].map((m) => m[1]);

  it("homepage je tridic: slib, dukaz, cislo, dve cesty, srovnani, kdo jsme, formular", () => {
    const index = src("src/pages/Index.tsx");
    expect(index).toContain('<PageShell page="home">');
    expect(index).toContain("<HeroSection />");
    expect(index).toContain('<PricingSection variant="both" />');
    expect(order("src/pages/Index.tsx")).toEqual([
      "PortfolioSection", "CalculatorSection", "PricingSection", "ComparisonSection", "AboutSection", "ContactSection", "FinalCtaSection",
    ]);
    for (const s of ["SystemSection", "ProcessSection", "FAQSection", "ServicesSection", "OwnerReportSection", "GaranceSection", "HorizonSection", "ChoiceSection", "OccupancySection"])
      expect(index, `${s} nepatri na homepage`).not.toContain(s);
  });

  it("/sprava mluvi jen k majiteli, ktery byt provozovat nechce", () => {
    const page = src("src/pages/Sprava.tsx");
    expect(page).toContain('<PageShell page="sprava">');
    expect(page).toContain('<PageHero page="sprava" />');
    expect(page).toContain('<PricingSection variant="managed" />');
    expect(page).toContain('<ProcessSection variant="managed" />');
    expect(page).toContain('<FAQSection variant="managed" />');
    expect(order("src/pages/Sprava.tsx")).toEqual([
      "PortfolioSection", "CalculatorSection", "ServicesSection", "OwnerReportSection", "PricingSection", "ProcessSection", "FAQSection", "ContactSection", "FinalCtaSection",
    ]);
    expect(page).not.toContain("SystemSection");
    expect(page).not.toContain("ComparisonSection");
  });

  it("/vlastni-provoz mluvi jen k cloveku, ktery chce provozovat sam", () => {
    const page = src("src/pages/VlastniProvoz.tsx");
    expect(page).toContain('<PageShell page="vlastni-provoz">');
    expect(page).toContain('<PageHero page="vlastni-provoz" />');
    expect(page).toContain('<PricingSection variant="own" />');
    expect(page).toContain('<ProcessSection variant="own" />');
    expect(page).toContain('<FAQSection variant="own" />');
    expect(order("src/pages/VlastniProvoz.tsx")).toEqual([
      "OperatorReviewSection", "SystemSection", "PricingSection", "TipsSection", "ComparisonSection", "ProcessSection", "FAQSection", "ContactSection", "FinalCtaSection",
    ]);
    for (const s of ["CalculatorSection", "ServicesSection", "OwnerReportSection"]) expect(page).not.toContain(s);
  });

  it("kostra stranky nese navigaci, SEO, kalkulacni kontext, paticku a cookies", () => {
    const shell = src("src/components/PageShell.tsx");
    for (const s of ["<Navbar />", "<SEO page={page} />", "<CalcProvider>", "<Footer />", "<StickyMobileCTA />", "<CookieConsent />", "<ScrollToHash />"]) expect(shell).toContain(s);
  });

  it("navigace vede na obe stranky a znaci tu otevrenou", () => {
    const nav = src("src/components/Navbar.tsx");
    for (const k of ['"nav_sprava"', '"nav_own"', '"nav_calculator"', '"nav_about"', "aria-current"]) expect(nav).toContain(k);
  });
});

describe("komprese", () => {
  it("PortalDemo se na verejne strance nerenderuje, portal zustava jako titulek a odkaz", () => {
    const report = src("src/components/OwnerReportSection.tsx");
    expect(report).not.toMatch(/<PortalDemo\s*\/>/);
    expect(report).not.toContain('"portal_note"');
    for (const k of ["portal_title", "portal_desc", "portal_open", "report_row_net", "report_multi"]) expect(report).toContain(k);
  });

  it("Srovnani ma tri radky, treti sloupec Provozuji sam a poctive odmitnuti", () => {
    const cmp = src("src/components/ComparisonSection.tsx");
    expect((cmp.match(/comp\d_title/g) ?? []).length).toBe(3);
    expect(cmp).toContain("selfTerm_label");
    expect((cmp.match(/comp\d_self/g) ?? []).length).toBe(3);
    expect(cmp).not.toContain("comp4_title");
    expect(cmp).toContain("faq13_a");
  });

  it("Kdo jsme v CZ: citat, about_p1 a about_p4", () => {
    const about = src("src/components/AboutSection.tsx");
    expect(about).toMatch(/cs: \["about_p4"\]/);
    expect(about).toContain("about_p1");
    expect(about).toContain("about_quote");
  });

  it("Jak zacit nema vlastni tlacitko (formular je hned pod nim), sezonni veta zustava", () => {
    const process = src("src/components/ProcessSection.tsx");
    expect(process).not.toContain('"process_cta"');
    expect(process).not.toContain('href="#kontakt"');
    expect(process).toContain("process_season");
  });

  it("faq9 (cislo v kalkulacce je po odmene) se renderuje jako prvni v Penezich", () => {
    const faq = src("src/components/FAQSection.tsx");
    expect(faq.indexOf('"faq9_q"')).toBeGreaterThan(-1);
    expect(faq.indexOf('"faq9_q"')).toBeLessThan(faq.indexOf('"faq18_q"'));
    expect(cs.faq9_a).toMatch(/po naší odměně 20 % \+ DPH/);
  });
});

describe("jedna slovni zasoba pro jednu akci", () => {
  it("chrome rika Poslat byt, karta a formular mluvi o vypoctu, hero o potencialu", () => {
    expect(cs.nav_freeConsultation).toBe("Poslat byt");
    expect(cs.mobile_cta).toBe("Poslat byt");
    expect(cs.g_cta).toBe("Poslat byt k výpočtu");
    expect(cs.process_cta).toBe(cs.g_cta);
    expect(cs.contact_submit).toBe("Poslat byt k výpočtu");
    expect(cs.calc_cta).toBe("Chci výpočet pro svůj byt");
    expect(cs.calc_cta_weak).toBe("Poslat byt k posouzení");
    expect(cs.calc_cta_unsupported).toBe("Poslat byt k výpočtu");
    expect(cs.hero_cta).toBe("Zjistit potenciál bytu");
    // staré popisky se nikde nevrací
    const files = ["src/components/Navbar.tsx", "src/components/StickyMobileCTA.tsx", "src/components/FinalCtaSection.tsx", "src/components/PricingSection.tsx", "src/components/CalculatorSection.tsx", "src/components/ContactSection.tsx"];
    for (const f of files) expect(src(f)).not.toMatch(/Napsat nám|Poslat nám byt|Chci přesnější propočet/);
    for (const [k, v] of Object.entries(cs)) if (typeof v === "string" && /_cta$|_submit$|nav_freeConsultation|mobile_cta/.test(k))
      expect(v, k).not.toMatch(/^Napsat nám$|^Poslat nám byt$|^Chci přesnější propočet$/);
  });
});
