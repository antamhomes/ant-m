import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CalcProvider } from "../contexts/CalcContext";
import CalculatorSection from "../components/CalculatorSection";
import StickyMobileCTA from "../components/StickyMobileCTA";
import translations from "../i18n/translations";
import type { LeadCalcPayload } from "../lib/leadBand";

const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...a: unknown[]) => track(...a),
  analyticsEnabled: () => false, getStoredConsent: () => null, initAnalytics: () => {}, setConsent: () => {}, GA_MEASUREMENT_ID: "",
}));

/**
 * PATCH 3 (spec §2): na mobilu stojí karta vždy za vstupy a při prvním
 * výsledku se na ni stránka posune; lišta dole ukazuje v kalkulačce aktuální
 * číslo se stejným tlačítkem jako karta, nad kartou a nad formulářem mizí,
 * jinde říká „Poslat byt".
 */
const cs = translations.cs;
const strip = (s: string) => s.replace(/\u00a0/g, " ");
const pick = (v: string) => fireEvent.change(screen.getByRole("combobox"), { target: { value: v } });
const rect = (top: number, bottom: number) => () => ({ top, bottom, left: 0, right: 390, width: 390, height: bottom - top, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
const matchMedia = (matches: boolean) => Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({ matches, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }),
});

describe("karta na mobilu", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => matchMedia(false));

  it("stoji vzdy za vstupy: --calc-order je 2 pred i po vysledku", () => {
    render(<CalcProvider><CalculatorSection /></CalcProvider>);
    const card = () => document.querySelector(".calc-result") as HTMLElement;
    expect(card().style.getPropertyValue("--calc-order")).toBe("2");
    pick("praha1");
    expect(card().style.getPropertyValue("--calc-order")).toBe("2");
    pick("praha5");
    expect(card().style.getPropertyValue("--calc-order")).toBe("2");
  });

  it("na mobilu se pri PRVNIM vysledku posune na kartu, pri dalsich uz ne; na desktopu nikdy", () => {
    matchMedia(true);
    const first = render(<CalcProvider><CalculatorSection /></CalcProvider>);
    const spy = Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>;
    spy.mockClear();
    pick("praha1");
    expect(spy).toHaveBeenCalledTimes(1);
    expect((spy.mock.contexts[0] as HTMLElement).className).toContain("calc-result");
    pick("praha5");
    fireEvent.click(screen.getByRole("button", { name: "3+kk" }));
    expect(spy).toHaveBeenCalledTimes(1);
    first.unmount();
    // desktop
    matchMedia(false);
    render(<CalcProvider><CalculatorSection /></CalcProvider>);
    spy.mockClear();
    pick("praha1");
    expect(spy).not.toHaveBeenCalled();
  });

  it("sdileny odkaz zacina s lokalitou, takze se na kartu neposouva navic", () => {
    matchMedia(true);
    window.history.replaceState({}, "", "/?byt=praha2-vinohrady-2kk-52m-year");
    render(<CalcProvider><CalculatorSection /></CalcProvider>);
    const spy = Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>;
    // fromShare posouvá na sekci #kalkulacka (existující chování), ne na kartu
    const targets = spy.mock.contexts.map((el) => (el as HTMLElement).id || (el as HTMLElement).className);
    expect(targets.some((t) => String(t).includes("calc-result"))).toBe(false);
  });
});

