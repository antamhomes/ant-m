import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CalcProvider } from "../contexts/CalcContext";
import CalculatorSection from "../components/CalculatorSection";
import { ownerMonthly, rentFor, bucketFor, typicalArea, MEDIAN_AREA } from "../lib/yield";
import { classifyBand, type LeadCalcPayload } from "../lib/leadBand";

// trackEvent je bez GA ID no-op; tady se sleduje, ŽE a S ČÍM se volá.
const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...a: unknown[]) => track(...a),
  analyticsEnabled: () => false,
  getStoredConsent: () => null,
  initAnalytics: () => {},
  setConsent: () => {},
  GA_MEASUREMENT_ID: "",
}));

/**
 * PRÁZDNÝ START (7. 9. 2026, audit trychtýře B3): dokud návštěvník nevybere
 * lokalitu, kalkulačka nic nepočítá a neukazuje. Do té doby byla výchozí
 * Praha 1 a každý viděl nejdřív její číslo. Sdílený odkaz lokalitu nese,
 * takže přijde rovnou s číslem.
 */
const setup = () => render(<CalcProvider><CalculatorSection /></CalcProvider>);
const card = () => document.querySelector(".calc-result") as HTMLElement;
const hasNumber = () => /\d[\d\u00a0\u202f ]{2,}\s*Kč/.test(card().textContent ?? "");
const pick = (v: string) => fireEvent.change(screen.getByRole("combobox"), { target: { value: v } });
const shownHigh = () => {
  const m = (card().textContent ?? "").match(/~([\d\u00a0\u202f ]+)\s*Kč/);
  return m ? Number(m[1].replace(/[\u00a0\u202f ]/g, "")) : null;
};

