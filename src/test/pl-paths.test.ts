import { describe, it, expect } from "vitest";
// @ts-expect-error - .mjs skript bez typu, schvalne: testuje se konvence, ne API
import { artifactDir, pullWindow } from "../../scripts/pl-window.mjs";

/**
 * Adresář artefaktu se řídí DATEM PULLU, ne koncem okna.
 * Regrese z 2. 9. 2026: default se bral z `win.to`, takže zářijový pull
 * s oknem končícím 2026_07 by spadl do `pricelabs-2026-07` a smíchal se
 * s jiným pullem. Zachránil to ruční `--out`, na což se spoléhat nedá.
 */
describe("artifactDir", () => {
  it("zarijovy pull s oknem koncicim 2026_07 patri do pricelabs-2026-09", () => {
    const pulled = "2026-09-02";
    const win = pullWindow(new Date("2026-09-02T00:00:00Z"));
    expect(win.to).toBe("2026_07");            // okno opravdu konci v cervenci
    expect(artifactDir(pulled)).toBe("data/pricelabs-2026-09");
    expect(artifactDir(pulled)).not.toBe(`data/pricelabs-${win.to.replace("_", "-")}`);
  });

  it("sedi na konvenci uz commitnutych okresu (pull 30. 8. 2026)", () => {
    expect(artifactDir("2026-08-30")).toBe("data/pricelabs-2026-08");
  });

  it("odmitne jiny tvar data", () => {
    expect(() => artifactDir("2026_09")).toThrow();
    expect(() => artifactDir("")).toThrow();
  });
});
