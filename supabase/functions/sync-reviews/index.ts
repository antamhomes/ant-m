import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/*
 * sync-reviews (2. 9. 2026)
 *
 * Stahuje recenze hostu z Hospitable do public.guest_reviews pro sekci na webu.
 *
 * POZOR na opravneni: verify_jwt sam o sobe nestaci. Pousti totiz i anon klic,
 * ktery je verejny (lezi v JS webu), takze by sync mohl spoustet kdokoli a palit
 * kvotu DeepL i limity Hospitable. Funkce si proto role overuje sama a bere jen
 * service_role.
 *
 * Tri veci, ktere vypadaji jako detail a nejsou:
 *
 * 1) Filtr kvality se pocita z RUZNYCH poli podle platformy. Booking jede
 *    0-10 a jeho prah 8 se bere z rating_platform_original; Airbnb jede 1-5
 *    a jeho prah 4 z normalizovaneho rating. Kdyby se oboji merilo z jednoho
 *    pole, jeden z prahu by byl uplne mimo.
 *
 * 2) Velka cast recenzi nema text (host dal 10/10 a nic nenapsal). Bez
 *    podminky na neprazdny text by byla polovina karuselu prazdna.
 *
 * 3) detailed_ratings posila 0 u kategorie, kterou host NEHODNOTIL, ne jako
 *    nulu. Nuly se proto do host_score nepocitaji. Booking recenze se staff 10
 *    a communication 0 by jinak vysla jako prumerna a propadla by dolu,
 *    prestoze chvali presne tu praci, kterou chceme ukazat.
 *
 * Preklad je best-effort: kdyz DeepL selze, recenze se ulozi neprelozene
 * a chyba se zapise do logu. Sbirat je ma smysl i tak, reviewed_at se
 * zpetne nedozene.
 */

const HOSPITABLE = "https://public.api.hospitable.com/v2";
const HOST_CATEGORIES = ["communication", "checkin", "staff", "services"];
const MAX_PAGES_PER_PROPERTY = 3;   // ~150 nejnovejsich na byt, dal do minulosti nema smysl
const PER_PAGE = 50;

type Detail = { type: string; rating: number };
type Review = {
  id: string;
  platform: string;
  public?: { rating?: number; rating_platform_original?: string; review?: string };
  private?: { detailed_ratings?: Detail[] };
  reviewed_at: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Pusti jen service_role. Anon klic je verejny, ten sem nesmi. */
function isServiceRole(req: Request) {
  const auth = req.headers.get("Authorization") ?? "";
  const jwt = auth.replace(/^Bearer\s+/i, "");
  if (!jwt.includes(".")) return false;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload?.role === "service_role";
  } catch {
    return false;
  }
}

async function hos(path: string, token: string) {
  const res = await fetch(`${HOSPITABLE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Hospitable ${path} -> ${res.status} ${(await res.text()).slice(0, 160)}`);
  return await res.json();
}

/** Prumer kategorii o obsluze, 0-1. Nuly = nehodnoceno, do prumeru nejdou. */
function hostScore(details: Detail[] | undefined) {
  const rated = (details ?? []).filter((d) => HOST_CATEGORIES.includes(d.type) && d.rating > 0);
  if (!rated.length) return { score: null as number | null, count: 0 };
  const max = Math.max(...rated.map((d) => d.rating)) > 5 ? 10 : 5;
  const avg = rated.reduce((s, d) => s + d.rating, 0) / rated.length / max;
  return { score: Math.round(avg * 1000) / 1000, count: rated.length };
}

function passes(r: Review) {
  const text = (r.public?.review ?? "").trim();
  if (!text) return false;
  if (r.platform === "booking") return Number(r.public?.rating_platform_original ?? 0) >= 8;
  if (r.platform === "airbnb") return Number(r.public?.rating ?? 0) >= 4;
  return false;
}

