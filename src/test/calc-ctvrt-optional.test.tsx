import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { CalcProvider } from "../contexts/CalcContext";
import CalculatorSection from "../components/CalculatorSection";
import { ctvrtiOf } from "../lib/yield";

/**
 * PRODUKTOVÉ PRAVIDLO: čtvrť je nepovinné zpřesnění.
 * Nová data o čtvrti nesmí přidat povinný krok do trychtýře.
 * Do 2. 9. 2026 byl výsledek blokovaný, dokud se čtvrť nevybrala; přidání
 * Nového Města (Praha 1 i Praha 2) by tím zablokovalo i Prahu 2.
 */
const setup = () => render(<CalcProvider><CalculatorSection /></CalcProvider>);
const hasNumber = () => /\d[\d\u00a0\u202f ]{2,}\s*Kč/.test(document.body.textContent ?? "");
const pick = (v: string) => fireEvent.change(screen.getByRole("combobox"), { target: { value: v } });

describe("ctvrt je nepovinne zpresneni", () => {
  it("Praha 2 ma ctvrt (Nove Mesto) a PRESTO ukaze cislo bez vyberu", async () => {
    expect(ctvrtiOf("praha2").map((c) => c.id)).toContain("nove_mesto");
    setup();
    pick("praha2");
    expect(hasNumber()).toBe(true);
  });

  it("Praha 1 ukaze cislo bez vyberu ctvrti", async () => {
    setup();
    pick("praha1");
    expect(hasNumber()).toBe(true);
  });

  it("vyber ctvrti je nabidnuty vsude, kde pro ni mame data", async () => {
    setup();
    for (const loc of ["praha1", "praha2"]) {
      pick(loc);
      const group = document.querySelector("#kalkulacka-ctvrt [role='group']") as HTMLElement;
      expect(group, `${loc} ma mit vyber ctvrti`).toBeTruthy();
      for (const c of ctvrtiOf(loc))
        expect(within(group).getByText(c.label)).toBeTruthy();
    }
  });

  it("okres bez ctvrti zadny vyber nenabizi", async () => {
    setup();
    // Fixture je okres, ktery ctvrt NEMA. Do 5. 9. 2026 to byla praha4;
    // od integrace Nusli ma praha4 ctvrt, takze fixture je praha6.
    // Kdyz i praha6 nekdy ctvrt dostane, posunout fixture dal (praha9),
    // ne rusit test — hlida, ze selektor nevznika tam, kde nema co nabidnout.
    pick("praha6");
    expect(ctvrtiOf("praha6")).toHaveLength(0);
    expect(document.querySelector("#kalkulacka-ctvrt")).toBeNull();
  });
});
