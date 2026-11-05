/**
 * Přístup a oprávnění na /nastroj.
 *
 * Klíčové tvrzení: React komponenta NENÍ bezpečnostní hranice. Testy proto
 * hlídají, že se bez session nic nepočítá ani neukládá, že se při odepřeném
 * oprávnění nástroj nevykreslí, a hlavně že se veřejná cesta modelu na
 * /nastroj nepoužívá. Skutečné vynucení je RLS v migraci.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen as rtl, waitFor } from "@testing-library/react";

const session = { current: null as unknown };
const isAdmin = { value: false };
const inserted: unknown[] = [];

vi.mock("@/lib/adminClient", async () => {
  const actual = await vi.importActual<typeof import("@/lib/adminClient")>("@/lib/adminClient");
  return {
    ...actual,
    admin: () => ({
      auth: {
        getSession: async () => ({ data: { session: session.current } }),
        signInWithPassword: async () => ({ error: null }),
        signOut: async () => ({ error: null }),
      },
    }),
    checkAdmin: async () => isAdmin.value,
    saveEvaluation: async (row: unknown) => { if (!isAdmin.value) return null; inserted.push(row); return "id-1"; },
    setAction: async () => true,
  };
});

import Nastroj from "@/pages/Nastroj";
import { toRow } from "@/lib/adminClient";
import { screen as runScreen } from "@/lib/screening";

beforeEach(() => { session.current = null; isAdmin.value = false; inserted.length = 0; });

describe("brána /nastroj", () => {
  it("bez session ukáže přihlášení, ne nástroj", async () => {
    render(<Nastroj />);
    await waitFor(() => expect(rtl.getByText(/Přihlas se stejným účtem/i)).toBeTruthy());
    expect(rtl.queryByText(/Vyhodnotit/i)).toBeNull();
  });

  it("session bez oprávnění nástroj nevykreslí", async () => {
    session.current = { user: { email: "kdokoliv@example.com" } };
    isAdmin.value = false;
    render(<Nastroj />);
    await waitFor(() => expect(rtl.getByText(/nemá oprávnění/i)).toBeTruthy());
    expect(rtl.queryByText(/Vyhodnotit/i)).toBeNull();
  });

  it("admin nástroj dostane", async () => {
    session.current = { user: { email: "tranvietvuong00@gmail.com" } };
    isAdmin.value = true;
    render(<Nastroj />);
    await waitFor(() => expect(rtl.getByText(/Vyhodnotit/i)).toBeTruthy());
  });

  it("stránka se označí jako noindex", async () => {
    session.current = null;
    render(<Nastroj />);
    await waitFor(() => {
      const m = document.head.querySelector('meta[name="robots"]');
      expect(m?.getAttribute("content")).toContain("noindex");
    });
  });
});

describe("uložený řádek nese jen to, co spočítal model", () => {
  it("toRow nic nedopočítává a drží provenienci", () => {
    const input = { addressRaw: "Vinohradská 123", district: "praha2" as const, ctvrt: null, size: "2kk" as const, m2: 58 };
    const r = runScreen(input);
    const row = toRow(input, r, "phone");
    expect(row.screening_baseline).toBe(r.screeningBaseline);
    expect(row.buffer_pct).toBe(r.bufferPct);
    expect(row.operator_factor_used).toBe(r.operatorFactorUsed);
    expect(row.model_version).toBe(r.modelVersion);
    expect(row.data_window).toBe(r.dataWindow);
    expect(row.verdict).toBe(r.verdict);
    // adresa se ukládá, ale do výpočtu nevstupuje
    expect(row.address_raw).toBe("Vinohradská 123");
  });
});

describe("migrace drží immutabilitu a zamyká anon", () => {
  const sql = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs") as typeof import("node:fs");
    return fs.readFileSync("supabase/migrations/20260909130000_evaluations.sql", "utf8");
  };
  it("RLS je zapnuté a anon nemá nic", () => {
    const s = sql();
    expect(s).toMatch(/enable row level security/i);
    expect(s).toMatch(/revoke all on public\.evaluations from anon/i);
  });
  it("žádná delete policy neexistuje", () => {
    expect(sql().toLowerCase()).not.toContain("for delete");
  });
  it("update je omezený na action a note", () => {
    const s = sql();
    expect(s).toMatch(/grant update \(action, note\)/i);
    expect(s).toMatch(/using \(public\.is_admin\(\) and action = 'none'\)/i);
  });
  it("select i insert vyžadují is_admin()", () => {
    const s = sql();
    expect(s).toMatch(/for select to authenticated using \(public\.is_admin\(\)\)/i);
    expect(s).toMatch(/for insert to authenticated with check \(public\.is_admin\(\)\)/i);
  });
});
