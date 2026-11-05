import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { CALC_DATA_WINDOW, dataWindowLabel, dataWindowRange } from "@/lib/dataWindow";
import { CALC_MODEL_VERSION } from "@/lib/yield";

/**
 * OKNO DAT má jediný zdroj (lib/dataWindow.ts) a musí sedět s tím, co je
 * opravdu v artefaktech PriceLabs. Když se při příštím refreshi změní měsíce
 * v datech a ne konstanta (nebo naopak), tenhle test spadne dřív, než by web
 * ukázal staré „12 měsíců do 7/2026“.
 */
const ARTIFACT_DIRS = ["data/pricelabs-2026-08", "data/pricelabs-2026-09"];

const artifacts = () =>
  ARTIFACT_DIRS.flatMap((d) =>
    readdirSync(d)
      .filter((f) => f.endsWith(".json") && !f.endsWith(".meta.json"))
      .map((f) => join(d, f)),
  );

describe("okno dat kalkulacky", () => {
  it("kazdy artefakt PriceLabs ma presne mesice z CALC_DATA_WINDOW", () => {
    const files = artifacts();
    expect(files.length).toBeGreaterThan(20);
    for (const f of files) {
      const months = JSON.parse(readFileSync(f, "utf8")).meta?.months as string[] | undefined;
      expect(months, `${f} nema meta.months`).toBeDefined();
      expect(months![0], `${f}: prvni mesic`).toBe(CALC_DATA_WINDOW.from);
      expect(months![months!.length - 1], `${f}: posledni mesic`).toBe(CALC_DATA_WINDOW.to);
      expect(months!.length, `${f}: pocet mesicu`).toBe(CALC_DATA_WINDOW.months);
    }
  });

  it("okno je vazane na aktualni verzi konfigurace", () => {
    expect(CALC_DATA_WINDOW.modelVersion).toBe(CALC_MODEL_VERSION);
  });

  it("verejny popis se sklada z konstanty, ne z prekladu", async () => {
    expect(dataWindowLabel("cs")).toBe("12 měsíců do 7/2026");
    expect(dataWindowLabel("vi")).toBe("12 tháng đến 7/2026");
    expect(dataWindowRange("cs")).toBe("8/2025 až 7/2026");
    // ŽÁDNÝ klíč kalkulačky nesmí nést okno natvrdo: až se karta a metodika
    // začnou renderovat z konstanty (patch 2), tenhle test zabrání návratu
    // k opisování. (report_note popisuje skutečný byt z Hospitable, jiná
    // provenience, jiná konstanta: STATS_ASOF v PortfolioSection.)
    const { default: translations } = await import("@/i18n/translations");
    for (const lang of ["cs", "vi"] as const) {
      for (const [k, v] of Object.entries(translations[lang])) {
        if (!k.startsWith("calc_") || typeof v !== "string") continue;
        expect(v, `${k} (${lang}) opisuje okno dat místo konstanty`).not.toMatch(/\d+\/20\d\d/);
      }
    }
  });
});
