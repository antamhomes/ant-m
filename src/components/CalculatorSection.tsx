import { useState, useMemo, useEffect } from "react";
import Reveal from "@/components/Reveal";
import { Calculator, MapPin, Home, Share2, Pencil, Ruler } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import { BAND_LABEL, ownerMonthly, rentFor, ctvrtiOf, ctvrtRentFactor, bucketsFor, CALC_MODEL_VERSION, type LocationKey, type SizeKey, type SeasonKey } from "@/lib/yield";
import { CALC_LOCATIONS as LOCATIONS, useCalc, type CalcLoc } from "@/contexts/CalcContext";

/** Lokalita v kalkulačce: pražské čtvrti + „jinde". U čtvrtí bez vlastních dat
 *  (P2, P6 až P10) a u „jinde" se panel výsledku přepne na posouzení
 *  do 24 hodin; ŽÁDNÉ číslo se neukazuje a nic se neopisuje z jiné čtvrti. */

// Dva vstupy (patch 142): lokalita, dispozice. Kapacita jde z dispozice
// (guestsFor), nájem z typické plochy dispozice v té čtvrti (typicalArea,
// Sreality mediány) a panel obojí vypíše. Výsledek je rozpětí (průměr trhu
// až s Antam), střed řídí násobek nájmu. Panel drží jen to podstatné;
// metodika, dělení 70/30, energie a krytí škod žijí v rozkliku pod sekcí
// a v Ceníku (rozhodnutí 30. 8. 2026: „jen info co je důležitý“).
const sizes: { value: SizeKey; label: string }[] = [
  { value: "1kk", label: "1+kk" },
  { value: "2kk", label: "2+kk" },
  { value: "3kk", label: "3+kk" },
  { value: "4kk", label: "4+kk" },
];

// Sezónní násobky žijí v lib/yield (SEASONS_BY_LOC, z realizovaných řad každé
// lokality); tady jsou jen popisky. Léto + zima + prosinec skládají přesně rok.
const SEASON_KEYS: SeasonKey[] = ["year", "summer", "winter", "xmas"];


