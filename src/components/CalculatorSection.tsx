import { useState, useMemo, useEffect, type CSSProperties } from "react";
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

// Veřejné vstupy: lokalita → čtvrť (jen kde jsou data) → dispozice → velikost
// → volitelně sezóna. Samé klikání, nic se nepíše. Kapacita se neptá ani
// nezobrazuje. Model počítá rozpětí, ale VEŘEJNĚ se ukazuje JEDNO číslo:
// vršek rozpětí označený jako potenciál (1. 9. 2026). low/high žijí dál
// v ownerMonthly, ve stopě, v leadu, v grafu i v MCP — jen se nerenderují.
// Metodika, dělení 70/30, energie a krytí škod žijí v rozkliku pod sekcí
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
    // Formát odkazu se NEMĚNÍ (pořád m²), ale u „ještě většího" bytu se posílá
    // spodní hranice toho kbelíku místo typické plochy okresu. Do 1. 9. 2026 se
    // posílala typická plocha, takže se sdílený „posoudíme individuálně" otevřel
    // příjemci jako normální kbelík S ČÍSLEM. Oversized musí zůstat oversized.
    const shareM2 = oversized ? (bucketsFor(size).find((b) => b.id === bucket)?.minM2 ?? m2) : m2;
    const url = `${window.location.origin}${window.location.pathname}?byt=${location}-${ctvrt ?? "-"}-${size}-${shareM2}m-${season}#kalkulacka`;
    trackEvent("calc_share", { district: location, ctvrt: ctvrt ?? "-", size, m2: shareM2, season });
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
  // PRAVIDLO: čtvrť je nepovinné zpřesnění, ne další povinný krok.
  // Do 2. 9. 2026 tenhle řádek blokoval výsledek, dokud se čtvrť nevybrala.
  // Jenže pak by každý nový pull dat prodloužil trychtýř: přidáním Nového
  // Města (Praha 1 I Praha 2) by najednou musela odpovídat i Praha 2, která
  // se do té doby neptala na nic. Víc dat má dávat víc přesnosti, ne víc
  // otázek. Bez volby platí okresní odhad úplně stejně jako dřív —
  // `localCell` vrací pro `undefined` i `null` tutéž okresní buňku.
  // JEDNA podmínka pro obě věty o nájmu. Do 1. 9. 2026 měl násobek práh
  // „po zaokrouhlení nad 1×“, kdežto Kč/rok jen „high > ltr“, takže mezi
  // 1,00× a 1,05× (8 z 832 kombinací, typicky zimní sezóna) stránka psala
  // „dlouhodobý nájem vychází podobně nebo výše“ a hned pod tím zlatě
  // „+9 000 Kč ročně navíc“. Ani ratio, ani roční rozdíl se nepočítá jinak;
  // mění se jen to, kdy se ta dvojice vůbec ukáže.
  const ratioRounded = Math.round(result.ratio * 10) / 10;
  const betterThanLtr = result.ratio > 0 && ratioRounded > 1;
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
  const supported = result.r.supported && !oversized;

  // Co se ukládá k leadu. JEDNA definice pro obě CTA (dřív byl tentýž objekt
  // opsaný dvakrát a mohl se rozejít). low/high se sem posílají DÁL, i když se
  // veřejně nerenderují: bez nich se zpětně nedá underwritovat, co majitel viděl.
  const calcPayload = {
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
  };

  // Poptávka si snapshot bere při kliknutí na CTA. Když majitel potom ještě
  // přepne okres nebo velikost a teprve pak formulář odešle, lead by nesl
  // ČÍSLO, které už na stránce není. Tenhle event drží snapshot v poptávce
  // synchronně se stavem kalkulačky — ale jen tam, kde už nějaký je, aby se
  // k leadu nelepil výchozí stav někomu, kdo kalkulačku vůbec nepoužil.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("antam:calc-state", { detail: calcPayload }));
  });

  return (
    <section id="kalkulacka" className="section bg-secondary scroll-mt-20">
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
              <label htmlFor="calc-location" id="calc-location-label" className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <MapPin className="w-4 h-4 text-gold" />
                {t(lang, "calc_location")}
              </label>
              {/* Mobile: native select (úspora místa) */}
              <select
                id="calc-location"
                value={location}
                onChange={(e) => setLocation(e.target.value as CalcLoc)}
                className="sm:hidden w-full min-w-0 max-w-full px-4 py-3 bg-card border border-border rounded-sm font-body text-sm font-medium text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{locLabel(l)}</option>
                ))}
              </select>
              {/* Desktop: tlačítka */}
              <div role="group" aria-labelledby="calc-location-label" className="hidden sm:grid sm:grid-cols-3 gap-2">
                {LOCATIONS.map((l) => (
                  <button key={l} type="button" onClick={() => setLocation(l)}
                    aria-pressed={location === l}
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

            {/* Čtvrť: jen tam, kde pro ni máme vlastní tržní data. NEPOVINNÉ
                zpřesnění — bez volby platí okresní odhad. Nabídka se řídí
                `ctvrtiOf(location)`, takže další čtvrti (Žižkov, Smíchov,
                Karlín…) se objeví samy, aniž by komukoli přibyl krok. */}
            {needsCtvrt && (
              <div id="kalkulacka-ctvrt" className="scroll-mt-24">
                <p id="calc-area-label" className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                  <MapPin className="w-4 h-4 text-gold" />
                  {t(lang, "calc_area")}
                </p>
                <div role="group" aria-labelledby="calc-area-label" className="flex flex-wrap gap-2">
                  {ctvrtiOf(location).map((c) => (
                    <button key={c.id} type="button" onClick={() => setCtvrt(c.id)}
                      aria-pressed={ctvrt === c.id}
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
                    aria-pressed={ctvrt === null}
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
              <p id="calc-disposition-label" className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-1.5">
                <Home className="w-4 h-4 text-gold" />
                {t(lang, "calc_size")}
              </p>
              <div role="group" aria-labelledby="calc-disposition-label" className="grid grid-cols-4 gap-2">
                {sizes.map((s) => (
                  <button key={s.value} type="button" onClick={() => pickSize(s.value)}
                    aria-pressed={size === s.value}
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
              <p id="calc-size-label" className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <Ruler className="w-4 h-4 text-gold" />
                {t(lang, "calc_m2")}
              </p>
              <div id="calc-size" role="group" aria-labelledby="calc-size-label" aria-describedby="calc-size-hint" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              <p id="calc-size-hint" className="mt-2 font-body text-[12.5px] text-muted-foreground leading-snug">{t(lang, "calc_size_hint")}</p>
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
                    aria-pressed={season === key}
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

          {/* POŘADÍ NA MOBILU (2A): karta výsledku šla na telefonu PŘED vstupy
              (order-1), takže sekce začínala tmavým panelem „Vyberte prosím
              lokalitu“ a teprve pod ním byly ovladače, kterými se ta lokalita
              vybírá. Dokud číslo není, patří karta ZA vstupy; jakmile je
              (nebo jde o poctivé zavření pro nepodporovanou lokalitu či
              nadměrný byt), zůstává nahoře jako vrchol sekce. Na desktopu se
              nemění nic: vstupy vlevo, karta vpravo.
              className MUSÍ zůstat konstantní: .is-in přidává na tenhle prvek
              IntersectionObserver z Reveal.tsx přímo do classListu, takže
              kdyby React při změně stavu přepsal class atribut, karta by se
              schovala (opacity 0) přesně ve chvíli, kdy se objeví číslo.
              Pořadí proto jde přes --calc-order a .calc-result v index.css. */}
          <Reveal
            delay={0.1}
            style={{ "--calc-order": 1 } as CSSProperties}
            className="calc-result flex items-start md:sticky md:top-24"
          >
            <div className="w-full bg-gradient-dark rounded-md p-5 sm:p-7 md:p-9 space-y-4 sm:space-y-5">
              {!supported ? (
                /* Lokalita bez vlastních tržních dat: žádné číslo, poctivé
                   zavření s cestou k propočtu do 24 hodin. */
                <div className="space-y-4">
                  {/* ŽÁDNÝ eyebrow „Potenciál příjmu s Antam Homes" (1. 9. 2026):
                      ohlašoval potenciál nad větou, že pro tuhle lokalitu číslo
                      nemáme. Titulek si stav řekne sám. */}
                  <p className="font-display text-2xl sm:text-[1.75rem] font-semibold text-primary-foreground leading-snug text-balance">
                    {t(lang, oversized ? "calc_oversized_title" : "calc_unsupported_title")}
                  </p>
                  <p className="font-body text-[14.5px] text-primary-foreground/80 leading-relaxed">
                    {t(lang, oversized ? "calc_oversized_text" : "calc_unsupported_text")}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[13px] text-primary-foreground/70">
                    <span>{locLabel(location)}</span>
                    <a href="#kalkulacka-zadani" className="ml-1 inline-flex items-center gap-1 underline underline-offset-4 decoration-primary-foreground/30 hover:text-primary-foreground">
                      <Pencil className="w-3 h-3" aria-hidden="true" />
                      {t(lang, "calc_edit")}
                    </a>
                  </p>
                  {/* Nepodporovaná lokalita a nadměrný byt vedou na #kontakt: tam
                      je to poctivé zavření, ne obejití. Větev „nevybraná čtvrť“
                      tu byla do 2. 9. 2026, kdy čtvrť přestala být povinná —
                      nezodpovězený stav už žádný není. */}
                  <a
                    href="#kontakt"
                    onClick={() => {
                      trackEvent("cta_click", { location: "calculator_unsupported", target: "contact", district: location, size });
                      window.dispatchEvent(new CustomEvent("antam:prefill-contact", {
                        detail: { location: locLabel(location), ctvrt: ctvrt ?? null, size: sizes.find((s) => s.value === size)?.label ?? "", m2,
                          calc: calcPayload },
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
                      {/* HEADLINE = dosažitelný vršek UŽ SPOČÍTANÉHO rozpětí (31. 8. 2026),
                          označený jako POTENCIÁL. Od 1. 9. 2026 je to JEDINÉ veřejné číslo:
                          rozpětí „odhadované rozpětí X až Y“ se přestalo renderovat, protože
                          veřejně nemáme čím ty dva konce odlišit tak, aby to majiteli něco
                          řeklo. NEMĚNÍ se tím žádný předpoklad ani žádné číslo: low i high
                          se dál počítají a jdou do stopy, do leadu, do grafu i do MCP.
                          Rozpětí se NENAHRAZUJE jinou formou nejistoty („od X“, „až X“,
                          pásmo spolehlivosti): veřejný výsledek je záměrně jedno číslo. */}
                      <p className="flex flex-wrap items-baseline gap-x-2 leading-tight tnum">
                        <span className="font-display text-[2.25rem] min-[360px]:text-[2.75rem] sm:text-5xl md:text-[3.25rem] font-bold text-gradient-gold-on-dark whitespace-nowrap">
                          ~{(Math.round(result.r.high / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč
                        </span>
                        <span className="font-body text-sm font-normal text-primary-foreground/65 whitespace-nowrap">
                          {t(lang, "calc_month_suffix")}
                        </span>
                      </p>
                      {/* Benefit v Kč za rok hned pod headline: pro majitele je
                          „+192 000 Kč ročně“ hmatatelnější než násobek, a je to
                          druhý nejsilnější prvek karty. Stejná podmínka jako
                          u násobku níž, aby si ty dvě věty neodporovaly. */}
                      {betterThanLtr && (
                        <p className="mt-2 font-body text-[15px] sm:text-base font-semibold text-gold tnum">
                          +{(Math.round(((result.r.high - result.ltr) * 12) / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč{" "}
                          <span className="font-normal text-[13px] text-primary-foreground/70">
                            {t(lang, "calc_vs_ltr_year")}
                          </span>
                        </p>
                      )}
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
                      {/* Shrnutí vstupů na VŠECH šířkách (1. 9. 2026). Do té doby bylo
                          md:hidden, takže na desktopu nebylo vidět, se kterou čtvrtí
                          a sezónou se počítalo — obojí přitom mění výsledné číslo. */}
                      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[13px] text-primary-foreground/70">
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
                          rovnou: je to pravda a zároveň to poptávku rovnou zatřídí.
                          TÁŽ podmínka řídí i řádek Kč/rok nahoře pod headline. */}
                      {result.ratio > 0 && (
                        betterThanLtr ? (
                          <p className="font-body text-[13px] text-primary-foreground/85 mt-2">
                            → {t(lang, "calc_approx_prefix")}{" "}
                            <strong className="text-gold">
                              {ratioRounded.toLocaleString("cs-CZ")}×{" "}
                            </strong>
                            {t(lang, "calc_vs_ltr")}
                          </p>
                        ) : (
                          <p className="font-body text-[13px] text-primary-foreground/85 mt-2">
                            {t(lang, "calc_ltr_higher")}
                          </p>
                        )
                      )}
                    </div>

                    {/* Odměna, úklid a energie se z karty vypustily (2B):
                        vlastní je Ceník, který stojí hned za Srovnáním. Karta
                        drží jen to, co je o BYTĚ návštěvníka: číslo, roční
                        rozdíl proti nájmu, násobek a shrnutí vstupů. */}
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
                          calc: calcPayload },
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
                      className="flex items-center gap-1.5 font-body text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors underline underline-offset-4 decoration-primary-foreground/25"
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
          <p className="font-body text-xs md:text-[13px] text-foreground/75 leading-relaxed">
            {t(lang, "calc_disclaimer_short")}
          </p>
          <details className="group">
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