describe("prazdny start kalkulacky", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    // jsdom scrollIntoView neumí; sdílený odkaz na něj po mountu sahá
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("bez vybrane lokality neni zadne cislo, zadna Praha 1 a karta stoji za vstupy", () => {
    setup();
    expect(hasNumber()).toBe(false);
    expect(card().textContent).not.toMatch(/Praha 1/);
    expect(card().textContent).toContain("Začněte lokalitou.");
    // select nabízí prázdnou volbu a žádný okres není vybraný
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("");
    for (const b of document.querySelectorAll("[aria-labelledby='calc-location-label'] button"))
      expect(b.getAttribute("aria-pressed")).toBe("false");
    // krok „Upřesněte lokalitu“ se bez okresu nenabízí
    expect(document.querySelector("#kalkulacka-ctvrt")).toBeNull();
    // na mobilu karta ZA vstupy (--calc-order 2), dokud číslo není
    expect(card().style.getPropertyValue("--calc-order")).toBe("2");
  });

  it("bez lokality se nic nehlasi poptavce (antam:calc-state) a nic se nepocita", () => {
    const seen: unknown[] = [];
    const onState = (e: Event) => seen.push((e as CustomEvent).detail);
    window.addEventListener("antam:calc-state", onState);
    setup();
    expect(seen).toHaveLength(0);
    pick("praha3");
    expect(seen.length).toBeGreaterThan(0);
    window.removeEventListener("antam:calc-state", onState);
  });

  it("po vyberu lokality je cislo PRESNE to, co dava model (zadna regrese)", () => {
    setup();
    pick("praha1");
    expect(hasNumber()).toBe(true);
    expect(card().style.getPropertyValue("--calc-order")).toBe("1");
    // výchozí dispozice 2kk, kbelík z typické plochy Prahy 1 (setLocation ho přenastaví)
    const m2 = bucketFor("2kk", typicalArea("praha1", "2kk")).representativeM2!;
    const r = ownerMonthly("praha1", "2kk", { season: "year", m2, ctvrt: undefined });
    if (!r.supported) throw new Error("praha1 2kk musi byt podporovane");
    expect(shownHigh()).toBe(Math.round(r.high / 1000) * 1000);
  });

  it("vychozi kbelik pred vyberem lokality vychazi z celoprazske typicke plochy, ne z Prahy 1", () => {
    setup();
    const pressed = document.querySelector("#calc-size button[aria-pressed='true']") as HTMLElement;
    const expected = bucketFor("2kk", MEDIAN_AREA["2kk"]);
    expect(pressed.textContent).toContain(expected.id === "s" ? "Menší" : expected.id === "m" ? "Běžný" : expected.id === "l" ? "Větší" : "Ještě větší");
  });

  it("sdileny odkaz nese lokalitu, takze prijde rovnou s cislem", () => {
    window.history.replaceState({}, "", "/?byt=praha2-vinohrady-2kk-52m-year");
    setup();
    expect(hasNumber()).toBe(true);
    expect(card().textContent).toMatch(/Praha 2/);
    expect(card().textContent).toMatch(/Vinohrady/);
  });

  it("nepodporovana lokalita (jinde) se chova jako dosud: zadne cislo, poctive zavreni, CTA", () => {
    setup();
    pick("jinde");
    expect(hasNumber()).toBe(false);
    expect(card().textContent).toMatch(/Pro tuhle lokalitu nemáme vlastní/);
    expect(card().querySelector("a[href='#kontakt']")).toBeTruthy();
    expect(card().style.getPropertyValue("--calc-order")).toBe("1");
  });

  it("CTA posila poptavce snapshot s citelnymi popisky, pasmem a oknem dat", () => {
    const seen: LeadCalcPayload[] = [];
    const onPrefill = (e: Event) => seen.push((e as CustomEvent<{ calc: LeadCalcPayload }>).detail.calc);
    window.addEventListener("antam:prefill-contact", onPrefill);
    setup();
    pick("praha1");
    fireEvent.click(screen.getByText("Staré Město"));
    act(() => { fireEvent.click(card().querySelector("a[href='#kontakt']") as HTMLElement); });
    window.removeEventListener("antam:prefill-contact", onPrefill);
    expect(seen).toHaveLength(1);
    const p = seen[0];
    expect(p.district).toBe("praha1");
    expect(p.district_label).toBe("Praha 1");
    expect(p.ctvrt).toBe("stare_mesto");
    expect(p.ctvrt_label).toBe("Staré Město");
    expect(p.size_label).toBe("2+kk");
    expect(p.data_window).toEqual({ from: "2025_08", to: "2026_07", months: 12 });
    expect(typeof p.owner_high).toBe("number");
    expect(typeof p.ltr_month).toBe("number");
    const m2 = p.representative_m2!;
    const r = ownerMonthly("praha1", "2kk", { season: "year", m2, ctvrt: "stare_mesto" });
    if (!r.supported) throw new Error("Stare Mesto 2kk musi byt podporovane");
    const ltr = rentFor("praha1", "2kk", m2, "mix", "stare_mesto");
    expect(p.owner_high).toBe(r.high);
    expect(p.owner_low).toBe(r.low);
    expect(p.ltr_month).toBe(ltr);
    expect(p.derived).toBe(r.derived);
    const b = classifyBand({ supported: true, oversized: false, ownerHigh: r.high, ltrMonth: ltr, size: "2kk", bucket: p.size_bucket_id });
    expect(p.result_band).toBe(b.band);
    expect(p.result_band).toBe("strong");
    expect(p.ratio).toBeCloseTo(r.high / ltr, 10);
    expect(p.annual_delta).toBe((r.high - ltr) * 12);
  });
});

describe("analytika kalkulacky", () => {
  it("calc_start jednou, calc_location pri volbe okresu, calc_result s pasmem po 500 ms", () => {
    vi.useFakeTimers();
    track.mockClear();
    try {
      setup();
      pick("praha4");
      pick("praha5");
      const names = track.mock.calls.map((c) => c[0]);
      expect(names.filter((n) => n === "calc_start")).toHaveLength(1);
      expect(names.filter((n) => n === "calc_location")).toHaveLength(2);
      expect(names).not.toContain("calc_result");
      act(() => { vi.advanceTimersByTime(600); });
      const results = track.mock.calls.filter((c) => c[0] === "calc_result");
      expect(results).toHaveLength(1);
      expect(results[0][1]).toMatchObject({ district: "praha5", size: "2kk", season: "year" });
      expect(["strong", "viable", "weak"]).toContain((results[0][1] as { band: string }).band);
    } finally {
      vi.useRealTimers();
    }
  });
});
