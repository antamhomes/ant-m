import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalcProvider } from "../contexts/CalcContext";
import CalculatorSection from "../components/CalculatorSection";
import { ownerMonthly, rentFor, bucketFor, typicalArea } from "../lib/yield";
import { classifyBand } from "../lib/leadBand";
import { dataWindowLabel } from "../lib/dataWindow";
import translations from "../i18n/translations";

vi.mock("@/lib/analytics", () => ({
  trackEvent: () => {},
  analyticsEnabled: () => false,
  getStoredConsent: () => null,
  initAnalytics: () => {},
  setConsent: () => {},
  GA_MEASUREMENT_ID: "",
}));

/**
 * KARTA VÝSLEDKU PODLE PÁSMA (patch 2, docs/funnel-spec-2026-09-07.md §3).
 * Číslo je pro všechna pásma totéž (žádná ekonomika se nemění); liší se věta,
 * barva řádku 2, tlačítko, slib a sdílení. Písmeno pásma se nikde nekreslí.
 */
const cs = translations.cs;
const strip = (s: string) => s.replace(/\u00a0/g, " ");
const setup = () => render(<CalcProvider><CalculatorSection /></CalcProvider>);
const card = () => document.querySelector(".calc-result") as HTMLElement;
const text = () => strip(card().textContent ?? "");
const pick = (v: string) => fireEvent.change(screen.getByRole("combobox"), { target: { value: v } });
const cta = () => card().querySelector("a[href='#kontakt']") as HTMLAnchorElement;
const ctaText = () => strip(cta().textContent ?? "");
const shareBtn = () => [...card().querySelectorAll("button")].find((b) => /WhatsApp|Zalo|Zkopírov/.test(b.textContent ?? ""));

const bandFor = (loc: "praha1" | "praha4" | "praha9", ctvrt: string | undefined, size: "2kk") => {
  const m2 = bucketFor(size, typicalArea(loc, size)).representativeM2!;
  const r = ownerMonthly(loc, size, { season: "year", m2, ctvrt });
  const ltr = rentFor(loc, size, m2, "mix", ctvrt);
  if (!r.supported) throw new Error("fixture musi byt podporovana");
  return { r, ltr, band: classifyBand({ supported: true, oversized: false, ownerHigh: r.high, ltrMonth: ltr, size, bucket: bucketFor(size, m2).id }) };
};

