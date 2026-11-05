/**
 * Přihlášení a zápis pro interní nástroj na /nastroj.
 *
 * Používá TÝŽ Supabase projekt a týž účet jako portál majitelů. Oprávnění
 * NEHLÍDÁ tenhle soubor: hlídá ho RLS (`public.is_admin()`) na tabulkách.
 * Skrytí komponenty v Reactu je jen kosmetika, vynucení je v databázi, takže
 * i kdyby někdo obešel UI, dotaz mu vrátí prázdno a zápis selže.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ScreeningInput, ScreeningResult } from "./screening";

const URL = "https://lgjqhbdcjvxktdcqzeff.supabase.co";
const KEY = "sb_publishable_jwKs85PSRQcNGfbm32IYZw_guW0hWqE";

let client: SupabaseClient | null = null;
export const admin = (): SupabaseClient =>
  (client ??= createClient(URL, KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "antam-nastroj-auth" },
  }));

/** Server-side ověření: ptáme se databáze, ne prohlížeče. */
export async function checkAdmin(): Promise<boolean> {
  const { data, error } = await admin().rpc("is_admin");
  if (!error && typeof data === "boolean") return data;
  // Fallback, kdyby RPC nebyla vystavená: prázdný select projde jen adminovi.
  const probe = await admin().from("evaluations").select("id").limit(1);
  return !probe.error;
}

export type EvaluationRow = {
  address_raw: string; district: string; ctvrt: string | null; size: string; m2: number;
  current_rent: number | null; sleeps: number | null; season: string;
  capacity_source: string; capacity_resolved: boolean; band: string; inferred_band: string;
  model_version: string; data_window: string;
  public_monthly: number | null; cons_low: number | null; cons_high: number | null;
  screening_baseline: number | null; ltr_monthly: number | null; energy_monthly: number;
  floor_monthly: number | null; buffer_czk: number | null; buffer_pct: number | null;
  cell_derived: boolean; n_min: number | null; operator_factor_used: number;
  operator_measured: boolean; confidence: string; verdict: string;
  verdict_reason: string | null; source: string;
};

/** Řádek se skládá jen z toho, co spočítal model. Žádné dopočítávání tady. */
export const toRow = (i: ScreeningInput, r: ScreeningResult, source: string): EvaluationRow => ({
  address_raw: i.addressRaw, district: i.district, ctvrt: i.ctvrt, size: i.size, m2: i.m2,
  current_rent: i.currentRent ?? null, sleeps: r.sleeps, season: r.season,
  capacity_source: r.capacitySource, capacity_resolved: r.capacityResolved,
  band: r.band, inferred_band: r.inferredBand,
  model_version: r.modelVersion, data_window: r.dataWindow,
  public_monthly: r.publicMonthly, cons_low: r.consLow, cons_high: r.consHigh,
  screening_baseline: r.screeningBaseline, ltr_monthly: r.ltrMonthly, energy_monthly: r.energyMonthly,
  floor_monthly: r.floorMonthly, buffer_czk: r.bufferCzk, buffer_pct: r.bufferPct,
  cell_derived: r.cellDerived, n_min: r.nMin, operator_factor_used: r.operatorFactorUsed,
  operator_measured: r.operatorMeasured, confidence: r.confidence, verdict: r.verdict,
  verdict_reason: r.verdictReason, source,
});

/** Uloží vyhodnocení. Vrací id, nebo null, když zápis neprošel (RLS). */
export async function saveEvaluation(row: EvaluationRow): Promise<string | null> {
  const { data, error } = await admin().from("evaluations").insert(row).select("id").single();
  return error ? null : (data?.id ?? null);
}

/**
 * Jediná povolená změna po zápisu: co jsem s tím udělal.
 *
 * POZOR na sémantiku RLS: když policy `using (action = 'none')` řádek odfiltruje,
 * UPDATE neselže, jen nezmění NIC a vrátí nula řádků bez chyby. Ověřeno na
 * lokálním Postgresu 9. 9. 2026 (matice mutací, krok 4). Proto se úspěch pozná
 * podle vrácených řádků, ne podle absence chyby, jinak by druhé rozhodnutí
 * o témž vyhodnocení vypadalo jako uložené, i když se zahodilo.
 */
export async function setAction(id: string, action: "continue" | "discard"): Promise<boolean> {
  const { data, error } = await admin().from("evaluations").update({ action }).eq("id", id).select("id");
  return !error && Array.isArray(data) && data.length === 1;
}
