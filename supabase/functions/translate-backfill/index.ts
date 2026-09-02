import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/*
 * translate-backfill (2. 9. 2026)
 *
 * Jednorazove dozeneni prekladu u recenzi, ktere uz jsou v databazi.
 * Sync si preklada jen malou davku na beh, aby se vesel do limitu; tohle
 * projede zbytek. Az bude hotovo, muze se smazat.
 *
 * Proti prvni verzi syncu zapisuje davkove: 150 samostatnych UPDATE po jednom
 * radku funkci uspalo drive, nez stihla neco udelat. Upsert v jednom volani
 * je rychlejsi a hlavne se to necha zvednout.
 *
 * Idempotentni: bere jen radky bez translated_at, takze opakovane spusteni
 * nepali kvotu znovu za tytez texty.
 */

const BATCH = 25;        // textu na jedno volani DeepL
const MAX_PER_RUN = 200; // strop na jeden beh, at se vejdeme do limitu funkce

function isServiceRole(req: Request) {
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt.includes(".")) return false;
  try {
    return JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))?.role === "service_role";
  } catch { return false; }
}

async function translate(texts: string[], target: string, key: string) {
  const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const res = await fetch(`https://${host}/v2/translate`, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: texts, target_lang: target }),
  });
  if (!res.ok) throw new Error(`DeepL ${target} -> ${res.status} ${(await res.text()).slice(0, 200)}`);
  const j = await res.json() as { translations: { text: string; detected_source_language: string }[] };
  return j.translations;
}

Deno.serve(async (req) => {
  if (!isServiceRole(req)) {
    return new Response(JSON.stringify({ ok: false, error: "service_role required" }), {
      status: 403, headers: { "Content-Type": "application/json" },
    });
  }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const key = Deno.env.get("DEEPL_AUTH_KEY");
  if (!key) {
    return new Response(JSON.stringify({ ok: false, error: "DEEPL_AUTH_KEY chybi" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { data: todo, error: selErr } = await db
      .from("guest_reviews")
      .select("id,text_orig")
      .is("translated_at", null)
      .order("reviewed_at", { ascending: false })
      .limit(MAX_PER_RUN);
    if (selErr) throw new Error(selErr.message);

    const rows = todo ?? [];
    const now = new Date().toISOString();
    const updates: Record<string, unknown>[] = [];

    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH);
      const texts = slice.map((r) => r.text_orig as string);
      const cs = await translate(texts, "CS", key);
      const vi = await translate(texts, "VI", key);
      slice.forEach((r, k) => {
        updates.push({
          id: r.id,
          text_cs: cs[k]?.text ?? null,
          text_vi: vi[k]?.text ?? null,
          lang_orig: (cs[k]?.detected_source_language ?? "").toLowerCase() || null,
          translated_at: now,
        });
      });
    }

    if (updates.length) {
      // Upsert doplni jen uvedene sloupce, zbytek radku zustava.
      const { error } = await db.from("guest_reviews").upsert(updates, { onConflict: "id" });
      if (error) throw new Error(`upsert: ${error.message}`);
    }

    const { count: zbyva } = await db
      .from("guest_reviews")
      .select("id", { count: "exact", head: true })
      .is("translated_at", null);

    return new Response(JSON.stringify({ ok: true, prelozeno_ted: updates.length, zbyva }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }, null, 2), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
