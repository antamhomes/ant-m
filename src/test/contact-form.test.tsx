import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import ContactSection from "../components/ContactSection";
import translations from "../i18n/translations";
import type { LeadCalcPayload } from "../lib/leadBand";

const sendInquiry = vi.hoisted(() => vi.fn(async (_payload: unknown) => {}));
const mirror = vi.hoisted(() => vi.fn(async (_row: unknown) => {}));
const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/inquiry", () => ({ sendInquiry }));
vi.mock("@/lib/portalLead", () => ({ mirrorInquiryToPortal: mirror }));
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...a: unknown[]) => track(...a),
  analyticsEnabled: () => false, getStoredConsent: () => null, initAnalytics: () => {}, setConsent: () => {}, GA_MEASUREMENT_ID: "",
}));

/**
 * FORMULÁŘ PO PATCHI 2 (spec §4, §5): pro návštěvníka z kalkulačky jméno,
 * telefon, stav bytu, souhlas, odeslat. Co kalkulačka ví, se ukazuje čitelně
 * a jde do e-mailu i portálu (payload z patche 1 se zachovává).
 */
const cs = translations.cs;
const strip = (s: string) => s.replace(/\u00a0/g, " ");
const payload: LeadCalcPayload = {
  model_version: "2026-09-07.1",
  data_window: { from: "2025_08", to: "2026_07", months: 12 },
  district: "praha1", district_label: "Praha 1", ctvrt: "stare_mesto", ctvrt_label: "Staré Město",
  dispozice: "2kk", size_label: "2+kk", size_bucket_id: "l", bucket_label: "Větší (56–80 m²)",
  representative_m2: 63, oversized: false, season: "year",
  owner_low: 52418, owner_high: 63374, ltr_month: 32255, ltr_ctvrt_factor: 1.1,
  derived: false, result_band: "strong", ratio: 63374 / 32255, annual_delta: (63374 - 32255) * 12,
};
const prefill = () => act(() => {
  window.dispatchEvent(new CustomEvent("antam:prefill-contact", { detail: { location: "Praha 1", ctvrt: "stare_mesto", size: "2+kk", m2: 63, calc: payload } }));
});
const form = () => document.querySelector("#kontakt form") as HTMLFormElement;
const ftext = () => strip(form().textContent ?? "");
const fill = () => {
  fireEvent.change(document.getElementById("c-name")!, { target: { value: "Jan Test" } });
  fireEvent.change(document.getElementById("c-phone")!, { target: { value: "+420 777 000 111" } });
  fireEvent.click(form().querySelector("input[type=checkbox]")!);
};

describe("formular po patchi 2", () => {
  beforeEach(() => {
    sendInquiry.mockClear(); mirror.mockClear(); track.mockClear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("pole: jmeno, telefon s duvodem, e-mail, ulice s duvodem, stav bytu jako prepinace, zprava; energie pryc, stav uz neni v rozbalovaku", () => {
    render(<ContactSection />);
    expect(document.getElementById("c-name")).toBeTruthy();
    expect(document.getElementById("c-phone")?.getAttribute("required")).not.toBeNull();
    expect(ftext()).toContain(strip(cs.contact_phone_help));
    expect(ftext()).toContain(strip(cs.contact_street_help));
    const chips = document.querySelectorAll("[aria-labelledby='c-status-label'] button");
    expect(chips).toHaveLength(4);
    expect([...chips].map((c) => strip(c.textContent ?? ""))).toEqual([
      strip(cs.contact_status_long), strip(cs.contact_status_short), strip(cs.contact_status_empty), strip(cs.contact_status_buying),
    ]);
    expect(document.getElementById("c-status"), "select stavu v rozbalovaku je pryc").toBeNull();
    expect(document.getElementById("c-energy"), "energie se uz neptame").toBeNull();
    expect(document.getElementById("c-units"), "pocet bytu zustava v rozbalovaku").toBeTruthy();
    expect(document.getElementById("c-pref")).toBeTruthy();
    expect(strip(form().querySelector("button[type=submit]")?.textContent ?? "")).toContain(strip(cs.contact_submit));
  });

  it("echo z kalkulacky stoji nad poli, citelne, s cislem a odkazem zpet; zprava zustava prazdna", () => {
    render(<ContactSection />);
    prefill();
    const echo = [...form().querySelectorAll("p")].find((p) => /Z kalkulačky/.test(strip(p.textContent ?? "")))!;
    expect(strip(echo.textContent ?? "")).toContain("Praha 1 · Staré Město · 2+kk · kolem 63 m² · ~63 000 Kč / měsíc");
    expect(strip(echo.querySelector("a[href='#kalkulacka']")?.textContent ?? "")).toContain(strip(cs.contact_edit_calc));
    expect(echo.textContent).not.toMatch(/praha1|stare_mesto|strong/);
    // echo je první věc ve formuláři
    expect(form().firstElementChild).toBe(echo);
    expect((document.getElementById("c-msg") as HTMLTextAreaElement).value).toBe("");
    // lokalita a dispozice v rozbalováku předvyplněné
    expect((document.getElementById("c-loc") as HTMLSelectElement).value).toBe("Praha 1");
    expect((document.getElementById("c-size") as HTMLSelectElement).value).toBe("2+kk");
  });

  it("stav bytu je povinny: bez nej se nic neposle a ukaze se duvod", async () => {
    render(<ContactSection />);
    fill();
    fireEvent.submit(form());
    await waitFor(() => expect(ftext()).toContain(strip(cs.contact_status_required)));
    expect(sendInquiry).not.toHaveBeenCalled();
  });

  it("odeslani: e-mail zacina radkem z kalkulacky, portal nese cely snapshot, pak stav po odeslani", async () => {
    render(<ContactSection />);
    prefill();
    fill();
    fireEvent.click(screen.getByRole("button", { name: strip(cs.contact_status_long) }));
    fireEvent.submit(form());
    await waitFor(() => expect(sendInquiry).toHaveBeenCalledTimes(1));
    const email = sendInquiry.mock.calls[0][0] as { templateData: Record<string, string> };
    const first = email.templateData.message.split("\n")[0];
    expect(first.startsWith("Kalkulačka: Praha 1 · Staré Město · 2+kk · kolem 63 m²")).toBe(true);
    expect(first).toContain("pásmo: strong");
    expect(first).toContain("model 2026-09-07.1");
    expect(first).toContain("data 12 měsíců do 7/2026");
    expect(strip(email.templateData.status)).toBe(strip(cs.contact_status_long));
    const row = mirror.mock.calls[0][0] as Record<string, unknown>;
    expect(row.calc_model_version).toBe("2026-09-07.1");
    expect((row.calc_result as Record<string, unknown>).result_band).toBe("strong");
    expect((row.calc_result as Record<string, unknown>).owner_high).toBe(63374);
    expect((row.calc_inputs as Record<string, unknown>).ctvrt_label).toBe("Staré Město");
    expect(track).toHaveBeenCalledWith("lead_submit", expect.objectContaining({ band: "strong", from_calc: true, status: "long_term" }));
    // stav po odeslání
    await waitFor(() => expect(ftext()).toContain(strip(cs.contact_success_title)));
    expect(ftext()).toContain(strip(cs.contact_success));
    expect(ftext()).toContain(strip(cs.contact_success_call));
    expect(ftext()).toContain("727 952 459");
    expect(ftext()).toContain("~63 000 Kč / měsíc");
  });
});