describe("kontextova lista na mobilu", () => {
  const payload: LeadCalcPayload = {
    model_version: "2026-09-07.1", data_window: { from: "2025_08", to: "2026_07", months: 12 },
    district: "praha1", district_label: "Praha 1", ctvrt: "stare_mesto", ctvrt_label: "Staré Město",
    dispozice: "2kk", size_label: "2+kk", size_bucket_id: "l", bucket_label: "Větší (56–80 m²)",
    representative_m2: 63, oversized: false, season: "year",
    owner_low: 52418, owner_high: 63374, ltr_month: 32255, ltr_ctvrt_factor: 1.1,
    derived: false, result_band: "strong", ratio: 1.96, annual_delta: 373428,
  };
  let calc: HTMLElement, card: HTMLElement, kontakt: HTMLElement;
  const place = (calcTop: number, cardTop: number, kontaktTop: number) => {
    calc.getBoundingClientRect = rect(calcTop, calcTop + 1500);
    card.getBoundingClientRect = rect(cardTop, cardTop + 500);
    kontakt.getBoundingClientRect = rect(kontaktTop, kontaktTop + 1200);
    act(() => { window.dispatchEvent(new Event("scroll")); });
  };
  const bar = () => document.querySelector("a[data-sticky-state]") as HTMLAnchorElement;
  const wrapper = () => bar().parentElement as HTMLElement;

  beforeEach(() => {
    track.mockClear();
    Object.defineProperty(window, "innerHeight", { writable: true, value: 800 });
    Object.defineProperty(window, "scrollY", { writable: true, value: 2000 });
    calc = document.createElement("section"); calc.id = "kalkulacka";
    card = document.createElement("div"); card.className = "calc-result"; calc.appendChild(card);
    kontakt = document.createElement("section"); kontakt.id = "kontakt";
    document.body.append(calc, kontakt);
  });
  afterEach(() => { calc.remove(); kontakt.remove(); });

  it("mimo kalkulacku rika Poslat byt; v kalkulacce s vysledkem cislo + tlacitko karty; nad kartou a nad formularem mizi", () => {
    render(<StickyMobileCTA />);
    // mimo kalkulačku (sekce daleko dole), pod hero
    place(3000, 4000, 9000);
    expect(wrapper().getAttribute("aria-hidden")).toBe("false");
    expect(bar().dataset.stickyState).toBe("generic");
    expect(strip(bar().textContent ?? "")).toContain(strip(cs.mobile_cta));
    // výsledek přijde z kalkulačky
    act(() => { window.dispatchEvent(new CustomEvent("antam:calc-state", { detail: payload })); });
    // v kalkulačce: sekce na obrazovce, karta ještě pod ní
    place(-200, 1200, 9000);
    expect(bar().dataset.stickyState).toBe("calc");
    expect(strip(bar().textContent ?? "")).toContain("~63 000 Kč / měsíc");
    expect(strip(bar().textContent ?? "")).toContain(strip(cs.calc_cta));
    expect(wrapper().getAttribute("aria-hidden")).toBe("false");
    // karta ještě 200 px pod oknem → lišta zůstává (s přechodem)
    place(-200, 1000, 9000);
    expect(wrapper().getAttribute("aria-hidden")).toBe("false");
    expect(wrapper().className).toContain("transition-all");
    // karta se blíží ke spodní hraně (do STICKY_CARD_LEAD = 64 px) → lišta mizí DŘÍV,
    // než by ji překryla, a bez přechodu
    place(-200, 850, 9000);
    expect(wrapper().getAttribute("aria-hidden")).toBe("true");
    expect(wrapper().className).toContain("transition-none");
    // karta na obrazovce i s číslem → lišta mizí
    place(-900, 100, 9000);
    expect(wrapper().getAttribute("aria-hidden")).toBe("true");
    // slabý byt → tlačítko „k posouzení“
    act(() => { window.dispatchEvent(new CustomEvent("antam:calc-state", { detail: { ...payload, result_band: "weak" } })); });
    place(-200, 1200, 9000);
    expect(strip(bar().textContent ?? "")).toContain(strip(cs.calc_cta_weak));
    // formulář na obrazovce → lišta mizí, tentokrát s přechodem (karta je daleko)
    place(-9000, -8000, 300);
    expect(wrapper().getAttribute("aria-hidden")).toBe("true");
    expect(wrapper().className).toContain("transition-all");
    // za kalkulačkou (sekce nad obrazovkou) → zpět generická
    place(-5000, -4000, 9000);
    expect(bar().dataset.stickyState).toBe("generic");
  });

  it("klik v kalkulacce nese do poptavky stejny snapshot jako karta a hlasi pasmo", () => {
    render(<StickyMobileCTA />);
    act(() => { window.dispatchEvent(new CustomEvent("antam:calc-state", { detail: payload })); });
    place(-200, 1200, 9000);
    const seen: unknown[] = [];
    const onPrefill = (e: Event) => seen.push((e as CustomEvent).detail);
    window.addEventListener("antam:prefill-contact", onPrefill);
    fireEvent.click(bar());
    window.removeEventListener("antam:prefill-contact", onPrefill);
    expect(seen).toHaveLength(1);
    expect((seen[0] as { calc: LeadCalcPayload; location: string; size: string }).calc).toEqual(payload);
    expect((seen[0] as { location: string }).location).toBe("Praha 1");
    expect((seen[0] as { size: string }).size).toBe("2+kk");
    expect(track).toHaveBeenCalledWith("cta_click", expect.objectContaining({ location: "sticky_calc", band: "strong" }));
  });

  it("nepodporovana lokalita (bez cisla) necha listu genericko a lista si stav vyzada pri mountu", () => {
    const requests = vi.fn();
    window.addEventListener("antam:calc-state-request", requests);
    render(<StickyMobileCTA />);
    expect(requests).toHaveBeenCalledTimes(1);
    window.removeEventListener("antam:calc-state-request", requests);
    act(() => { window.dispatchEvent(new CustomEvent("antam:calc-state", { detail: { ...payload, owner_high: null, result_band: "unsupported" } })); });
    place(-200, 1200, 9000);
    expect(bar().dataset.stickyState).toBe("generic");
    expect(strip(bar().textContent ?? "")).toContain(strip(cs.mobile_cta));
  });
});