const CalculatorSection = () => {
  const { lang } = useLanguage();
  const locLabel = (l: CalcLoc) =>
    l === "jinde" ? t(lang, "calc_loc_other") : `Praha ${l.replace("praha", "")}`;
  // Stav (lokalita, dispozice, plocha, sezóna, vybavení) žije v CalcContext,
  // aby s ním počítal i pětiletý graf v sekci Horizont.
  const { location, setLocation, ctvrt, setCtvrt, needsCtvrt, size, pickSize, bucket, pickBucket, m2, oversized, season, setSeason, fromShare } = useCalc();
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (fromShare) document.getElementById("kalkulacka")?.scrollIntoView({ block: "start" });
  }, [fromShare]);

  const shareResult = async () => {
    const url = `${window.location.origin}${window.location.pathname}?byt=${location}-${ctvrt ?? "-"}-${size}-${m2}m-${season}#kalkulacka`;
    trackEvent("calc_share", { district: location, ctvrt: ctvrt ?? "-", size, m2, season });
    try {
      if (navigator.share) { await navigator.share({ title: "Antam Homes", url }); return; }
    } catch { /* user cancelled — fall through to copy */ }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2500);
    } catch {
      window.prompt(t(lang, "calc_share_copy"), url);
    }
  };

  // Jediný zdroj výpočtu je lib/yield: reálná tržní cena za noc pro čtvrť
  // a pásmo × sezóna. Rozpětí drží OBA konce na tržní obsazenosti čtvrti;
  // liší se vahou překlopení do vyššího pásma (dispozice + plocha) a
  // naměřeným operátorským faktorem. Minus provize platformy, dělení 70/30.
  // Nájem řídí PLOCHA (rentFor).
  const result = useMemo(() => {
    const r = ownerMonthly(location, size, { season, m2, ctvrt });
    // Nájem bere TÉŽ čtvrť jako STR strana. Bez toho by se lokální čitatel
    // dělil okresním jmenovatelem a násobek by se u silných čtvrtí nafoukl.
    const ltr = location === "jinde" ? 0 : rentFor(location as LocationKey, size, m2, "mix", ctvrt);
    // Násobek se počítá z čísla, které je v headline (vršek), aby si to
    // navzájem neodporovalo. Od 31. 8. 2026 je headline POTENCIÁL, ne střed.
    const ratio = r.supported && ltr > 0 ? r.high / ltr : 0;
    // Čtvrť, se kterou model OPRAVDU počítal (ne stav: čtvrť patřící pod jiný
    // okres se ignoruje). Ve shrnutí výsledku musí být vidět, protože mění číslo.
    const used = r.supported ? r.trace.ctvrt : null;
    const ctvrtLabel = used ? ctvrtiOf(location).find((c) => c.id === used)?.label ?? null : null;
    // Jaký čtvrťový faktor nájmu se opravdu použil (1 = žádný). Do stopy i do leadu.
    const rentCtvrtFactor = location === "jinde" ? 1 : ctvrtRentFactor(location, ctvrt);
    return { r, ltr, ratio, ctvrtLabel, rentCtvrtFactor };
  }, [location, ctvrt, size, m2, season]);

  // Pětiletka se v kartě výsledku ZÁMĚRNĚ neukazuje (31. 8. 2026). Roční rozdíl
  // je hrubý rozdíl zobrazených měsíčních příjmů, kdežto pětiletý scénář je po
  // energiích, obnově vybavení, uvedení do provozu a rozjezdu. Vedle sebe to
  // vypadá, že jedno je pětina druhého. Graf žije v sekci Horizont (#horizont)
  // a je tam označený jako scénář PO NÁKLADECH.

  // "mil." / "tis." are Czech; the Vietnamese page counts in "triệu" (million) and "nghìn".
  const short = (n: number) =>
    Math.abs(n) >= 1e6
      ? `${(n / 1e6).toFixed(1).replace(".", ",")}\u00a0${lang === "cs" ? "mil." : "triệu"}`
      : `${Math.round(n / 1000)}\u00a0${lang === "cs" ? "tis." : "nghìn"}`;
  const answered = !needsCtvrt || ctvrt !== undefined;
  // Label kbelíku PŘESNĚ tak, jak ho majitel viděl. Ukládá se k leadu, aby šlo
  // zpětně zrekonstruovat, co mu web ukázal, i když se hranice později posunou.
  const bucketLabel = (() => {
    const b = bucketsFor(size).find((x) => x.id === bucket);
    if (!b) return "";
    const range = b.maxM2 === null
      ? t(lang, "calc_size_over").replace("{n}", String((b.minM2 ?? 1) - 1))
      : b.minM2 === null
        ? t(lang, "calc_size_upto").replace("{n}", String(b.maxM2))
        : `${b.minM2}\u2013${b.maxM2} m²`;
    return `${t(lang, b.labelKey as "calc_size_s")} (${range})`;
  })();
  // Byt nad p95 stocku se NEEXTRAPOLUJE: místo pochybného čísla jde na
  // individuální posouzení, stejně jako čtvrť nebo pásmo bez dat.
  const supported = result.r.supported && answered && !oversized;

  return (
    <section id="kalkulacka" className="section bg-secondary scroll-mt-16">
      <div className="container-narrow">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "calc_label")}</p>
          <h2 className="h-section text-foreground">
            {t(lang, "calc_title1")}
            <span className="text-gradient-gold">{t(lang, "calc_title2")}</span>
          </h2>
          <p className="lead">{t(lang, "calc_desc")}</p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10 md:items-start">
          <Reveal id="kalkulacka-zadani" delay={0.05} className="space-y-8 order-2 md:order-1 scroll-mt-20 min-w-0">
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <MapPin className="w-4 h-4 text-gold" />
                {t(lang, "calc_location")}
              </label>
              {/* Mobile: native select (úspora místa) */}
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as CalcLoc)}
                className="sm:hidden w-full min-w-0 max-w-full px-4 py-3 bg-card border border-border rounded-sm font-body text-sm font-medium text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{locLabel(l)}</option>
                ))}
              </select>
              {/* Desktop: tlačítka */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-2">
                {LOCATIONS.map((l) => (
                  <button key={l} type="button" onClick={() => setLocation(l)}
                    className={`px-3 py-2.5 rounded-sm text-sm font-body font-medium transition-all border ${
                      location === l
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    {locLabel(l)}
                  </button>
                ))}
              </div>
            </div>

            {/* Čtvrť: jen tam, kde pro ni máme vlastní tržní data. Krok se nedá
                přeskočit, „Ostatní“ je vědomá volba, ne výchozí stav. */}
            {needsCtvrt && (
              <div>
                <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                  <MapPin className="w-4 h-4 text-gold" />
                  {t(lang, "calc_area")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {ctvrtiOf(location).map((c) => (
                    <button key={c.id} type="button" onClick={() => setCtvrt(c.id)}
                      className={`px-3 py-2.5 rounded-sm text-sm font-body font-medium transition-all border ${
                        ctvrt === c.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-foreground hover:border-gold/50"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                  <button type="button" onClick={() => setCtvrt(null)}
                    className={`px-3 py-2.5 rounded-sm text-sm font-body font-medium transition-all border ${
                      ctvrt === null
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    {t(lang, "calc_area_other").replace("{district}", locLabel(location))}
                  </button>
                </div>
              </div>
            )}

            {/* Dispozice je viditelně jen rychlá předvolba: předvyplní kapacitu
                a plochu; podle ní se počítají energie a obnova vybavení. */}
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-1.5">
                <Home className="w-4 h-4 text-gold" />
                {t(lang, "calc_size")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((s) => (
                  <button key={s.value} type="button" onClick={() => pickSize(s.value)}
                    className={`px-2 sm:px-3 py-3 min-w-0 rounded-sm text-sm font-body font-semibold transition-all border ${
                      size === s.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Velikost se od 31. 8. 2026 vybírá TLAČÍTKY. Posuvník na jeden metr
                předstíral přesnost, kterou veřejně nemáme: majitel svoje m² zná, ale
                o čísle nerozhoduje 79 vs 81, rozhoduje menší/běžný/větší. Kbelík jen
                pošle reprezentativní plochu do TÉHOŽ modelu, ekonomika se nemění.
                Poslední volba se neextrapoluje a jde na individuální posouzení. */}
            <div>
              <p className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <Ruler className="w-4 h-4 text-gold" />
                {t(lang, "calc_m2")}
              </p>
              <div id="calc-size" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {bucketsFor(size).map((b) => {
                  // Rozsah se SKLÁDÁ z konfigurace. V komponentě nesmí být žádná
                  // hranice natvrdo: jinak by se s novou verzí modelu rozešla
                  // tlačítka s tím, co model opravdu počítá.
                  const range = b.maxM2 === null
                    ? t(lang, "calc_size_over").replace("{n}", String((b.minM2 ?? 1) - 1))
                    : b.minM2 === null
                      ? t(lang, "calc_size_upto").replace("{n}", String(b.maxM2))
                      : `${b.minM2}\u2013${b.maxM2} m²`;
                  return (
                    <button key={b.id} type="button" onClick={() => pickBucket(b.id)}
                      aria-pressed={bucket === b.id}
                      className={`flex flex-col items-start px-3 py-2.5 min-w-0 rounded-sm font-body transition-all border ${
                        bucket === b.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-foreground hover:border-gold/50"
                      }`}
                    >
                      <span className="text-sm font-semibold">{t(lang, b.labelKey as "calc_size_s")}</span>
                      <span className={`text-[11.5px] tnum ${bucket === b.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {range}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Nápověda patří pod výběr velikosti: mluví o ploše. */}
              <p className="mt-2 font-body text-[12.5px] text-muted-foreground leading-snug">{t(lang, "calc_size_hint")}</p>
            </div>

            {/* Rok je výchozí rozhodnutí; sezónu si rozklikne, kdo ji chce. */}
            <details className="group">
              <summary className="list-none cursor-pointer inline-flex items-center gap-2 font-body text-sm font-semibold text-gold-deep underline underline-offset-4 decoration-gold/40 [&::-webkit-details-marker]:hidden">
                <Calculator className="w-4 h-4 text-gold" />
                {t(lang, "calc_season_toggle")}
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {SEASON_KEYS.map((key) => (
                  <button key={key} type="button" onClick={() => setSeason(key)}
                    className={`flex flex-col px-3 py-3 rounded-sm font-body transition-all border text-left leading-tight ${
                      season === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    <span className="text-[13px] font-semibold truncate">
                      {t(lang, `calc_season_${key}` as const)}
                    </span>
                    <span className={`text-[11px] mt-0.5 ${season === key ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {t(lang, `calc_season_${key}_sub` as const)}
                    </span>
                  </button>
                ))}
              </div>
            </details>

          </Reveal>

          <Reveal delay={0.1} className="flex items-start order-1 md:order-2 md:sticky md:top-24">
            <div className="w-full bg-gradient-dark rounded-md p-5 sm:p-7 md:p-9 space-y-4 sm:space-y-5">
              {!supported ? (
                /* Lokalita bez vlastních tržních dat: žádné číslo, poctivé
                   zavření s cestou k propočtu do 24 hodin. */
                <div className="space-y-4">
                  <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em]">
                    {t(lang, "calc_net")}
                  </p>
                  <p className="font-display text-2xl sm:text-[1.75rem] font-semibold text-primary-foreground leading-snug text-balance">
                    {t(lang, !answered ? "calc_pick_area_title" : oversized ? "calc_oversized_title" : "calc_unsupported_title")}
                  </p>
                  <p className="font-body text-[14.5px] text-primary-foreground/80 leading-relaxed">
                    {t(lang, !answered ? "calc_pick_area_text" : oversized ? "calc_oversized_text" : "calc_unsupported_text")}
                  </p>
                  <p className="md:hidden flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[13px] text-primary-foreground/70">
                    <span>{locLabel(location)}</span>
                    <a href="#kalkulacka-zadani" className="ml-1 inline-flex items-center gap-1 underline underline-offset-4 decoration-primary-foreground/30 hover:text-primary-foreground">
                      <Pencil className="w-3 h-3" aria-hidden="true" />
                      {t(lang, "calc_edit")}
                    </a>
                  </p>
                  <a
                    href="#kontakt"
                    onClick={() => {
                      trackEvent("cta_click", { location: "calculator_unsupported", target: "contact", district: location, size });
                      window.dispatchEvent(new CustomEvent("antam:prefill-contact", {
                        detail: { location: locLabel(location), ctvrt: ctvrt ?? null, size: sizes.find((s) => s.value === size)?.label ?? "", m2,
                          calc: {
                            model_version: CALC_MODEL_VERSION,
                            district: location, ctvrt: ctvrt ?? null, dispozice: size,
                            size_bucket_id: bucket,
                            representative_m2: oversized ? null : m2,
                            bucket_label: bucketLabel,
                            oversized,
                            owner_low: result.r.supported ? result.r.low : null,
                            owner_high: result.r.supported ? result.r.high : null,
                            ltr_month: result.ltr || null,
                            ltr_ctvrt_factor: result.rentCtvrtFactor,
                          } },
                      }));
                    }}
                    className="btn btn-primary-inverse w-full"
                  >
                    {t(lang, "calc_cta")}
                  </a>
                </div>
              ) : (
                <>
                  {result.r.supported && (
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                        {t(lang, "calc_net")}
                      </p>
                      <p className="font-body text-[12px] text-primary-foreground/60 -mt-0.5 mb-1">
                        {t(lang, "calc_net_sub")}
                      </p>
                      {/* Jedno číslo se čte líp (rozhodnutí 30. 8. 2026): střed rozpětí
                          jako hlavní číslo, rozpětí drobně pod ním. */}
                      {/* HEADLINE = dosažitelný vršek UŽ SPOČÍTANÉHO rozpětí, ne jeho střed
                          (31. 8. 2026). Nemění se tím žádný předpoklad modelu, jen se ukazuje
                          jiný bod téhož rozpětí, a je označený jako POTENCIÁL. Rozpětí zůstává
                          hned pod tím: nejistota se neschovává, jen se nefeatur uje střed. */}
                      <p className="flex flex-wrap items-baseline gap-x-2 leading-tight tnum">
                        <span className="font-display text-[2.25rem] min-[360px]:text-[2.75rem] sm:text-5xl md:text-[3.25rem] font-bold text-gradient-gold-on-dark whitespace-nowrap">
                          ~{(Math.round(result.r.high / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč
                        </span>
                        <span className="font-body text-sm font-normal text-primary-foreground/65 whitespace-nowrap">
                          {t(lang, "calc_month_suffix")}
                        </span>
                      </p>
                      <p className="mt-1 font-body text-[13px] text-primary-foreground/70 tnum">
                        {t(lang, "calc_range_label")} {Math.round(result.r.low / 1000)}&nbsp;{t(lang, "calc_range_to")}&nbsp;{Math.round(result.r.high / 1000)}&nbsp;{lang === "cs" ? "tis." : "nghìn"}&nbsp;Kč
                      </p>
                      {/* Kapacita se majiteli ZÁMĚRNĚ neukazuje (rozhodnutí 31. 8. 2026).
                          Pásmo trhu se bere z dispozice a plochy, ale kolik lůžek se do bytu
                          opravdu vejde, závisí na proporcích pokojů, ne na celkových m².
                          Tvrdit konkrétní počet z jednoho čísla byla falešná přesnost;
                          určuje se při prohlídce a patří do interního podkladu, ne na web.
                          Hlídá to facts.test.ts, tady i v grafu a v poptávce. */}
                      {result.r.derived && (
                        <p className="mt-1.5 font-body text-[12px] text-primary-foreground/60 leading-relaxed">
                          {t(lang, "calc_derived_note")}
                        </p>
                      )}
                      {/* Reálná cena za noc: jeden tichý řádek. Značka poskytovatele dat
                          jde z veřejného výsledku pryč (31. 8. 2026): zdroj patří do
                          metodiky pod výsledkem, ne do headline. */}
                      <p className="mt-3 font-body text-[13px] text-primary-foreground/70 tnum">
                        {t(lang, "calc_market_line")} ({BAND_LABEL[result.r.band][lang]}): {result.r.adr.toLocaleString("cs-CZ")}&nbsp;Kč
                      </p>
                      <p className="md:hidden mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[13px] text-primary-foreground/70">
                        <span>{locLabel(location)}</span>
                        {/* Čtvrť mění číslo, takže musí být ve shrnutí vidět. Bereme ji
                            z trace, ne ze stavu: je to ta, se kterou model opravdu počítal
                            (čtvrť patřící pod jiný okres se ignoruje). */}
                        {result.ctvrtLabel && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{result.ctvrtLabel}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{t(lang, `calc_season_${season}` as const)}</span>
                        <a href="#kalkulacka-zadani" className="ml-1 inline-flex items-center gap-1 underline underline-offset-4 decoration-primary-foreground/30 hover:text-primary-foreground">
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                          {t(lang, "calc_edit")}
                        </a>
                      </p>
                    </div>


                    <div className="border-t border-primary-foreground/10 pt-4">
                      <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                        {t(lang, "calc_ltr")}
                      </p>
                      <p className="font-display text-xl font-semibold text-primary-foreground/60 tnum">
                        ~{(Math.round(result.ltr / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč{" "}
                        <span className="font-body text-[12px] font-normal text-primary-foreground/50">{t(lang, "calc_ltr_for")} {sizes.find((x) => x.value === size)?.label} {t(lang, "calc_rent_typical")} {m2}&nbsp;m² ({t(lang, "calc_rent_src")})</span>
                      </p>
                      {/* Násobek se ukazuje jen tam, kde po zaokrouhlení opravdu VÍC než 1×.
                          Jinak by web psal „přibližně 0,8× více" (nesmysl a navíc tvrzení,
                          že krátkodobě vyděláte míň, hned vedle slibu garance) nebo
                          „1,0× více". Tam, kde nájem vyjde stejně nebo výš, to řekneme
                          rovnou: je to pravda a zároveň to poptávku rovnou zatřídí. */}
                      {result.ratio > 0 && (
                        Math.round(result.ratio * 10) / 10 > 1 ? (
                          <p className="font-body text-[13px] text-primary-foreground/85 mt-2">
                            → {t(lang, "calc_approx_prefix")}{" "}
                            <strong className="text-gold">
                              {(Math.round(result.ratio * 10) / 10).toLocaleString("cs-CZ")}×{" "}
                            </strong>
                            {t(lang, "calc_vs_ltr")}
                          </p>
                        ) : (
                          <p className="font-body text-[13px] text-primary-foreground/85 mt-2">
                            {t(lang, "calc_ltr_higher")}
                          </p>
                        )
                      )}
                      {/* Benefit v korunách za rok. Pro majitele je „+192 000 Kč ročně"
                          hmatatelnější než „1,6×"; násobek zůstává nad tím jako důkaz.
                          Ukazuje se jen tam, kde je rozdíl kladný. */}
                      {result.r.high > result.ltr && (
                        <p className="font-body text-[15px] font-semibold text-gold mt-1 tnum">
                          +{(Math.round(((result.r.high - result.ltr) * 12) / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč{" "}
                          <span className="font-normal text-[13px] text-primary-foreground/70">
                            {t(lang, "calc_vs_ltr_year")}
                          </span>
                        </p>
                      )}
                    </div>

                    <p className="font-body text-[12px] text-primary-foreground/60 leading-relaxed border-t border-primary-foreground/10 pt-4">
                      {t(lang, "calc_terms_note")}
                    </p>
                  </div>
                  )}


                  <div className="space-y-3">
                    <a
                      href="#kontakt"
                      onClick={() => {
                        trackEvent("cta_click", { location: "calculator", target: "contact", district: location, size });
                        window.dispatchEvent(
                          new CustomEvent("antam:prefill-contact", {
                            detail: { location: locLabel(location), ctvrt: ctvrt ?? null, size: sizes.find((s) => s.value === size)?.label ?? "", m2,
                          calc: {
                            model_version: CALC_MODEL_VERSION,
                            district: location, ctvrt: ctvrt ?? null, dispozice: size,
                            size_bucket_id: bucket,
                            representative_m2: oversized ? null : m2,
                            bucket_label: bucketLabel,
                            oversized,
                            owner_low: result.r.supported ? result.r.low : null,
                            owner_high: result.r.supported ? result.r.high : null,
                            ltr_month: result.ltr || null,
                            ltr_ctvrt_factor: result.rentCtvrtFactor,
                          } },
                          })
                        );
                      }}
                      className="btn btn-primary-inverse w-full"
                    >
                      {t(lang, "calc_cta")}
                    </a>
                    <button
                      type="button"
                      onClick={shareResult}
                      className="mx-auto flex items-center gap-1.5 font-body text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors underline underline-offset-4 decoration-primary-foreground/25"
                    >
                      <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {shared ? t(lang, "calc_share_done") : t(lang, "calc_share")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>

        {/* Metodika za rozklikem na všech šířkách (brief 8/2026, bod 2); viditelná
            zůstává jen krátká věta, bez které by odhad mohl mást. */}
        <div className="mt-6 sm:mt-8 max-w-prose mx-auto border-t border-border/60 pt-4 sm:pt-5 space-y-2.5">
          <p className="font-body text-xs md:text-[13px] text-foreground/75 text-center leading-relaxed">
            {t(lang, "calc_disclaimer_short")}
          </p>
          <details className="group text-center">
            <summary className="list-none cursor-pointer inline-block font-body text-xs text-muted-foreground underline underline-offset-4 decoration-border [&::-webkit-details-marker]:hidden">
              {t(lang, "calc_disclaimer_toggle")}
            </summary>
            <p className="mt-3 font-body text-xs text-foreground/75 text-left leading-relaxed">
              {t(lang, "calc_disclaimer")}
            </p>
          </details>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