async function translate(texts: string[], target: string, key: string) {
  const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const res = await fetch(`https://${host}/v2/translate`, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: texts, target_lang: target }),
  });
  if (!res.ok) throw new Error(`DeepL ${target} -> ${res.status} ${(await res.text()).slice(0, 160)}`);
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
  const token = Deno.env.get("HOSPITABLE_TOKEN");
  const deeplKey = Deno.env.get("DEEPL_AUTH_KEY");

  const { data: logRow } = await db.from("review_sync_log").insert({}).select("id").single();
  const logId = logRow?.id;
  const finish = async (patch: Record<string, unknown>) => {
    if (logId) await db.from("review_sync_log").update({ finished_at: new Date().toISOString(), ...patch }).eq("id", logId);
  };

  try {
    if (!token) throw new Error("HOSPITABLE_TOKEN chybi");

    const props = await hos(`/properties?per_page=100`, token);
    const uuids: string[] = (props.data ?? []).map((p: { id: string }) => p.id);

    let fetched = 0;
    const keep: Record<string, unknown>[] = [];

    for (const uuid of uuids) {
      for (let page = 1; page <= MAX_PAGES_PER_PROPERTY; page++) {
        const res = await hos(`/properties/${uuid}/reviews?per_page=${PER_PAGE}&page=${page}`, token);
        const rows: Review[] = res.data ?? [];
        fetched += rows.length;
        for (const r of rows) {
          if (!passes(r)) continue;
          const { score, count } = hostScore(r.private?.detailed_ratings);
          keep.push({
            id: r.id,
            property_uuid: uuid,
            platform: r.platform === "airbnb" || r.platform === "booking" ? r.platform : "other",
            rating: Number(r.public?.rating ?? 0),
            rating_original: r.public?.rating_platform_original ? Number(r.public.rating_platform_original) : null,
            text_orig: (r.public?.review ?? "").trim(),
            detail: r.private?.detailed_ratings ?? null,
            host_score: score,
            host_rated: count,
            reviewed_at: r.reviewed_at,
            synced_at: new Date().toISOString(),
          });
        }
        if (!res.meta || page >= (res.meta.last_page ?? 1)) break;
        await sleep(250);
      }
    }

    if (keep.length) {
      const { error } = await db.from("guest_reviews").upsert(keep, { onConflict: "id" });
      if (error) throw new Error(`upsert: ${error.message}`);
    }

    // Preklad jen u toho, co ho jeste nema. Setri kvotu a je to idempotentni.
    let translated = 0;
    let translateErr: string | null = null;
    if (deeplKey) {
      try {
        const { data: todo } = await db
          .from("guest_reviews")
          .select("id,text_orig")
          .is("translated_at", null)
          .order("reviewed_at", { ascending: false })
          .limit(60);
        for (let i = 0; i < (todo?.length ?? 0); i += 20) {
          const batch = (todo ?? []).slice(i, i + 20);
          const texts = batch.map((b) => b.text_orig as string);
          const cs = await translate(texts, "CS", deeplKey);
          const vi = await translate(texts, "VI", deeplKey);
          for (let k = 0; k < batch.length; k++) {
            await db.from("guest_reviews").update({
              text_cs: cs[k]?.text ?? null,
              text_vi: vi[k]?.text ?? null,
              lang_orig: (cs[k]?.detected_source_language ?? "").toLowerCase() || null,
              translated_at: new Date().toISOString(),
            }).eq("id", batch[k].id);
            translated++;
          }
        }
      } catch (e) {
        translateErr = String(e).slice(0, 400);
      }
    } else {
      translateErr = "DEEPL_AUTH_KEY chybi";
    }

    await finish({ properties: uuids.length, fetched, kept: keep.length, upserted: keep.length, translated, translate_err: translateErr });
    return new Response(JSON.stringify({ ok: true, properties: uuids.length, fetched, kept: keep.length, translated, translateErr }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    await finish({ error: String(e).slice(0, 600) });
    return new Response(JSON.stringify({ ok: false, error: String(e) }, null, 2), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
