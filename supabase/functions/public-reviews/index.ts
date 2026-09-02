import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/*
 * public-reviews (2. 9. 2026)
 *
 * Verejny endpoint pro sekci recenzi na webu. Stejny vzorec jako drive
 * public-calculator: tabulka zustava zavrena (RLS bez anon policy) a ven
 * chodi jen to, co tahle funkce pusti.
 *
 * verify_jwt je schvalne false, protoze to cte staticky web bez prihlaseni.
 * Neni to diskutabilni jen proto, ze data jsou uz tak verejna: kazda z tech
 * recenzi stoji na Airbnb nebo Booking.com. Ven nejde nic navic, hlavne
 * zadna jmena hostu, ta se ani neukladaji.
 *
 * Razeni: nejdriv recenze, ktere mluvi o nasi praci, pak podle kategorii
 * o obsluze, pak podle data. Duvod je v komentari pohledu public_reviews_ranked.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") === "vi" ? "vi" : "cs";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20) || 20, 40);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data, error } = await db
    .from("public_reviews_ranked")
    .select("id,platform,rating,rating_original,lang_orig,text_cs,text_vi,reviewed_at,praises_host,host_score")
    .order("praises_host", { ascending: false })
    .order("host_score", { ascending: false, nullsFirst: false })
    .order("reviewed_at", { ascending: false })
    .limit(limit);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const items = (data ?? []).map((r) => {
    const text = lang === "vi" ? r.text_vi : r.text_cs;
    // Kdyz host psal rovnou v jazyce stranky, nic prelozeneho neni a stitek
    // by lhal. Ceska recenze na ceske strance prelozena nebyla.
    const translatedFrom = r.lang_orig && r.lang_orig !== lang ? r.lang_orig : null;
    return {
      id: r.id,
      platform: r.platform,
      // Booking jede 0-10, Airbnb 1-5. Posilame obe cisla i skalu, at si web
      // nemusi domyslet, co znamena "5" u Bookingu.
      score: r.platform === "booking" ? Number(r.rating_original) : Number(r.rating),
      scale: r.platform === "booking" ? 10 : 5,
      text,
      translated_from: translatedFrom,
      reviewed_at: r.reviewed_at,
    };
  }).filter((r) => r.text && r.text.length > 0);

  return new Response(JSON.stringify({ items, count: items.length }), {
    headers: {
      ...CORS,
      "Content-Type": "application/json",
      // Recenze se meni jednou za noc, nema smysl na to bit databazi.
      "Cache-Control": "public, max-age=1800, s-maxage=3600",
    },
  });
});