describe("karta vysledku podle pasma", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("SILNY byt (Stare Mesto 2+kk): zlaty radek 2 s benefitem i nasobkem, veta pasma, hlavni CTA, slib, sdileni", () => {
    const f = bandFor("praha1", "stare_mesto", "2kk");
    expect(f.band.band).toBe("strong");
    setup();
    pick("praha1");
    fireEvent.click(screen.getByText("Staré Město"));
    const tx = text();
    // řádek 2: „+X Kč ročně · přibližně Y× dlouhodobý nájem (Z Kč)“ z jednoho klíče
    const delta = Math.round(((f.r.high - f.ltr) * 12) / 1000) * 1000;
    const ltrK = Math.round(f.ltr / 1000) * 1000;
    expect(tx).toContain(`+${strip(delta.toLocaleString("cs-CZ"))} Kč ročně`);
    expect(tx).toContain(`× dlouhodobý nájem (${strip(ltrK.toLocaleString("cs-CZ"))} Kč)`);
    // starý blok „Dlouhodobý pronájem“ a šipka „→ přibližně … více“ jsou pryč
    expect(tx).not.toMatch(/DLOUHODOBÝ PRONÁJEM|→/);
    expect(tx).not.toContain(strip(cs.calc_rent_src));
    // řádek 3: vybraný byt s reprezentativní plochou
    expect(tx).toMatch(/Praha 1\s*·\s*Staré Město\s*·\s*2\+kk\s*·\s*kolem \d+ m²/);
    // řádek 4: realizovaná cena za noc + okno dat z konstanty
    expect(tx).toContain(`Realizované ceny v okolí (2 ložnice): ${strip(f.r.adr.toLocaleString("cs-CZ"))} Kč/noc · ${dataWindowLabel("cs")}`);
    // věta pásma bez písmene
    expect(tx).toContain(strip(cs.calc_band_strong));
    expect(tx).not.toMatch(/\bstrong\b|\bviable\b|\bweak\b/);
    // CTA + slib + testovací věta + sdílení
    expect(ctaText()).toContain(strip(cs.calc_cta));
    expect(cta().className).toContain("btn-primary-inverse");
    expect(tx).toContain(strip(cs.calc_promise));
    expect(tx).toContain(strip(cs.calc_guarantee_line));
    expect(shareBtn()).toBeTruthy();
    // barva řádku 2: zlatá
    const line2 = [...card().querySelectorAll("p")].find((p) => /ročně/.test(p.textContent ?? ""))!;
    expect(line2.className).toContain("text-gold");
  });

  it("NADEJNY byt (Praha 9 Ostatni 2+kk): veta viable, jinak jako silny", () => {
    const f = bandFor("praha9", undefined, "2kk");
    expect(f.band.band).toBe("viable");
    setup();
    pick("praha9");
    const tx = text();
    expect(tx).toContain(strip(cs.calc_band_viable));
    expect(tx).not.toContain(strip(cs.calc_band_strong));
    expect(ctaText()).toContain(strip(cs.calc_cta));
    expect(tx).toContain(strip(cs.calc_promise));
    expect(shareBtn()).toBeTruthy();
  });

  it("SLABY byt (Praha 4 Ostatni 2+kk): stejne cislo, neutralni radek 2, vedlejsi CTA, bez slibu a bez sdileni", () => {
    const f = bandFor("praha4", undefined, "2kk");
    expect(f.band.band).toBe("weak");
    setup();
    pick("praha4");
    const tx = text();
    // číslo se NEMĚNÍ podle pásma
    expect(tx).toContain(`~${strip((Math.round(f.r.high / 1000) * 1000).toLocaleString("cs-CZ"))} Kč`);
    // benefit se pořád říká (je pravdivý), jen ne zlatě
    expect(tx).toMatch(/\+\d[\d ]* Kč ročně/);
    const line2 = [...card().querySelectorAll("p")].find((p) => /ročně/.test(p.textContent ?? ""))!;
    expect(line2.className).not.toContain("text-gold");
    expect(tx).toContain(strip(cs.calc_band_weak));
    expect(ctaText()).toContain(strip(cs.calc_cta_weak));
    expect(cta().className).toContain("btn-secondary-inverse");
    expect(tx).not.toContain(strip(cs.calc_promise));
    expect(tx).not.toContain(strip(cs.calc_guarantee_line));
    expect(shareBtn()).toBeUndefined();
  });

  it("odvozene cislo dostane novou neutralni vetu (Praha 3 Ostatni 3+kk)", () => {
    setup();
    pick("praha3");
    fireEvent.click(screen.getByRole("button", { name: "3+kk" }));
    const m2 = bucketFor("3kk", typicalArea("praha3", "3kk")).representativeM2!;
    const r = ownerMonthly("praha3", "3kk", { season: "year", m2, ctvrt: undefined });
    expect(r.supported && r.derived).toBe(true);
    expect(text()).toContain(strip(cs.calc_derived_note));
    expect(strip(cs.calc_derived_note)).not.toMatch(/čtvrť/);
  });

  it("sezona se do radku 3 pripise jen mimo cely rok", () => {
    setup();
    pick("praha1");
    expect(text()).not.toContain(strip(cs.calc_season_year));
    fireEvent.click(screen.getByText(strip(cs.calc_season_toggle)));
    fireEvent.click(screen.getByText(strip(cs.calc_season_xmas)));
    expect(text()).toMatch(/m²\s*·\s*Vánoce/);
  });

  it("nepodporovana lokalita ma vlastni popisek tlacitka a zadnou vetu pasma", () => {
    setup();
    pick("jinde");
    expect(ctaText()).toContain(strip(cs.calc_cta_unsupported));
    for (const k of ["calc_band_strong", "calc_band_viable", "calc_band_weak", "calc_promise"] as const)
      expect(text()).not.toContain(strip(cs[k]));
  });

  it("metodika pod sekci zacina oknem dat z konstanty", () => {
    setup();
    const drawer = document.querySelector("#kalkulacka details p") as HTMLElement;
    expect(strip(drawer.textContent ?? "")).toContain(strip(cs.calc_method_window).replace("{window}", dataWindowLabel("cs")));
    expect(strip(drawer.textContent ?? "")).toContain("orientační");
  });
});
